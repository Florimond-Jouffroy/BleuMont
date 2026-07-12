<?php

declare(strict_types=1);

namespace App\Controller\Api\Admin;

use App\Entity\Order;
use App\Repository\OrderRepository;
use App\Security\Voter\OrderVoter;
use App\Service\Manager\OrderManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin/orders')]
class OrderController extends AbstractController
{
    public function __construct(private readonly OrderManager $manager)
    {
    }

    #[Route('', name: 'api_admin_orders_list', methods: ['GET'])]
    public function list(Request $request, OrderRepository $repository): JsonResponse
    {
        $this->denyAccessUnlessGranted(OrderVoter::VIEW);

        $page       = max(1, $request->query->getInt('page', 1));
        $pageSize   = min(100, max(1, $request->query->getInt('pageSize', 20)));
        $query      = $request->query->getString('q');
        $status     = $request->query->getString('status') ?: null;
        $customerId = $request->query->getInt('customerId') ?: null;

        $result = $repository->searchPaginated('' !== $query ? $query : null, $page, $pageSize, $status, $customerId);

        return $this->json([
            'items'    => array_map($this->serializeList(...), $result['items']),
            'total'    => $result['total'],
            'page'     => $page,
            'pageSize' => $pageSize,
        ]);
    }

    #[Route('/{id}', name: 'api_admin_orders_get', methods: ['GET'])]
    public function get(Order $order): JsonResponse
    {
        $this->denyAccessUnlessGranted(OrderVoter::VIEW);

        return $this->json($this->serializeFull($order));
    }

    #[Route('/{id}/transition', name: 'api_admin_orders_transition', methods: ['POST'])]
    public function transition(Order $order, Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted(OrderVoter::EDIT);

        $payload = $request->toArray();
        $status  = trim((string) ($payload['status'] ?? ''));
        $comment = trim((string) ($payload['comment'] ?? '')) ?: null;

        if (!in_array($status, Order::STATUSES, true)) {
            return $this->json(['message' => 'Statut invalide.'], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (!$order->canTransitionTo($status)) {
            return $this->json([
                'message' => sprintf('Transition "%s" → "%s" non autorisée.', $order->getStatus(), $status),
            ], Response::HTTP_UNPROCESSABLE_ENTITY);
        }

        if (!$this->manager->transition($order, $status, $comment)) {
            return $this->json(['message' => 'Une erreur est survenue.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->json($this->serializeFull($order));
    }

    #[Route('/{id}/note', name: 'api_admin_orders_note', methods: ['PATCH'])]
    public function updateNote(Order $order, Request $request): JsonResponse
    {
        $this->denyAccessUnlessGranted(OrderVoter::EDIT);

        $payload = $request->toArray();
        $note    = isset($payload['internalNote']) && '' !== trim((string) $payload['internalNote'])
            ? trim((string) $payload['internalNote'])
            : null;

        if (!$this->manager->updateInternalNote($order, $note)) {
            return $this->json(['message' => 'Une erreur est survenue.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->json($this->serializeFull($order));
    }

    #[Route('/{id}', name: 'api_admin_orders_delete', methods: ['DELETE'])]
    public function delete(Order $order): JsonResponse
    {
        $this->denyAccessUnlessGranted(OrderVoter::DELETE);

        if (!$this->manager->delete($order)) {
            return $this->json(['message' => 'Une erreur est survenue.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return $this->json(null, Response::HTTP_NO_CONTENT);
    }

    /** @return array<string, mixed> */
    private function serializeList(Order $order): array
    {
        $customer = $order->getCustomer();

        return [
            'id'          => $order->getId(),
            'orderNumber' => $order->getOrderNumber(),
            'status'      => $order->getStatus(),
            'total'       => $order->getTotal(),
            'itemCount'   => $order->getItems()->count(),
            'customer'    => [
                'id'       => $customer->getId(),
                'fullName' => $customer->getFullName(),
                'email'    => $customer->getEmail(),
            ],
            'createdAt'   => $order->getCreatedAt()->format(\DateTimeInterface::ATOM),
            'updatedAt'   => $order->getUpdatedAt()->format(\DateTimeInterface::ATOM),
        ];
    }

    /** @return array<string, mixed> */
    private function serializeFull(Order $order): array
    {
        $items = array_map(static fn (mixed $item) => [
            'id'          => $item->getId(),
            'productName' => $item->getProductName(),
            'variantName' => $item->getVariantName(),
            'unitPrice'   => $item->getUnitPrice(),
            'quantity'    => $item->getQuantity(),
            'total'       => $item->getTotal(),
            'productId'   => $item->getProduct()?->getId(),
        ], $order->getItems()->toArray());

        $history = array_map(static fn (mixed $h) => [
            'id'        => $h->getId(),
            'status'    => $h->getStatus(),
            'comment'   => $h->getComment(),
            'createdAt' => $h->getCreatedAt()->format(\DateTimeInterface::ATOM),
        ], $order->getStatusHistory()->toArray());

        $customer = $order->getCustomer();

        return array_merge($this->serializeList($order), [
            'subtotal'        => $order->getSubtotal(),
            'discountAmount'  => $order->getDiscountAmount(),
            'shippingAmount'  => $order->getShippingAmount(),
            'promoCode'       => $order->getPromoCode(),
            'shippingAddress' => $order->getShippingAddress(),
            'billingAddress'  => $order->getBillingAddress(),
            'customerNote'    => $order->getCustomerNote(),
            'internalNote'    => $order->getInternalNote(),
            'allowedTransitions' => Order::TRANSITIONS[$order->getStatus()] ?? [],
            'customer'        => [
                'id'        => $customer->getId(),
                'fullName'  => $customer->getFullName(),
                'email'     => $customer->getEmail(),
                'phone'     => $customer->getPhone(),
            ],
            'items'           => array_values($items),
            'statusHistory'   => array_values($history),
        ]);
    }
}
