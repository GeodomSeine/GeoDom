# GeodomDemo

Demo pour montrer l'utilisation des technos

## Warning

`main.py` contains a global variable called `TESTING` that enables the download of the data on a local file. **THIS SHOULD BE REMOVED IN PRODUCTION**. REALLY, DON'T PUSH IT TO PROD.

## Installation

### Etape 1: Lancer le serveur backend

```sh
cd Backend
python -m venv .venv
source .venv/bin/activate # pour Linux ou Mac uniquement
pip install -r requirements.txt
python -m uvicorn main:app --host localhost --port 2020
# si on a fini de travailler, taper `deactivate` pour sortir du venv
```

### Etape 2: Lancer le front ma gueule

```sh
cd front
npm install # uniquement la premiere fois
npm run dev # check reserved port on windows netsh interface ipv4 show excludedportrange protocol=tcp
```

### Etape 3: accéder à la page web

Par défault, la page sera sans doute sur: http://localhost:5173/

