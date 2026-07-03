 # 🐳 Guide Docker & Environnement de Développement
 
 Ce document explique le fonctionnement de l'infrastructure Docker et la gestion de l'environnement sur ce Skeleton.
 
 ---
 
 ## 🏗️ Architecture Docker
 
 Le projet s'appuie sur Docker Compose et est orchestré autour de 3 conteneurs principaux :
 * **`app`** : Le conteneur PHP (sous PHP 8.4) qui fait tourner l'application, Composer, et le moteur Node/NPM pour les assets.
 * **`database`** : Le serveur de base de données (PostgreSQL ou MySQL selon ta configuration `.env`).
 * **`caddy` ou `nginx`** : Le serveur web pour l'exposition des ports.
 
 ---
 
 ## 🛠️ Le Makefile : Ton point d'entrée unique
 
 Pour éviter de taper de longues commandes Docker, toutes les interactions sont centralisées dans le `Makefile`. L'environnement s'exécute à l'intérieur du conteneur de manière totalement transparente.
 
 ### Commandes Globales
 * `make install` : Initialise le projet de A à Z (build Docker, composer install, npm install, migrations, fixtures).
 * `make up` : Démarre les conteneurs en arrière-plan.
 * `make down` : Arrête les conteneurs.
 
 ### Commandes Applicatives
 * `make sf cmd="nom:commande"` : Exécute une commande de la console Symfony (ex: `make sf cmd="make:migration"`).
 * `make composer cmd="install"` : Lance une commande Composer.
 * `make npm cmd="install"` : Lance une commande NPM.
 * `make cmd cmd="votre-commande"` : Exécute n'importe quelle commande brute directement à la racine du conteneur `app`.
 
 ---
 
 ## 🔒 Gestion des variables d'environnement
 
 * Le fichier `.env` contient les variables globales de l'application (par défaut pour la production/générique).
 * Le fichier `.env.docker.local` est configuré pour l'environnement Docker de développement. C'est ici que sont définis les accès pré-configurés pour la base de données interne au réseau Docker.
