<?php

declare(strict_types=1);

namespace App\Tests\Functional\Api\Admin;

use App\Entity\PasswordResetToken;
use App\Entity\User;
use App\Tests\Functional\AbstractApiTestCase;
use Symfony\Component\HttpFoundation\Response;

class UserManagementTest extends AbstractApiTestCase
{
    // ── Contrôle d'accès ──────────────────────────────────────────────────────

    public function testListRequiresAuthentication(): void
    {
        $this->client->request('GET', '/api/admin/users');

        self::assertResponseRedirects('/connexion');
    }

    public function testListForbiddenForNonAdmin(): void
    {
        $this->loginAs($this->createUser('simple@example.com'));

        $this->client->request('GET', '/api/admin/users');

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
    }

    // ── Liste ─────────────────────────────────────────────────────────────────

    public function testListReturnsUsersWithPagination(): void
    {
        $this->loginAs($this->createAdmin());
        $this->createUser('alice@example.com');
        $this->createUser('bob@example.com');

        $this->client->request('GET', '/api/admin/users');

        self::assertResponseIsSuccessful();
        $data = $this->getJson();
        self::assertSame(3, $data['total']);
        self::assertCount(3, $data['items']);
        self::assertArrayHasKey('email', $data['items'][0]);
        self::assertArrayHasKey('roles', $data['items'][0]);
        self::assertArrayHasKey('isVerified', $data['items'][0]);
    }

    public function testListFiltersByEmail(): void
    {
        $this->loginAs($this->createAdmin());
        $this->createUser('alice@example.com');
        $this->createUser('bob@example.com');

        $this->client->request('GET', '/api/admin/users', ['q' => 'alice']);

        self::assertResponseIsSuccessful();
        $data = $this->getJson();
        self::assertSame(1, $data['total']);
        self::assertSame('alice@example.com', $data['items'][0]['email']);
    }

    // ── Réinitialisation de mot de passe ──────────────────────────────────────

    public function testResetPasswordSendsCode(): void
    {
        $this->loginAs($this->createAdmin());
        $user = $this->createUser('cible@example.com');

        $this->postJson('/api/admin/users/'.$user->getId().'/reset-password', []);

        self::assertResponseIsSuccessful();
        self::assertEmailCount(1);
        self::assertNotNull(
            $this->em->getRepository(PasswordResetToken::class)->findOneBy(['user' => $user]),
        );
    }

    // ── Vérification e-mail ───────────────────────────────────────────────────

    public function testVerifyMarksUserAsVerified(): void
    {
        $this->loginAs($this->createAdmin());
        $user = $this->createUser('nonverifie@example.com', verified: false);

        $this->postJson('/api/admin/users/'.$user->getId().'/verify', []);

        self::assertResponseIsSuccessful();
        $this->refreshUser($user);
        self::assertTrue($user->isVerified());
        self::assertNull($user->getVerificationToken());
    }

    public function testVerifyRejectsAlreadyVerifiedUser(): void
    {
        $this->loginAs($this->createAdmin());
        $user = $this->createUser('verifie@example.com', verified: true);

        $this->postJson('/api/admin/users/'.$user->getId().'/verify', []);

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    public function testResendVerificationForUnverifiedUser(): void
    {
        $this->loginAs($this->createAdmin());
        $user = $this->createUser('nonverifie@example.com', verified: false);

        $this->postJson('/api/admin/users/'.$user->getId().'/resend-verification', []);

        self::assertResponseIsSuccessful();
        self::assertEmailCount(1);
    }

    public function testResendVerificationRejectsVerifiedUser(): void
    {
        $this->loginAs($this->createAdmin());
        $user = $this->createUser('verifie@example.com', verified: true);

        $this->postJson('/api/admin/users/'.$user->getId().'/resend-verification', []);

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
    }

    // ── Gestion des rôles ─────────────────────────────────────────────────────

    public function testPromoteUserToAdmin(): void
    {
        $this->loginAs($this->createAdmin());
        $user = $this->createUser('cible@example.com');

        $this->putJson('/api/admin/users/'.$user->getId().'/roles', ['roles' => ['ROLE_ADMIN']]);

        self::assertResponseIsSuccessful();
        $this->refreshUser($user);
        self::assertContains('ROLE_ADMIN', $user->getRoles());
    }

    public function testDemoteAdminToUser(): void
    {
        $this->loginAs($this->createAdmin());
        $user = $this->createAdmin('autre-admin@example.com');

        $this->putJson('/api/admin/users/'.$user->getId().'/roles', ['roles' => []]);

        self::assertResponseIsSuccessful();
        $this->refreshUser($user);
        self::assertNotContains('ROLE_ADMIN', $user->getRoles());
    }

    public function testRolesIgnoresUnknownRoles(): void
    {
        $this->loginAs($this->createAdmin());
        $user = $this->createUser('cible@example.com');

        $this->putJson('/api/admin/users/'.$user->getId().'/roles', ['roles' => ['ROLE_SUPER_ADMIN', 'ROLE_HACK']]);

        self::assertResponseIsSuccessful();
        $this->refreshUser($user);
        self::assertSame(['ROLE_USER'], $user->getRoles());
    }

    public function testCannotChangeOwnRoles(): void
    {
        $admin = $this->createAdmin();
        $this->loginAs($admin);

        $this->putJson('/api/admin/users/'.$admin->getId().'/roles', ['roles' => []]);

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
        $this->refreshUser($admin);
        self::assertContains('ROLE_ADMIN', $admin->getRoles());
    }

    // ── Suppression ───────────────────────────────────────────────────────────

    public function testDeleteUser(): void
    {
        $this->loginAs($this->createAdmin());
        $user = $this->createUser('a-supprimer@example.com');
        $userId = $user->getId();

        $this->client->request('DELETE', '/api/admin/users/'.$userId);

        self::assertResponseStatusCodeSame(Response::HTTP_NO_CONTENT);
        self::assertNull($this->em->getRepository(User::class)->find($userId));
    }

    public function testCannotDeleteOwnAccount(): void
    {
        $admin = $this->createAdmin();
        $this->loginAs($admin);

        $this->client->request('DELETE', '/api/admin/users/'.$admin->getId());

        self::assertResponseStatusCodeSame(Response::HTTP_UNPROCESSABLE_ENTITY);
        self::assertNotNull($this->em->getRepository(User::class)->find($admin->getId()));
    }
}
