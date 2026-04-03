# Programme des Églises de Maison — CCEAV

Site statique ultra rapide présentant le programme annuel des églises de maison de la CCEAV.

## Fonctionnalités

- **Navigation par trimestre** : accès direct à chaque trimestre via la barre de navigation sticky
- **Filtre par trimestre** : boutons pour afficher uniquement un trimestre
- **Filtre par semaine** : sélecteur moderne personnalisé pour aller directement à une semaine
- **Recherche locale** : recherche instantanée par thème ou référence biblique
- **Mode clair/sombre** : bascule manuelle + respect automatique des préférences système, mémorisé en localStorage
- **Impression** : mise en page optimisée pour l'impression / export PDF
- **Accessibilité** : conforme WCAG AA (navigation clavier, contrastes, landmarks, ARIA, prefers-reduced-motion)
- **Responsive mobile-first** : adapté mobile, tablette et desktop
- **Bouton retour en haut** : apparaît au scroll pour revenir rapidement
- **Zéro dépendance** : HTML/CSS/JS vanille, aucun framework

## Lancement local

Avec Python :

```bash
cd eglise-maison-cceav
python -m http.server 8080
```

Puis ouvrir [http://localhost:8080](http://localhost:8080).

Alternativement, avec Node.js :

```bash
npx serve .
```

Ou simplement ouvrir `index.html` dans un navigateur (certaines fonctionnalités peuvent être limitées sans serveur).

## Déploiement sur GitHub Pages

### Méthode 1 : Depuis les paramètres (la plus simple)

1. Créer un dépôt GitHub (public ou privé avec Pages activé)
2. Pousser le code :
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<TON_USER>/<TON_REPO>.git
   git push -u origin main
   ```
3. Aller dans **Settings → Pages**
4. Source : **Deploy from a branch**
5. Branche : `main`, dossier : `/ (root)`
6. Cliquer **Save**
7. Attendre 1-2 minutes, le site sera accessible à :
   ```
   https://<TON_USER>.github.io/<TON_REPO>/
   ```

### Méthode 2 : Avec un domaine personnalisé (optionnel)

1. Dans **Settings → Pages → Custom domain**, entrer ton domaine
2. Ajouter un fichier `CNAME` à la racine du projet contenant ton domaine :
   ```
   programme.mon-eglise.fr
   ```
3. Configurer un enregistrement DNS `CNAME` pointant vers `<TON_USER>.github.io`
4. Activer **Enforce HTTPS**

### Vérification post-déploiement

- [ ] Le site se charge sans erreur à l'URL GitHub Pages
- [ ] Le mode sombre fonctionne
- [ ] Les filtres et la recherche fonctionnent
- [ ] L'impression produit un rendu propre (Ctrl+P)
- [ ] La page 404 s'affiche pour les URL invalides
- [ ] Le site est rapide sur mobile (Lighthouse > 90)

> Le fichier `.nojekyll` est déjà présent pour bypasser le traitement Jekyll.

## Ajouter le contenu du 4e trimestre

Quand le contenu officiel sera disponible :

1. Ouvrir `index.html`
2. Trouver la section `<!-- TRIMESTRE 4 (placeholder) -->`
3. Remplacer le `<div class="placeholder-notice">…</div>` par une liste `<ol>` identique aux trimestres précédents
4. Chaque semaine suit ce format :

```html
<li class="week-card" data-week="40" data-trimester="4">
  <span class="week-card__number" aria-label="Semaine 40">40</span>
  <div class="week-card__body">
    <p class="week-card__title">Titre du thème</p>
    <p class="week-card__refs">Référence biblique 1, Référence biblique 2</p>
  </div>
</li>
```

5. Ajouter les options correspondantes dans le `<select id="week-select">` (semaines 33-52)
6. Le sélecteur personnalisé se mettra à jour automatiquement (il lit les `data-week` des cartes au chargement)

## Structure du projet

```
.
├── index.html              Page principale (tout le contenu)
├── 404.html                Page d'erreur stylée
├── .nojekyll               Bypass Jekyll
├── robots.txt              Directives crawlers
├── sitemap.xml             Plan du site
├── README.md               Ce fichier
└── assets/
    ├── styles/
    │   ├── main.css        Design system + dark mode + responsive mobile-first
    │   └── print.css       Styles d'impression
    └── scripts/
        └── app.js          Thème, filtres, recherche, animations, back-to-top
```

## Licence

© 2026 CCEAV
