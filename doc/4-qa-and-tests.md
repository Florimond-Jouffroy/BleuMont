 # 🧪 Qualité de Code (QA) & Suite de Tests
 
 Ce Skeleton est outillé pour garantir que le code produit est robuste, standardisé et exempt de régressions.
 
 ---
 
 ## 🚀 Suite de Tests avec PHPUnit 10
 
 Nous utilisons le binaire natif de **PHPUnit 10** configuré de manière stricte via `phpunit.dist.xml`.
 * Pour lancer les tests : `make test`
 * Le fichier de configuration valide les dépréciations, les notices et pointe directement sur le dossier `tests/`.
 
 ---
 
 ## 📐 Outils de Qualité de Code (QA)
 
 La commande suivante centralise toute la suite de vérification automatique :
 ```bash
 make qa
 ```
 
 Elle exécute en arrière-plan :
 1. **PHPStan** : Analyse statique du code PHP pour traquer les erreurs de typage, les variables indéfinies ou les retours de fonctions incorrects.
 2. **Easy Coding Standard (ECS)** : Aligne automatiquement ton code sur les standards PSR-12 et les normes de l'équipe (espacements, accolades, imports non utilisés).
