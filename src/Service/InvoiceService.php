<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Invoice;
use App\Entity\Order;
use App\Repository\AppSettingRepository;
use App\Repository\InvoiceRepository;
use Dompdf\Dompdf;
use Dompdf\Options;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Twig\Environment;

class InvoiceService
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly InvoiceRepository $invoiceRepo,
        private readonly AppSettingRepository $settingRepo,
        private readonly Environment $twig,
        #[Autowire('%app.company%')] private readonly array $company,
    ) {
    }

    public function getInvoiceTrigger(): string
    {
        return $this->settingRepo->getValue('invoice.trigger', 'on_order');
    }

    public function setInvoiceTrigger(string $trigger): void
    {
        if (!in_array($trigger, ['on_order', 'on_confirm'], true)) {
            throw new \InvalidArgumentException("Trigger invalide : {$trigger}");
        }
        $this->settingRepo->setValue('invoice.trigger', $trigger);
    }

    public function findForOrder(Order $order): ?Invoice
    {
        return $this->invoiceRepo->findOneByOrder($order);
    }

    public function generateForOrder(Order $order): Invoice
    {
        $existing = $this->invoiceRepo->findOneByOrder($order);
        if (null !== $existing) {
            return $existing;
        }

        $taxRate    = 20;
        $divisor    = 1 + $taxRate / 100; // 1.2

        // HT amounts computed from TTC (amounts stored inclusive of VAT)
        $subtotalHt     = (int) round($order->getSubtotal() / $divisor);
        $shippingHt     = (int) round($order->getShippingAmount() / $divisor);
        $discountAmount = $order->getDiscountAmount();
        $totalTtc       = $order->getTotal();
        $totalHt        = (int) round($totalTtc / $divisor);
        $taxAmount      = $totalTtc - $totalHt;

        $invoice = new Invoice();
        $invoice
            ->setInvoiceNumber($this->generateInvoiceNumber())
            ->setOrder($order)
            ->setStatus(Invoice::STATUS_PENDING)
            ->setIssuedAt(new \DateTimeImmutable())
            ->setSubtotalHt($subtotalHt)
            ->setShippingHt($shippingHt)
            ->setDiscountAmount($discountAmount)
            ->setTotalHt($totalHt)
            ->setTaxRate($taxRate)
            ->setTaxAmount($taxAmount)
            ->setTotalTtc($totalTtc)
            ->setBillingAddress($order->getBillingAddress() ?? $order->getShippingAddress());

        $this->em->persist($invoice);
        $this->em->flush();

        return $invoice;
    }

    public function generatePdf(Invoice $invoice): string
    {
        $order   = $invoice->getOrder();
        $taxRate = $invoice->getTaxRate();
        $divisor = 1 + $taxRate / 100;

        $lines = [];
        foreach ($order->getItems() as $item) {
            $unitPriceHt = (int) round($item->getUnitPrice() / $divisor);
            $lines[] = [
                'name'         => $item->getProductName(),
                'variant'      => $item->getVariantName(),
                'qty'          => $item->getQuantity(),
                'unitPriceHt'  => $unitPriceHt,
                'unitPriceTtc' => $item->getUnitPrice(),
                'totalHt'      => $unitPriceHt * $item->getQuantity(),
                'totalTtc'     => $item->getTotal(),
            ];
        }

        $html = $this->twig->render('pdf/invoice.html.twig', [
            'invoice' => $invoice,
            'order'   => $order,
            'lines'   => $lines,
            'company' => $this->company,
        ]);

        $options = new Options();
        $options->set('defaultFont', 'DejaVu Sans');
        $options->set('isHtml5ParserEnabled', true);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();

        return (string) $dompdf->output();
    }

    private function generateInvoiceNumber(): string
    {
        $year = (int) date('Y');
        $max  = $this->invoiceRepo->getMaxSequenceForYear($year);

        return sprintf('FACT-%d-%05d', $year, $max + 1);
    }
}
