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
# Les bases de données.
DATABASE_PYNUTS_URL=postgresql+asyncpg://USER:PASSWORD@DB_PYNUTS_HOST:DB_PYNUTS_PORT/DB_PYNUTS_NAME
DATABASE_DONUTS_URL=postgresql+asyncpg://USER:PASSWORD@DB_DONUTS_HOST:DB_DONUTS_PORT/DB_DONUTS_NAME

# Variable de test et debug
TESTING=True # False en production
LOG_LEVEL=DEBUG # ERROR ou CRITICAL en production
TEST_ENV=True # False en production

# Pour les accès admin
SECRET_ADMIN_KEY=YOUR_SECRET_ADMIN_KEY # à générer avec l'algorithme fourni. 
ALGORITHM=YOUR_ALGORITHM
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
