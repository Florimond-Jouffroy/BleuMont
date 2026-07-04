<?php

declare(strict_types=1);

namespace App\Controller\Api;

use App\Dto\LoginDto;
use App\Dto\RegisterDto;
use App\Security\LoginAuthenticator;
use App\Service\Manager\UserManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
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
}
