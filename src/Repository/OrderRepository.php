<?php

declare(strict_types=1);

namespace App\Repository;

use App\Entity\Order;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * Requêtes Doctrine pour l'entité Order.
 *
 * @extends ServiceEntityRepository<Order>
 */
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

    /**
     * Retourne le prochain numéro de séquence pour générer un numéro de commande.
     * Utilise COUNT+1, ce qui suffit pour un usage admin à faible concurrence.
     * Note : des suppressions de commandes peuvent créer des "trous" dans la séquence,
     * c'est intentionnel et sans impact fonctionnel.
     */
    public function getNextSequence(): int
    {
        $result = $this->createQueryBuilder('o')
            ->select('COUNT(o.id)')
            ->getQuery()
            ->getSingleScalarResult();

        return (int) $result + 1;
    }

    /**
     * Recherche paginée avec filtres optionnels.
     * La jointure sur customer est systématique car la recherche textuelle
     * porte sur le nom et l'email du client.
     *
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

    /**
     * Retourne le nombre de commandes par statut.
     * Utilisé par le dashboard e-commerce pour afficher les compteurs rapides.
     *
     * @return array<string, int> statut => nombre de commandes
     */
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
