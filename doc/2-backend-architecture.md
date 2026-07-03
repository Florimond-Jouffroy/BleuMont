 # 🐘 Architecture Backend & Bonnes Pratiques PHP
 
 Ce Skeleton impose une structure de code stricte inspirée du Domain-Driven Design (DDD) pour garder des contrôleurs fins et une logique métier isolée.
 
 ---
 
 ## 📂 Organisation du dossier `src/`
 
 * **`Controller/`** : Points d'entrée HTTP uniques. Les routes web classiques restent à la racine, tandis que les routes API sont isolées dans le sous-dossier `Api/`. **Règle : Aucun persist en base de données ni logique métier ne doit être écrit ici.**
 * **`Service/Manager/`** : Services d'orchestration de ton domaine (ex: `CampaignManager.php`). C'est ici que vit la logique métier (calculs, événements, envois d'emails, persistance Doctrine).
 * **`Dto/`** : Data Transfer Objects. Ils servent à encapsuler, typer et valider proprement les données entrantes des APIs ou des requêtes complexes avant de les envoyer aux Managers.
 * **`Transformer/`** : Classes de mapping (ex: `DateTransformer.php`). Ils s'occupent de transformer un DTO en Entité (ou inversement) et d'adapter les formats de données entre les couches.
 * **`Entity/`** : Entités Doctrine ORM pures définissant le schéma de base de données.
 * **`Enum/`** : Enums PHP natifs pour la gestion des états (ex: `CampaignStatus.php`), garantissant une cohérence absolue des statuts en base.
 * **`Form/Type/`** : Formulaires Symfony traditionnels isolés dans le dossier `Type/`.
 * **`Repository/`** : Couche d'accès aux données. Utilise le `PaginatedQueryTrait.php` pour harmoniser la gestion des listes et de la pagination nativement.
 * **`Security/Voter/`** : Gestion fine des droits d'accès basée sur les Voters Symfony, centralisée aux côtés du `PermissionService.php`.
