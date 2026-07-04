<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

#[Route('', name: 'app_security_')]
class SecurityController extends AbstractController
{
    #[Route('/connexion', name: 'login', methods: ['GET'])]
    public function login(): Response
    {
        if ($this->getUser()) {
            return $this->redirectToRoute('app_home');
        }

        return $this->render('security/login.html.twig', [
            'urls' => [
                'login'    => $this->generateUrl('api_auth_login'),
                'redirect' => $this->generateUrl('app_home'),
            ],
        ]);
    }

    #[Route('/inscription', name: 'register', methods: ['GET'])]
    public function register(): Response
    {
        if ($this->getUser()) {
            return $this->redirectToRoute('app_home');
        }

        return $this->render('security/register.html.twig', [
            'urls' => [
                'register' => $this->generateUrl('api_auth_register'),
                'redirect' => $this->generateUrl('app_home'),
            ],
        ]);
    }
}
