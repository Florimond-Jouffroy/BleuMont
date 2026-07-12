<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Entity\Customer;
use App\Entity\Order;
use App\Entity\PasswordResetToken;
use App\Entity\Product;
use App\Entity\ProductCategory;
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
        $this->em = static::getContainer()->get(EntityManagerInterface::class);
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
        string $email = 'user@example.com',
        string $password = 'password123',
        bool $verified = true,
        array $roles = [],
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

    protected function patchJson(string $url, array $payload): void
    {
        $this->client->request(
            'PATCH',
            $url,
            [],
            [],
            ['CONTENT_TYPE' => 'application/json'],
            json_encode($payload),
        );
    }

    protected function createCustomer(
        string $email = 'client@example.com',
        string $firstName = 'Jean',
        string $lastName = 'Dupont',
    ): Customer {
        $customer = new Customer();
        $customer->setEmail($email);
        $customer->setFirstName($firstName);
        $customer->setLastName($lastName);

        $this->em->persist($customer);
        $this->em->flush();

        return $customer;
    }

    protected function createProductCategory(
        string $name = 'Vêtements',
        string $slug = 'vetements',
    ): ProductCategory {
        $category = new ProductCategory();
        $category->setName($name);
        $category->setSlug($slug);

        $this->em->persist($category);
        $this->em->flush();

        return $category;
    }

    protected function createProduct(
        string $name = 'T-shirt blanc',
        string $slug = 't-shirt-blanc',
        string $status = Product::STATUS_DRAFT,
    ): Product {
        $product = new Product();
        $product->setName($name);
        $product->setSlug($slug);
        $product->setStatus($status);
        $product->setPrice(1999);

        $this->em->persist($product);
        $this->em->flush();

        return $product;
    }

    protected function createOrder(
        Customer $customer,
        string $orderNumber = 'ORD-20240101-00001',
        string $status = Order::STATUS_PENDING,
    ): Order {
        $order = new Order();
        $order->setOrderNumber($orderNumber);
        $order->setCustomer($customer);
        $order->setStatus($status);
        $order->setShippingAddress([
            'firstName'  => $customer->getFirstName(),
            'lastName'   => $customer->getLastName(),
            'line1'      => '1 rue de la Paix',
            'city'       => 'Paris',
            'postalCode' => '75001',
            'country'    => 'FR',
        ]);

        $this->em->persist($order);
        $this->em->flush();

        return $order;
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
