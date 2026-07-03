# Système de Permissions Centralisé

Ce système offre une gestion hybride des autorisations : une configuration statique pour les droits globaux et l'utilisation des Voters Symfony pour la logique métier dynamique.

## Architecture du Système 

| Composant | Rôle principal | Emplacement |
| :--- | :--- | :--- |
| **Configuration YAML** | Définition des permissions, des rôles autorisés et descriptions | `config/permissions.yaml` |
| **PermissionService** | Lecture du YAML, vérification de la hiérarchie des rôles de l'utilisateur | `src/Security/PermissionService.php` |
| **Voters** | Application de la logique métier fine et conditionnelle (ex: dates, statuts) | `src/Security/Voter/`  |

## 1. Configuration (`permissions.yaml`) 

Ce fichier centralise l'ensemble des permissions de l'application. Chaque permission possède une clé unique et liste les rôles globaux pouvant y accéder.

**Structure d'une permission :** 
* **Clé :** Nom de la permission en majuscules (ex: CAMPAIGN_VIEW)
* **roles :** Liste des rôles Symfony autorisés.
* **description :** Explication claire de l'action couverte.
* **conditions :** (Optionnel) Liste de règles ou de tags additionnels à traiter ultérieurement.

```
ARTICLE_VIEW:
    roles: [ ROLE_USER, ROLE_ADMIN ]
    description: "Voir les articles"

ARTICLE_CREATE:
    roles: [ ROLE_EDITEUR, ROLE_ADMIN ]
    description: "Créer un nouvel article"

ARTICLE_EDIT:
    roles: [ ROLE_EDITEUR, ROLE_ADMIN ]
    description: "Modifier un article existant"

ARTICLE_DELETE:
    roles: [ ROLE_ADMIN ]
    description: "Supprimer un article"
    conditions: [ "tag_de_condition_1", "tag_de_condition_2" ]
```

## 2. Le Service (`PermissionService`) 

Ce service agit comme l'interpréteur de notre configuration YAML. Il s'appuie sur la RoleHierarchyInterface native de Symfony pour gérer l'héritage (par exemple, s'assurer qu'un ROLE_ADMIN possède bien les droits d'un ROLE_USER).

**Méthodes principales :** 
* `hasPermission(string $permission, array $userRoles): bool` : Vérifie si les rôles actuels de l'utilisateur l'autorisent à passer la première barrière de sécurité pour une action donnée.
* `getConditions(string $permission): array` : Récupère les tags de conditions.
* `getPermissionsForRole(string $role): array` : Liste toutes les permissions rattachées à un rôle spécifique.

> **Note de configuration :** Le service nécessite l'injection manuelle du paramètre `$projectDir` dans le fichier `services.yaml` pour localiser correctement le fichier de configuration à la racine du projet.

## 3. Logique Métier (`Voters`) 

Les Voters interviennent comme des "videurs" de sécurité finaux. Ils s'appuient d'abord sur le PermissionService pour filtrer les accès de base, puis appliquent les règles spécifiques à l'objet métier.

**Cycle de validation standard d'un Voter :** 
1. **Vérification globale :** Appel à PermissionService->hasPermission() pour valider le rôle de base.
2. **Droits globaux :** Si l'action ne nécessite pas d'objet (ex: VIEW_ALL, CREATE), autorisation directe.
3. **Vérification de l'entité :** Filtrage basé sur les propriétés de l'objet (ex: vérification de l'affectation LDAP de l'utilisateur, vérification de la date d'expiration d'une campagne, etc.).

```
<?php

declare(strict_types=1);

namespace App\Security\Voter;

use App\Entity\Article;
use App\Enum\ArticleStatus;
use App\Security\PermissionService;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;
use Symfony\Component\Security\Core\User\UserInterface;

/**
 * @extends Voter<string, Article|null>
 */
class ArticleVoter extends Voter
{
    public const VIEW = 'ARTICLE_VIEW';
    public const CREATE = 'ARTICLE_CREATE';
    public const EDIT = 'ARTICLE_EDIT';
    public const DELETE = 'ARTICLE_DELETE';

    private const SUPPORTED_ATTRIBUTES = [
        self::VIEW,
        self::CREATE,
        self::EDIT,
        self::DELETE,
    ];

    public function __construct(
        private PermissionService $permissionService,
    ) {
    }

    protected function supports(string $attribute, mixed $subject): bool
    {
        if (!in_array($attribute, self::SUPPORTED_ATTRIBUTES, true)) {
            return false;
        }

        return null === $subject || $subject instanceof Article;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token): bool
    {
        $user = $token->getUser();

        if (!$user instanceof UserInterface) {
            return false;
        }

        // 1. Vérification globale : Appel à PermissionService->hasPermission() pour valider le rôle de base.
        if (!$this->permissionService->hasPermission($attribute, $user->getRoles())) {
            return false;
        }

        // 2. Droits globaux : Si l'action ne nécessite pas d'objet (ex: VIEW, CREATE), autorisation directe.
        if (in_array($attribute, [self::VIEW, self::CREATE], true)) {
            return true;
        }

        // Accord de principe si aucun objet n'est fourni pour les autres droits
        if (null === $subject) {
            return true;
        }

        /** @var Article $article */
        $article = $subject;

        // 3. Vérification de l'entité : Filtrage basé sur les propriétés de l'objet
        return match ($attribute) {
            self::EDIT => $this->canEdit($article),
            self::DELETE => $this->canDelete($article),
            default => false,
        };
    }

    /**
     * Règle métier pour l'édition : 
     * Interdit de modifier un article s'il est déjà publié.
     */
    private function canEdit(Article $article): bool
    {
        return $article->getStatus() !== ArticleStatus::PUBLISHED;
    }

    /**
     * Règle métier pour la suppression : 
     * Un article ne peut être supprimé que s'il est au statut ARCHIVÉ.
     */
    private function canDelete(Article $article): bool
    {
        return $article->getStatus() === ArticleStatus::ARCHIVED;
    }
}
```

## Utilisation dans l'application 

L'avantage de cette architecture est qu'elle ne change absolument rien à la façon dont tu sécurises tes contrôleurs ou tes templates Twig. Il te suffit d'utiliser les attributs définis dans ton fichier YAML:

```php
// Dans un contrôleur Symfony
$this->denyAccessUnlessGranted('REFUND_REQUEST_EDIT', $refundRequest);
```

```
{# Dans un template Twig #}
{% if is_granted('CAMPAIGN_CREATE') %}
<button>Nouvelle campagne</button>
{% endif %}
```
