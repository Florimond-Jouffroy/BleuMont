## Utilitaires Front-End (`assets/js/utils/`)

Ce dossier regroupe les scripts génériques indispensables pour faire le pont entre notre front-end et le back-end Symfony[cite: 61]. [cite_start]L'architecture recommandée place ces fichiers directement dans vos assets.

### Structure des fichiers

```text
assets/
└── js/
    └── utils/
        ├── api.js
        ├── formatters.js
        └── url.js
```

### 1. `api.js` (Wrapper Fetch & Gestion des Erreurs)

Ce script expose un wrapper fetch ultra-complet pour tous les appels API de l'application.

* **Parse automatique :** Gère automatiquement la sérialisation du body en JSON et le parsing de la réponse.
* **Classe `ApiError` :** Centralise la gestion des erreurs. Si la requête échoue, une erreur contenant le statut et le détail métier est levée.
* **Traduction des statuts :** Expose une fonction `getErrorMessage` qui traduit automatiquement les statuts HTTP courants (401, 403, 422, etc.) en messages lisibles pour l'utilisateur, évitant ainsi de dupliquer cette logique dans les composants.

### 2. `formatters.js` (Manipulation des Dates)

Ce fichier est indispensable pour gérer proprement la friction des formats de date entre le front-end et l'API.

* **Standardisation :** Il établit une distinction claire entre le format d'affichage utilisateur (`dd/mm/yyyy`) et les formats standards (API/ISO).
* **Fonctions utilitaires :** Fournit des méthodes prêtes à l'emploi pour parser, formater, additionner des jours ou vérifier des intervalles de dates.

### 3. `url.js` (Génération de Routes Dynamiques)

Un utilitaire simple mais très efficace pour construire vos endpoints.

* **Sécurité et lisibilité :** Permet d'injecter des paramètres dynamiques dans vos routes API (via des placeholders comme `__ID__`) en encodant automatiquement les valeurs, ce qui évite les concaténations de chaînes hasardeuses.
