<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Dto\ConfirmPasswordResetDto;
use App\Dto\LoginDto;
use App\Dto\RegisterDto;
use App\Dto\RequestPasswordResetDto;
use App\Entity\PasswordResetToken;
use App\Repository\PasswordResetTokenRepository;
use App\Repository\UserRepository;
use App\Security\LoginAuthenticator;
use App\Service\Manager\UserManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/auth')]
class AuthController extends AbstractController
{
    public function __construct(
        private readonly UserManager $userManager,
    ) {}

    #[Route('/login', name: 'api_auth_login', methods: ['POST'])]
    public function login(
        #[MapRequestPayload] LoginDto $dto,
        UserRepository $userRepository,
        UserPasswordHasherInterface $passwordHasher,
        Security $security,
    ): JsonResponse {
        $user = $userRepository->findOneBy(['email' => $dto->email]);

        if (!$user || !$passwordHasher->isPasswordValid($user, $dto->password)) {
            return $this->json(
                ['message' => 'Identifiants incorrects.'],
                Response::HTTP_UNAUTHORIZED,
            );
        }

        $security->login($user, LoginAuthenticator::class);

        return $this->json([
            'id'    => $user->getId(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
        ]);
    }

    #[Route('/register', name: 'api_auth_register', methods: ['POST'])]
    public function register(
        #[MapRequestPayload] RegisterDto $dto,
        Security $security,
    ): JsonResponse {
        $user = $this->userManager->createFromDto($dto);

        if (!$user) {
            return $this->json(
                ['message' => 'Une erreur est survenue lors de la création du compte.'],
                Response::HTTP_INTERNAL_SERVER_ERROR,
            );
        }

        $security->login($user, LoginAuthenticator::class);

        return $this->json(
            ['id' => $user->getId(), 'email' => $user->getEmail()],
            Response::HTTP_CREATED,
        );
    }

    #[Route('/reset-password/request', name: 'api_auth_reset_password_request', methods: ['POST'])]
    public function requestPasswordReset(
        #[MapRequestPayload] RequestPasswordResetDto $dto,
        UserRepository $userRepository,
        PasswordResetTokenRepository $tokenRepository,
        EntityManagerInterface $em,
        MailerInterface $mailer,
    ): JsonResponse {
        $user = $userRepository->findOneBy(['email' => $dto->email]);

        // Toujours retourner 200 pour ne pas révéler l'existence du compte
        if (!$user) {
            return $this->json(['message' => 'Si cette adresse est associée à un compte, un code vous a été envoyé.']);
        }

        // Supprimer les anciens tokens de cet utilisateur
        $tokenRepository->deleteByUser($user);

        $code  = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $token = new PasswordResetToken($user, $code, new \DateTimeImmutable('+15 minutes'));

        $em->persist($token);
        $em->flush();

        $fromAddress = $_ENV['MAILER_FROM'] ?? 'noreply@localhost';

        $email = (new TemplatedEmail())
            ->from(new Address($fromAddress))
            ->to(new Address($user->getEmail()))
            ->subject('Réinitialisation de votre mot de passe')
            ->htmlTemplate('emails/password_reset.html.twig')
            ->context(['code' => $code]);

        $mailer->send($email);

        return $this->json(['message' => 'Si cette adresse est associée à un compte, un code vous a été envoyé.']);
    }

    #[Route('/reset-password/confirm', name: 'api_auth_reset_password_confirm', methods: ['POST'])]
    public function confirmPasswordReset(
        #[MapRequestPayload] ConfirmPasswordResetDto $dto,
        UserRepository $userRepository,
        PasswordResetTokenRepository $tokenRepository,
        EntityManagerInterface $em,
        UserPasswordHasherInterface $passwordHasher,
    ): JsonResponse {
        $user = $userRepository->findOneBy(['email' => $dto->email]);

        if (!$user) {
            return $this->json(
                ['message' => 'Code invalide ou expiré.'],
                Response::HTTP_UNPROCESSABLE_ENTITY,
            );
        }

        $token = $tokenRepository->findValidToken($user, $dto->code);

        if (!$token) {
            return $this->json(
                ['message' => 'Code invalide ou expiré.'],
                Response::HTTP_UNPROCESSABLE_ENTITY,
            );
        }

        $user->setPassword($passwordHasher->hashPassword($user, $dto->newPassword));
        $token->markAsUsed();

        $em->flush();

        return $this->json(['message' => 'Votre mot de passe a été réinitialisé avec succès.']);
    }
}
