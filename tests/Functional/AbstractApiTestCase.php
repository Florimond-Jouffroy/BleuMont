<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Entity\PasswordResetToken;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

abstract class AbstractApiTestCase extends WebTestCase
{
    protected KernelBrowser $client;
    protected EntityManagerInterface $em;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $this->em     = static::getContainer()->get(EntityManagerInterface::class);
    }

    protected function postJson(string $url, array $payload): void
    {
        $this->client->request(
            'POST',
            $url,
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload),
        );
    }

    protected function getJson(): array
    {
        return json_decode($this->client->getResponse()->getContent(), true) ?? [];
    }

    /**
     * @param list<string> $roles
     */
    protected function createUser(
        string $email    = 'user@example.com',
        string $password = 'password123',
        bool   $verified = true,
        array  $roles    = [],
    ): User {
        $hasher = static::getContainer()->get(UserPasswordHasherInterface::class);

        $user = new User();
        $user->setEmail($email);
        $user->setPassword($hasher->hashPassword($user, $password));
        $user->setRoles($roles);

        if ($verified) {
            $user->setIsVerified(true);
        } else {
            $user->setVerificationToken(bin2hex(random_bytes(32)));
        }

        $this->em->persist($user);
        $this->em->flush();

        return $user;
    }

    protected function createAdmin(string $email = 'admin@example.com'): User
    {
        return $this->createUser($email, roles: ['ROLE_ADMIN']);
    }

    protected function loginAs(User $user): void
    {
        $this->client->loginUser($user);
    }

    protected function putJson(string $url, array $payload): void
    {
        $this->client->request(
            'PUT',
            $url,
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload),
        );
    }

    protected function createPasswordResetToken(User $user, string $code = '123456', int $ttlMinutes = 15): PasswordResetToken
    {
        $token = new PasswordResetToken($user, $code, new \DateTimeImmutable("+{$ttlMinutes} minutes"));

        $this->em->persist($token);
        $this->em->flush();

        return $token;
    }

    protected function refreshUser(User $user): User
    {
        $this->em->refresh($user);

        return $user;
    }
}
