<?php

declare(strict_types=1);

namespace App\Controller;



use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class AdminController extends AbstractController
{
    #[Route('/admin', name: 'app_admin')]
    #[Route('/admin/{path}', name: 'app_admin_path', requirements: ['path' => '.+'])]
    public function index(): Response
    {
        $this->denyAccessUnlessGranted('ROLE_ADMIN');

        /** @var \App\Entity\User $user */
        $user = $this->getUser();

        return $this->render('admin/shell.html.twig', [
            'userEmail'   => $user->getEmail(),
            'logoutUrl'   => $this->generateUrl('app_security_logout'),
        ]);
    }
}
