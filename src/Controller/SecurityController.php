<?php

declare(strict_types=1);

namespace App\Controller;

use App\Repository\UserRepository;
use App\Service\Manager\UserManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
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
                'login' => $this->generateUrl('api_auth_login'),
                'redirect' => $this->generateUrl('app_home'),
                'forgotPassword' => $this->generateUrl('app_security_forgot_password'),
                'register' => $this->generateUrl('app_security_register'),
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
                'resend' => $this->generateUrl('api_auth_verify_email_resend'),
                'login' => $this->generateUrl('app_security_login'),
            ],
        ]);
    }

    #[Route('/verify-email', name: 'verify_email', methods: ['GET'])]
    public function verifyEmail(
        Request $request,
        UserRepository $userRepository,
        UserManager $userManager,
    ): Response {
        $token = $request->query->getString('token');
        $user = $token ? $userRepository->findOneBy(['verificationToken' => $token]) : null;

        $success = $user && !$user->isVerified() && $userManager->verifyEmail($user);

        return $this->render('security/verify-email.html.twig', [
            'success' => $success,
            'loginUrl' => $this->generateUrl('app_security_login'),
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
                'login' => $this->generateUrl('app_security_login'),
            ],
        ]);
    }
}
