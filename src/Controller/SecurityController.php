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
                'login'         => $this->generateUrl('api_auth_login'),
                'redirect'      => $this->generateUrl('app_home'),
                'forgotPassword' => $this->generateUrl('app_security_forgot_password'),
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

    #[Route('/deconnexion', name: 'logout')]
    public function logout(): never
    {
        throw new \LogicException('Intercepted by the firewall logout handler.');
    }

    #[Route('/mot-de-passe-oublie', name: 'forgot_password', methods: ['GET'])]
    public function forgotPassword(): Response
    {
        if ($this->getUser()) {
            return $this->redirectToRoute('app_home');
        }

        return $this->render('security/forgot-password.html.twig', [
            'urls' => [
                'request' => $this->generateUrl('api_auth_reset_password_request'),
                'confirm' => $this->generateUrl('api_auth_reset_password_confirm'),
                'login'   => $this->generateUrl('app_security_login'),
            ],
        ]);
    }
}
