# Bot-CSI

## Commande(s) possible(s) :
- **/help** : Envoie un ticket aux admins pour obtenir du support

## Moyens d'utiliser le bot
- docker-compose
- local


## Installation
### Docker-compose
#### Prérequis
- Docker
### Procédure
- Créer un fichier .env à la racine du projet
- Remplir le fichier .env avec les informations du .env.example
- Lancer la commande `docker-compose up -d --build`

### Local
#### Prérequis
- NodeJS

#### Procédure
- Créer un fichier .env à la racine du projet
- Remplir le fichier .env avec les informations du .env.example
- Lancer la commande `npm install`
- Lancer la commande `node index.js`
