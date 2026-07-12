<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Order;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/** @extends ServiceEntityRepository<Order> */
class OrderRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Order::class);
    }

    public function findByOrderNumber(string $number): ?Order
    {
        return $this->findOneBy(['orderNumber' => $number]);
    }

    public function getNextSequence(): int
    {
        $result = $this->createQueryBuilder('o')
            ->select('COUNT(o.id)')
            ->getQuery()
            ->getSingleScalarResult();

        return (int) $result + 1;
    }

    /**
     * @return array{items: list<Order>, total: int}
     */
    public function searchPaginated(
        ?string $query,
        int $page,
        int $pageSize,
        ?string $status = null,
        ?int $customerId = null,
    ): array {
        $qb = $this->createQueryBuilder('o')
            ->join('o.customer', 'c')
            ->orderBy('o.createdAt', 'DESC');

        if (null !== $query && '' !== $query) {
            $qb->andWhere('o.orderNumber LIKE :q OR c.email LIKE :q OR c.firstName LIKE :q OR c.lastName LIKE :q')
                ->setParameter('q', '%'.$query.'%');
        }

        if (null !== $status) {
            $qb->andWhere('o.status = :status')->setParameter('status', $status);
        }

        if (null !== $customerId) {
            $qb->andWhere('c.id = :cid')->setParameter('cid', $customerId);
        }

        $total = (int) (clone $qb)->select('COUNT(o.id)')->getQuery()->getSingleScalarResult();

        /** @var list<Order> $items */
        $items = $qb
            ->setFirstResult(($page - 1) * $pageSize)
            ->setMaxResults($pageSize)
            ->getQuery()
            ->getResult();

        return ['items' => $items, 'total' => $total];
    }

    /** @return array<string, int> status => count */
    public function countByStatus(): array
    {
        $rows = $this->createQueryBuilder('o')
            ->select('o.status, COUNT(o.id) as cnt')
            ->groupBy('o.status')
            ->getQuery()
            ->getArrayResult();

        $result = [];
        foreach ($rows as $row) {
            $result[$row['status']] = (int) $row['cnt'];
        }

        return $result;
    }
}
