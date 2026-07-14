<?php

declare(strict_types=1);

namespace App\Controller\Api\Admin;

use App\Entity\Order;
use App\Repository\OrderRepository;
use App\Repository\ProductReviewRepository;
use App\Repository\SupportTicketRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin/notifications', name: 'api_admin_notifications', methods: ['GET'])]
class NotificationsController extends AbstractController
{
    public function __invoke(
        OrderRepository $orderRepo,
        SupportTicketRepository $ticketRepo,
        ProductReviewRepository $reviewRepo,
    ): JsonResponse {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        $byStatus = $orderRepo->countByStatus();

        return $this->json([
            'pendingOrders'  => $byStatus[Order::STATUS_PENDING] ?? 0,
            'openTickets'    => $ticketRepo->countOpen(),
            'pendingReviews' => $reviewRepo->countPendingApproval(),
        ]);
    }
}
