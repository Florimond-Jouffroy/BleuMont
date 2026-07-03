 # 🎨 Workflow Frontend : React, Tailwind v4 & Shadcn UI
 
 Le frontend de ce Skeleton est pensé pour être "Caméléon" : le code reste identique d'un projet à l'autre, seul le thème graphique change.
 
 ---
 
 ## 🛠️ La stack technique
 
 * **React** : Intégré nativement dans les templates Twig via Symfony AssetMapper.
 * **Tailwind CSS v4** : Plus de fichier `tailwind.config.js`. Tout le moteur de style est géré via la directive moderne `@import "tailwindcss"` dans `assets/styles/app.css`.
 * **Shadcn UI** : Composants d'interface basés sur les primitives d'accessibilité de **Radix**.
 
 ---
 
 ## 🦎 L'approche Caméléon (Design Interchangeable)
 
 Les composants Shadcn (ex: `assets/components/ui/button.jsx`) utilisent des variables CSS universelles (ex: `--primary`, `--background`, `--radius`).
 Pour changer radicalement l'identité visuelle d'un nouveau projet :
 1. Va sur [ui.shadcn.com/themes](https://ui.shadcn.com/themes).
 2. Configure tes couleurs et arrondis, puis copie le code.
 3. Colle-le sous le bloc `@theme` de ton fichier `assets/styles/app.css`.
 Tous tes composants React s'adapteront instantanément à la nouvelle charte graphique, sans toucher au code JavaScript.
 
 ---
 
 ## 🔄 Commandes au quotidien
 
 Pendant tes phases de développement, ouvre un terminal dédié et lance :
 ```bash
 make watch
 ```
 Ce watcher écoute en temps réel tes modifications sur tes fichiers Twig et React, et recompile le CSS instantanément à chaque sauvegarde.
