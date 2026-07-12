<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class ShopController extends AbstractController
{
    #[Route('/boutique', name: 'shop_index')]
    #[Route('/boutique/{path}', name: 'shop_catchall', requirements: ['path' => '.+'])]
    public function index(): Response
    {
        return $this->render('shop/shell.html.twig', [
            'urls' => [
                'products'   => $this->generateUrl('api_shop_products_list'),
                'categories' => $this->generateUrl('api_shop_categories_list'),
            ],
        ]);
    }
}
