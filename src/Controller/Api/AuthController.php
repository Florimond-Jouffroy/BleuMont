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
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;

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

        if (!$user->isVerified()) {
            return $this->json(
                ['message' => 'Veuillez vérifier votre adresse e-mail avant de vous connecter.', 'code' => 'email_not_verified'],
                Response::HTTP_FORBIDDEN,
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
        MailerInterface $mailer,
        UrlGeneratorInterface $urlGenerator,
    ): JsonResponse {
        $user = $this->userManager->createFromDto($dto);

        if (!$user) {
            return $this->json(
                ['message' => 'Une erreur est survenue lors de la création du compte.'],
                Response::HTTP_INTERNAL_SERVER_ERROR,
            );
        }

        $this->sendVerificationEmail($user->getEmail(), $user->getVerificationToken(), $mailer, $urlGenerator);

        return $this->json(
            ['message' => 'Compte créé. Vérifiez votre boîte e-mail pour activer votre compte.'],
            Response::HTTP_CREATED,
        );
    }

    #[Route('/verify-email/resend', name: 'api_auth_verify_email_resend', methods: ['POST'])]
    public function resendVerification(
        Request $request,
        UserRepository $userRepository,
        MailerInterface $mailer,
        UrlGeneratorInterface $urlGenerator,
    ): JsonResponse {
        $body  = json_decode((string) $request->getContent(), true);
        $email = $body['email'] ?? '';

        $user = $userRepository->findOneBy(['email' => $email]);

        // Réponse neutre dans tous les cas
        if ($user && !$user->isVerified() && $user->getVerificationToken()) {
            $this->sendVerificationEmail($user->getEmail(), $user->getVerificationToken(), $mailer, $urlGenerator);
        }

        return $this->json(['message' => 'Si ce compte existe et n\'est pas encore vérifié, un nouvel e-mail a été envoyé.']);
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

        if (!$user) {
            return $this->json(['message' => 'Si cette adresse est associée à un compte, un code vous a été envoyé.']);
        }

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

    private function sendVerificationEmail(string $to, string $token, MailerInterface $mailer, UrlGeneratorInterface $urlGenerator): void
    {
        $verificationUrl = $urlGenerator->generate(
            'app_security_verify_email',
            ['token' => $token],
            UrlGeneratorInterface::ABSOLUTE_URL,
        );

        $fromAddress = $_ENV['MAILER_FROM'] ?? 'noreply@localhost';

        $email = (new TemplatedEmail())
            ->from(new Address($fromAddress))
            ->to(new Address($to))
            ->subject('Confirmez votre adresse e-mail')
            ->htmlTemplate('emails/email_verification.html.twig')
            ->context(['verificationUrl' => $verificationUrl]);

        $mailer->send($email);
    }
}
