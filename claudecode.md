# Project Context & Architecture Guidelines

## 🚀 Overview
This is a modern **Symfony** web application coupled with a **React** frontend using **Tailwind CSS v4** and **Shadcn UI**. The domain focuses on managing elements like **Campaigns** (Campagnes) and **Refund Requests** (Demandes de remboursement).

## 📂 Backend Architecture (`src/`)
The backend follows strict Symfony clean architecture layers:

* **`Controller/`**: Pure HTTP endpoints.
  * Standard web routes are flat at the root (e.g., `CampaignController.php`, `RefundRequestController.php`).
  * API endpoints must be isolated inside the `Api/` subfolder.
* **`Service/`**: Business logic layer.
  * Controllers must remain thin and delegate tasks to services.
  * **`Manager/`**: Contains orchestration services handling specific domain logic (e.g., `CampaignManager.php`).
* **`Dto/`**: Data Transfer Objects used to type-hint, validate, and isolate data structures incoming from API payloads or complex request handling.
* **`Transformer/`**: Data mappers and formatters (e.g., `DateTransformer.php`), used to map entities to DTOs or adjust formats between layers.
* **`Entity/`**: Doctrine ORM entities mapping the database schema.
* **`Enum/`**: Native PHP Enums managing model strict states and values (e.g., `CampaignStatus.php`).
* **`Form/`**: Server-side forms. Custom form types live inside the `Type/` subfolder (e.g., `CampaignType.php`).
* **`Repository/`**: Doctrine database query layers (e.g., `CampaignRepository.php`). Includes structural traits like `PaginatedQueryTrait.php` for handling lists.
* **`Security/`**: Access control rules. Contains a `Voter/` subfolder for fine-grained permissions alongside core security utilities like `PermissionService.php`.
* **`DataFixtures/`**: Fixtures for database seeding during development and testing environments.

## 🖼️ Rendering & Views (`templates/`)
* Standard Twig structures are segmented under the `app/` subfolder matching domain entities (e.g., `app/campaign/index.html.twig`, `app/refund_request/`).
* Global view fragments or wrappers follow the `layout/` subfolder convention (e.g., `_header.html.twig`, `_footer.html.twig`).

## 🎨 Frontend Architecture (`assets/`)
* **Framework**: React components embedded within Twig entrypoints.
* **Styling**: Tailwind CSS v4 (configured purely via CSS variables under `@theme` in `assets/styles/app.css`).
* **UI Components**: Shadcn UI elements using Radix primitives found inside `assets/components/ui/`.
* **Path Alias**: `@/*` points directly to the `assets/` folder, configured in `jsconfig.json`.

## 🛠️ Tooling & Makefile Commands
Operations are executed inside Docker containers. Always recommend or use these Makefile shortcuts:
* `make sf cmd="..."` -> Runs Symfony console commands (e.g., `make sf cmd="make:migration"`).
* `make test` -> Runs test suite via PHPUnit 10.
* `make watch` -> Runs Tailwind/Assets real-time watcher.
* `make qa` -> Runs code quality linters (PHPStan, ECS).

## 📝 Coding Instructions for the AI
1. **Thin Controllers, Fat Managers**: Never put core business logic or database persists directly in a Controller. Use or create a domain `Service/Manager` (like `CampaignManager`) and inject it.
2. **Type Safety**: Strictly use PHP 8.4 type-hinting on method arguments, properties, and return types.
3. **Naming Convention matching structural folders**:
   * Form types go to `Form/Type/*Type.php`.
   * Business orchestrators go to `Service/Manager/*Manager.php`.
4. **Adaptive UI**: When generating React components, rely only on Shadcn UI tokens and Tailwind CSS utilities inside `className`. Do not write standalone CSS modules.
