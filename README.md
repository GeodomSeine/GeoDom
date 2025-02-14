# Pirenseine LastProject

**Pirenseine LastProject** est un projet de visualisation cartographique permettant d’analyser la **qualité de l’eau** à travers divers indicateurs. Il compare les **données réelles** avec celles issues d’un **modèle prédictif**.

---

## Installation et lancement

### Cloner le projet

```bash
git clone <URL_DU_REPO>
cd Geodom
```

### Installer les dépendances backend

Dans le dossier `Backend`, installez les dépendances nécessaires :

```bash
cd Backend
python install -r requirements.txt
```

### Configurer les variables d’environnement

Dans `Backend`, créez un fichier **`.env`** contenant les accès aux bases de données et les paramètres du projet :

```ini
DATABASE_PYNUTS_URL=<URL_de_connexion_PYNUTS>
DATABASE_DONUTS_URL=<URL_de_connexion_DONUTS>
TESTING=<True or False>
LOG_LEVEL=<niveau_de_log>
DB_ENGINE_LOG=<True or False>
```

---

## Démarrer le projet

### Lancer le backend

Dans le dossier `Backend`, exécutez :

```bash
python -m uvicorn main:app
```

Cela démarrera le serveur et servira également l'interface si elle a été préalablement build.

---

### Lancer l’interface utilisateur

#### ➤ Mode production (via le backend)

Dans le dossier `FrontEnd`, générez le build avec :

```bash
npm run build
```

Puis lancez le backend (comme expliqué ci-dessus). L’interface sera alors accessible via le serveur.

#### ➤ Mode développement

1. Modifier **`api.ts`** dans `FrontEnd`
2. Ajouter en haut du fichier l’URL complète du backend en **commentaire** avant `/api`
3. Lancer l’interface avec :

```bash
npm run dev
```
