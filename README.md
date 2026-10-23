# Bot-CSI

## Commande(s) possible(s) :
- **/help** : Envoie un ticket aux admins pour obtenir du support (dans un channel `equipe-XX`)
- **/tickets [status]** : Liste des tickets ouverts / pris (rôle `moderator` ou `ADMIN_ROLE` requis)
- **/team-broadcast** : Envoie un message à tous les channels `equipe-XX` et `equipe-test` (rôle `moderator` requis)

## Moyens d'utiliser le bot
- docker-compose
- local


## Installation
### Docker-compose
#### Prérequis
- Docker
#### Procédure
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

### Configuration (.env)
| Variable | Requis | Défaut | Description |
|---|---|---|---|
| `BOT_TOKEN` | oui | | Token du bot |
| `CLIENT_ID` | oui | | ID de l'application Discord |
| `LOG_CHANNEL_ID` | oui | | Channel où les tickets sont envoyés |
| `GUILD_ID` | non | | Enregistre les commandes sur un seul serveur (mise à jour instantanée) |
| `TEAM_CHANNEL_PREFIX` | non | `equipe-` | Préfixe des channels d'équipe (`equipe-XX`) |
| `TEAM_CHANNEL_EXTRA` | non | `test` | Autres noms acceptés, séparés par des virgules |
| `MODERATOR_ROLE` | non | `moderator` | Rôle des commandes modérateur |
| `ADMIN_ROLE` | non | `MODERATOR_ROLE` | Rôle pingé pour les tickets en attente (doit être mentionnable) |
| `TICKET_STALE_MINUTES` | non | `5` | Délai avant de pinger `ADMIN_ROLE` pour un ticket non pris |
| `DB_PATH` | non | `db/bot.sqlite` | Fichier de la base SQLite (tickets) |

### Ajouter de nouvelle commande
- Ajouter le nom de la commande et la description dans registerSlashCommands.js
- Lancer la commande `node registerSlashCommands.js`
