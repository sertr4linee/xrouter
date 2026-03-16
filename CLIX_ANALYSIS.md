# 🐦 CLIX — Analyse Complète

> **X depuis le terminal. Sans clé API. Sans bullshit.**  
> Package PyPI : `clix0` | Version actuelle : `0.3.1` | Licence : MIT  
> Repo : [github.com/spideystreet/clix](https://github.com/spideystreet/clix)

---

## Pourquoi clix existe

Depuis que Twitter/X a supprimé l'accès gratuit à son API, les développeurs et agents IA n'ont plus accès programmatique à la plateforme sans payer.

**clix contourne le problème** : il utilise l'**authentification par cookies de navigateur** — exactement comme le ferait un vrai navigateur. Il extrait les cookies `auth_token` et `ct0` depuis Chrome/Firefox/Edge/Brave et les rejoue avec des en-têtes HTTP parfaitement réalistes (TLS fingerprinting via `curl_cffi`).

**Résultat** : accès complet à X.com sans clé API, sans OAuth, sans payer.

---

## Stack Technique

| Composant | Technologie | Rôle |
|---|---|---|
| Language | Python 3.11+ | — |
| Package manager | `uv` | Environnements et locks rapides |
| CLI framework | `typer` | Commandes et sous-commandes |
| Terminal UI | `rich` | Tableaux, couleurs, markdown |
| HTTP client | `curl_cffi` | TLS fingerprinting (imite Chrome) |
| Data models | `pydantic v2` | Validation et sérialisation |
| Cookie extraction | `browser-cookie3` | Lecture cookies Chrome/Firefox/Edge |
| MCP server | `FastMCP` | Intégration agents IA (Claude, etc.) |
| Crypto | `cryptography` | Décryptage cookies Chrome (AES-256) |
| Headers anti-détection | `xclienttransaction` | Header `X-Client-Transaction-Id` |
| YAML output | `pyyaml` | Mode `--yaml` |
| Linter | `ruff` | Style + imports |
| Tests | `pytest` | Tests unitaires + intégration |

---

## Architecture du Code

```
clix/
├── __init__.py          ← version
├── __main__.py          ← python -m clix
│
├── cli/                 ← Interface utilisateur terminal
│   ├── app.py           ← Commandes principales + flags globaux
│   ├── helpers.py       ← Utilitaires partagés (output modes, client)
│   ├── feed.py          ← clix feed
│   ├── tweet.py         ← clix tweet / clix tweets
│   ├── user.py          ← clix user / clix users
│   ├── search.py        ← clix search
│   ├── lists.py         ← clix lists (CRUD + membres)
│   └── dm.py            ← clix dm inbox/send
│
├── core/                ← Logique métier pure (pas de dépendances CLI)
│   ├── api.py           ← TOUTES les méthodes API (read + write + DM + lists + media)
│   ├── auth.py          ← Extraction cookies + gestion des comptes
│   ├── client.py        ← Client HTTP (curl_cffi + TLS + transaction ID)
│   ├── config.py        ← Config TOML (~/.config/clix/config.toml)
│   ├── constants.py     ← Endpoints, headers, defaults, impersonation Chrome
│   └── endpoints.py     ← Extraction dynamique des operation IDs GraphQL
│
├── mcp/                 ← Serveur MCP pour agents IA
│   └── server.py        ← FastMCP avec 42 outils
│
├── models/              ← Modèles Pydantic
│   ├── tweet.py         ← Tweet, TweetEngagement, TweetMedia, TimelineResponse
│   ├── user.py          ← User
│   └── dm.py            ← DMConversation, DMMessage
│
├── display/             ← Formatage Rich (humains seulement)
│   └── formatter.py     ← Rendu tweets/users/threads/listes/trends/DMs
│
└── utils/
    ├── article.py       ← Draft.js → Markdown (Twitter Articles)
    ├── filter.py        ← Scoring d'engagement
    └── rate_limit.py    ← Rate limiting avec jitter
```

---

## Modèles de Données

### `Tweet`
```python
Tweet(
    id: str,
    text: str,
    author_id: str,
    author_name: str,
    author_handle: str,
    author_verified: bool,
    created_at: datetime | None,
    engagement: TweetEngagement,    # likes, retweets, replies, quotes, bookmarks, views
    media: list[TweetMedia],        # photo | video | animated_gif
    quoted_tweet: Tweet | None,
    reply_to_id: str | None,
    reply_to_handle: str | None,
    conversation_id: str | None,
    language: str | None,
    is_retweet: bool,
    retweeted_by: str | None,
    tweet_url: str,                  # computed: https://x.com/{handle}/status/{id}
)
```

### `User`
```python
User(
    id: str,
    name: str,
    handle: str,
    bio: str,
    location: str,
    website: str,
    verified: bool,
    followers_count: int,
    following_count: int,
    tweet_count: int,
    listed_count: int,
    created_at: datetime | None,
    profile_image_url: str,
    profile_banner_url: str,
    pinned_tweet_id: str | None,
)
```

---

## Toutes les Commandes

### 📖 Lecture de contenu

```bash
# Timeline
clix feed                           # For You (défaut)
clix feed --type following          # Following
clix feed --count 50                # Nombre de tweets

# Recherche
clix search "query"                 # Top tweets
clix search "query" --type latest   # Plus récents
clix search "query" --type photos   # Photos uniquement
clix search "query" --type videos   # Vidéos uniquement

# Trending
clix trending                       # Topics tendance + volume

# Tweets
clix tweet <id>                     # Voir un tweet + thread
clix tweet <id> --export file.md    # Exporter un article X en Markdown
clix tweets <id1> <id2> ...         # Batch fetch

# Utilisateurs
clix user <handle>                  # Profil + tweets récents
clix users <h1> <h2> ...            # Batch fetch

# Bookmarks
clix bookmarks                      # Mes bookmarks
```

### ✍️ Actions

```bash
# Tweets
clix post "texte"                           # Poster un tweet
clix post "texte" --reply-to <id>           # Répondre
clix post "texte" --image photo.jpg         # Avec image (jusqu'à 4)
clix post "texte" --quote https://...       # Quote tweet
clix delete <id>                            # Supprimer
clix delete <id> --force                    # Sans confirmation

# Engagement
clix like <id>       / clix unlike <id>
clix retweet <id>    / clix unretweet <id>
clix bookmark <id>   / clix unbookmark <id>

# Relations
clix follow <handle>   / clix unfollow <handle>
clix block <handle>    / clix unblock <handle>
clix mute <handle>     / clix unmute <handle>

# Médias
clix download <tweet-id>                    # Télécharger images/vidéos
clix download <tweet-id> --output-dir ./dl  # Dans un dossier
```

### 📅 Tweets planifiés

```bash
clix schedule "texte" --at "2024-12-25 10:00"   # Planifier
clix scheduled                                   # Voir les planifiés
clix unschedule <id>                             # Annuler
```

### 📋 Listes

```bash
clix lists                              # Mes listes
clix lists view <id>                    # Tweets d'une liste
clix lists view <id> --count 50
clix lists create "Ma liste"            # Créer
clix lists create "Private" --private   # Liste privée
clix lists delete <id>                  # Supprimer
clix lists members <id>                 # Membres
clix lists add-member <id> <handle>     # Ajouter
clix lists remove-member <id> <handle>  # Retirer
clix lists pin <id>                     # Épingler
clix lists unpin <id>                   # Désépingler
```

### 💬 Messages Directs

```bash
clix dm inbox                    # Conversations
clix dm send <handle> "message"  # Envoyer un DM
```

### ⚙️ Système

```bash
clix auth login                  # Extraire cookies du navigateur
clix auth status                 # Vérifier l'auth
clix auth set                    # Saisir manuellement les tokens
clix auth accounts               # Lister les comptes sauvegardés
clix auth switch <account>       # Changer de compte
clix auth import <file.json>     # Importer depuis Cookie Editor

clix config                      # Voir la config
clix config set network.proxy socks5://...   # Configurer proxy

clix doctor                      # Diagnostics système/auth/réseau
```

---

## Modes de Sortie

Toutes les commandes supportent ces flags :

| Flag | Description | Usage |
|---|---|---|
| `--json` | JSON structuré | Scripts, pipes |
| `--compact` / `-c` | JSON minimal optimisé tokens | Agents IA |
| `--yaml` | YAML | Lisibilité |
| `--full-text` | Texte sans troncature | Lecture complète |

**Détection automatique du pipe** : si la sortie n'est pas un TTY (ex: `| jq`), clix passe automatiquement en JSON.

```bash
# Exemples pipeline
clix feed --json | jq '.tweets[0].text'
clix user elonmusk --compact
clix search "AI" --yaml
clix trending --json | jq '.[0].name'
```

---

## Authentification

### Priorité de résolution

```
1. Variables d'environnement : X_AUTH_TOKEN + X_CT0
2. Fichier stocké          : ~/.config/clix/auth.json
3. Extraction navigateur    : Chrome (multi-profil), Firefox, Edge, Brave
```

### Extraction automatique depuis le navigateur

clix utilise `browser-cookie3` pour extraire les cookies Twitter/X :
- **Chrome** : scan de tous les profils (`Default`, `Profile 1`, `Profile 2`...)
- **macOS** : `/Library/Application Support/Google/Chrome/`
- **Linux** : `~/.config/google-chrome/`
- **Windows** : `%LOCALAPPDATA%/Google/Chrome/User Data/`
- Décryptage AES-256 via `cryptography`

### Multi-comptes

```bash
clix auth accounts          # Lister tous les comptes
clix auth switch perso      # Changer de compte par défaut
clix -a pro feed            # Utiliser un compte spécifique pour cette commande
```

---

## Serveur MCP (42 outils)

clix expose **toutes ses fonctionnalités comme serveur MCP** (Model Context Protocol) pour les agents IA (Claude, Cursor, etc.).

### Configuration

```json
{
  "mcpServers": {
    "clix": {
      "command": "uvx",
      "args": ["clix0", "mcp"],
      "env": {
        "X_AUTH_TOKEN": "votre-token",
        "X_CT0": "votre-ct0"
      }
    }
  }
}
```

### Les 42 outils MCP

**Lecture** :
- `get_feed` — timeline (with cursor pagination)
- `search` — recherche de tweets
- `get_tweet` — tweet + thread
- `get_tweets_batch` — batch fetch tweets
- `get_user` — profil utilisateur
- `get_users_batch` — batch fetch users
- `get_user_tweets` — tweets d'un utilisateur
- `get_user_likes` — likes d'un utilisateur
- `get_followers` — followers d'un utilisateur
- `get_following` — following d'un utilisateur
- `list_bookmarks` — bookmarks (with cursor)
- `get_trending` — trending topics
- `get_lists` — mes listes
- `get_list_timeline` — tweets d'une liste (with cursor)
- `get_list_members` — membres d'une liste (with cursor)
- `dm_inbox` — conversations DM
- `list_scheduled_tweets` — tweets planifiés
- `auth_status` — statut d'authentification

**Écriture** :
- `post_tweet`, `delete_tweet`
- `like`, `unlike`
- `retweet`, `unretweet`
- `bookmark`, `unbookmark`
- `follow`, `unfollow`
- `block`, `unblock`
- `mute`, `unmute`
- `create_list`, `delete_list`
- `add_list_member`, `remove_list_member`
- `pin_list`, `unpin_list`
- `dm_send`
- `schedule_tweet`, `cancel_scheduled_tweet`
- `download_media`

---

## Fonctionnement Technique (Anti-Détection)

### TLS Fingerprinting
clix utilise `curl_cffi` pour imiter exactement l'empreinte TLS de Chrome. Cela contourne Cloudflare et les systèmes anti-bot de X.com.

### GraphQL Operation IDs Dynamiques
X.com change régulièrement les IDs des opérations GraphQL dans ses bundles JS. Au lieu de les hardcoder, clix les **extrait dynamiquement au runtime** depuis les bundles JS de X.com (`clix/core/endpoints.py`), avec :
- Cache disque 24h : `~/.config/clix/graphql_ops.json`
- Auto-retry + invalidation de cache sur HTTP 404
- IDs de fallback pour les opérations les plus critiques

### Headers Navigateur Complets
Chaque requête inclut :
- `User-Agent` Chrome (version synchronisée avec l'impersonation)
- `sec-ch-ua`, `sec-ch-ua-mobile`, `sec-ch-ua-platform`
- `sec-fetch-dest`, `sec-fetch-mode`, `sec-fetch-site`
- `X-Client-Transaction-Id` (anti-détection X.com)
- Tous les cookies Twitter (~15-20, pas juste `auth_token` + `ct0`)

### Rate Limiting
`clix/utils/rate_limit.py` introduit des délais avec **jitter aléatoire** entre les requêtes pour imiter un comportement humain.

---

## Configuration

Fichier : `~/.config/clix/config.toml`

```toml
[network]
proxy = "socks5://127.0.0.1:1080"   # Optionnel
```

Via variable d'environnement :
```bash
CLIX_PROXY=socks5://127.0.0.1:1080 clix feed
CLIX_CHROME_PROFILE="Profile 3" clix auth login
```

---

## Codes de Sortie

| Code | Signification |
|---|---|
| `0` | Succès |
| `1` | Erreur générale |
| `2` | Erreur d'authentification |
| `3` | Rate limit atteint |

---

## Installation & Démarrage Rapide

```bash
# Installation
uv pip install clix0
# ou
pip install clix0

# Authentification (extrait automatiquement les cookies du navigateur)
clix auth login

# Vérifier
clix auth status
clix doctor

# Premier usage
clix feed
clix trending
clix user votre_handle
```

---

## Changelog Résumé

| Version | Date | Points clés |
|---|---|---|
| `0.1.0` | 2026-03-09 | Sortie initiale, commandes de base, 14 outils MCP |
| `0.2.0` | 2026-03-11 | Extraction dynamique GraphQL, headers anti-Cloudflare, intégration tests live |
| `0.3.0` | 2026-03-15 | +30 commandes (follow/block/mute/lists/DM/schedule/download/trending), 38 outils MCP |
| `0.3.1` | 2026-03-15 | +4 outils MCP (user_tweets, user_likes, followers, following), pagination curseur |

---

## Disclaimer

Outil à usage **éducatif et personnel uniquement**. Non affilié à X Corp (anciennement Twitter). Utilisez à vos propres risques et dans le respect des CGU de la plateforme.
