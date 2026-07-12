<?php

declare(strict_types=1);

namespace App\Service\Manager;

use App\Entity\Customer;
use App\Entity\Order;
use App\Entity\OrderItem;
use App\Entity\OrderStatusHistory;
use App\Repository\OrderRepository;
use Doctrine\ORM\EntityManagerInterface;
use Florimond\LogBundle\Service\Manager\ApplicationLogManager;

class OrderManager
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly ApplicationLogManager $logManager,
        private readonly OrderRepository $orderRepository,
    ) {
    }

    /**
     * @param array<array{productName: string, variantName?: string|null, unitPrice: int, quantity: int, productId?: int|null, variantId?: int|null}> $items
     * @param array<string, string> $shippingAddress
     * @param array<string, string>|null $billingAddress
     */
    public function create(
        Customer $customer,
        array $items,
        array $shippingAddress,
        ?array $billingAddress = null,
        int $shippingAmount = 0,
        int $discountAmount = 0,
        ?string $promoCode = null,
        ?string $customerNote = null,
    ): ?Order {
        $order = new Order();
        $order->setOrderNumber($this->generateOrderNumber());
        $order->setCustomer($customer);
        $order->setShippingAddress($shippingAddress);
        $order->setBillingAddress($billingAddress);
        $order->setShippingAmount($shippingAmount);
        $order->setDiscountAmount($discountAmount);
        $order->setPromoCode($promoCode);
        $order->setCustomerNote($customerNote);

        foreach ($items as $itemData) {
            $item = new OrderItem();
            $item->setOrder($order);
            $item->setProductName($itemData['productName']);
            $item->setVariantName($itemData['variantName'] ?? null);
            $item->setUnitPrice($itemData['unitPrice']);
            $item->setQuantity($itemData['quantity']);
            $item->recalculateTotal();
            $this->em->persist($item);
        }

        $order->recalculateTotal();

        $history = new OrderStatusHistory();
        $history->setOrder($order);
        $history->setStatus(Order::STATUS_PENDING);
        $history->setComment('Commande créée.');
        $this->em->persist($history);

        $this->em->persist($order);

        return $this->flush() ? $order : null;
    }

    public function transition(Order $order, string $newStatus, ?string $comment = null): bool
    {
        if (!$order->canTransitionTo($newStatus)) {
            return false;
        }

        $order->setStatus($newStatus);

        $history = new OrderStatusHistory();
        $history->setOrder($order);
        $history->setStatus($newStatus);
        $history->setComment($comment);
        $this->em->persist($history);

        return $this->flush();
    }

    public function updateInternalNote(Order $order, ?string $note): bool
    {
        $order->setInternalNote($note);

        return $this->flush();
    }

    public function delete(Order $order): bool
    {
        $this->em->remove($order);

        return $this->flush();
    }

    private function generateOrderNumber(): string
    {
        $seq = $this->orderRepository->getNextSequence();

        return sprintf('ORD-%s-%05d', date('Ymd'), $seq);
    }

    private function flush(): bool
    {
        try {
            $this->em->flush();
        } catch (\Throwable $e) {
            $this->logManager->reportException($e);

            return false;
        }

        return true;
    }
}
