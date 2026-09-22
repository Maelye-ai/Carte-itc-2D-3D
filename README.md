# 🌍 LAGUNES EXPLORATION AFRIQUE (LEA) — Carte des Sites d'Exploration

> **Projet ITC 2026 x LEA**  
> *Cartographie interactive 2D simple, claire et vulgarisée des sites d'exploration minière en Côte d'Ivoire auprès du grand public non-expert.*

---

## 🌟 Fonctionnalités

1. **Carte 2D Simple & Rapide (Leaflet)** :
   - Affichage immédiat de la Côte d'Ivoire sans lenteur ni 3D complexe.
   - Bascule en 1 clic entre **Vue Satellite** (haute définition Esri) et **Vue Carte** (OpenStreetMap).
   - Périmètres d'exploration (polygones en pointillés avec calcul des km²).
   - Marqueurs clairs pour chaque site avec popups complets.

2. **Vulgarisation Pédagogique (Pour le Grand Public)** :
   - Encart explicatif : *« L'exploration n'est pas une mine à ciel ouvert »*.
   - Les 4 étapes de l'enquête géologique résumées simplement.
   - Mention systématique des garanties environnementales (plateformes rebouchées, zéro produit toxique).

3. **Sites de LEA Inclus** :
   - **Bongouanou** (Moronou) : Forages profonds carottés (1 850m) pour Or et Bauxite (55% en cours).
   - **Béoumi** (Gbêkê) : Prospection préliminaire & télédétection pour Lithium et Or (15% à démarrer).
   - **Gagnoa** (Gôh) : Anomalie aurifère majeure sur 3,5 km, phase 1 validée (100%).

4. **Partage & Accessibilité** :
   - Bouton de partage direct WhatsApp pré-configuré.
   - Compatible 100% avec les smartphones, tablettes et ordinateurs.

---

## 🚀 Comment Héberger ce Site sur GitHub Pages (Gratuit & en 2 minutes)

### Méthode 1 : Directement sur le site GitHub (Sans ligne de commande)

1. Rendez-vous sur votre compte [GitHub.com](https://github.com) et connectez-vous.
2. Cliquez sur le bouton vert **« New »** pour créer un nouveau dépôt (*Repository*).
3. Nommez votre dépôt (par exemple : `lea-exploration` ou `carte-lea`).
4. Cochez **« Public »** et cliquez sur **« Create repository »**.
5. Sur la page qui s'affiche, cliquez sur le lien **« uploading an existing file »**.
6. Glissez-déposez les fichiers suivants depuis votre dossier `lea-cartographie-interactive` :
   - `index.html`
   - `style.css`
   - `app.js`
7. Cliquez sur le bouton vert **« Commit changes »** en bas.
8. Rendez-vous dans l'onglet **Settings** (Paramètres) du dépôt en haut à droite.
9. Dans le menu de gauche, cliquez sur **Pages** (sous la section *Code and automation*).
10. Sous **Branch**, sélectionnez **`main`** (ou `master`), laissez `/ (root)` et cliquez sur **Save**.
11. 🎉 En 30 secondes, GitHub génère votre lien public visible par tous :  
    👉 **`https://<votre-pseudo>.github.io/<nom-du-repo>/`**

---

### Méthode 2 : En Ligne de Commande (Git)

Si Git est installé sur votre ordinateur :

```bash
cd C:\Users\yemi_\.gemini\antigravity\scratch\lea-cartographie-interactive

# 1. Initialiser le dépôt
git init
git add index.html style.css app.js README.md
git commit -m "Carte interactive LEA"

# 2. Lier à votre dépôt GitHub et pousser
git branch -M main
git remote add origin https://github.com/<votre-pseudo>/<nom-du-repo>.git
git push -u origin main
```

Puis activez **GitHub Pages** dans `Settings > Pages > Branch: main`.

---

## 💻 Test en Local sur votre Ordinateur

Vous pouvez tester le site immédiatement de deux façons :
- **Double-clic sur `index.html`** : s'ouvre directement dans votre navigateur.
- **Double-clic sur `start_lea.bat`** : lance le serveur local sur `http://localhost:8080`.
