# Bot-CSI

## Commande(s) possible(s) :
- **/help** : Envoie un ticket aux admins pour obtenir du support (dans un channel `equipe-XX`)
- **/tickets [status]** : Liste des tickets ouverts / pris (rôle `moderator` ou `ADMIN_ROLE` requis)
- **/stats [view] [since]** : Statistiques des tickets — tout par défaut, ou vue d'ensemble, par équipe, par challenge, par admin (rôle `moderator` ou `ADMIN_ROLE` requis)
- **/team-broadcast [team] [title] [attachment]** : Ouvre une fenêtre pour écrire le message (multi-lignes), affiche un aperçu puis l'envoie à tous les channels d'équipe ou à une seule équipe (rôle `moderator` requis)
- **/register-team name members** : Crée une équipe (rôle + channel privé `equipe-XX`, numéro libre suivant) et donne le rôle aux membres mentionnés (rôle `moderator` requis)
- **/add-member team member** : Ajoute un membre à une équipe (rôle `moderator` requis)
- **/remove-team team** : Supprime le channel et le rôle d'une équipe, après confirmation (rôle `moderator` requis)
- **/prune-teams** : Supprime tous les channels et rôles `equipe-XX` (pas `equipe-test`), après confirmation (rôle `moderator` requis)

> Pour les commandes d'équipe, le bot a besoin des permissions « Gérer les rôles » et « Gérer les salons », et son rôle doit être **au-dessus** des rôles d'équipe dans les paramètres du serveur.

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
| `ADMIN_ROLE` | non | `challenges designer` | Rôle pingé pour les tickets en attente (doit être mentionnable) |
| `TICKET_STALE_MINUTES` | non | `5` | Délai avant de pinger `ADMIN_ROLE` pour un ticket non pris |
| `TEAM_CATEGORY_ID` | non | | Catégorie où `/register-team` crée les channels d'équipe |
| `DB_PATH` | non | `db/bot.sqlite` | Fichier de la base SQLite (tickets) |

### Ajouter de nouvelle commande
- Ajouter le nom de la commande et la description dans registerSlashCommands.js
- Lancer la commande `node registerSlashCommands.js`
