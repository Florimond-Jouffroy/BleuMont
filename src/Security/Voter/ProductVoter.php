<?php

declare(strict_types=1);

namespace App\Security\Voter;

use App\Security\PermissionService;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Vote;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\User\UserInterface;

/** @extends Voter<string, mixed> */
class ProductVoter extends Voter
{
    public const string VIEW    = 'PRODUCT_VIEW';
    public const string CREATE  = 'PRODUCT_CREATE';
    public const string EDIT    = 'PRODUCT_EDIT';
    public const string DELETE  = 'PRODUCT_DELETE';
    public const string PUBLISH = 'PRODUCT_PUBLISH';

    public function __construct(private readonly PermissionService $permissionService)
    {
    }

    protected function supports(string $attribute, mixed $subject): bool
    {
        return in_array($attribute, [self::VIEW, self::CREATE, self::EDIT, self::DELETE, self::PUBLISH], true);
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token, ?Vote $vote = null): bool
    {
        $user = $token->getUser();
        if (!$user instanceof UserInterface) {
            return false;
        }

        return $this->permissionService->hasPermission($attribute, $user->getRoles());
    }
}
