# rsstodolist-node-server

A lightweight URL-to-RSS bridge that turns bookmarked links into RSS feeds you can share or keep private. The hosted instance runs at `https://rsstodolist.eu/` but the project is built to be self-hosted for privacy and uptime.

## Highlights
- Treats each named feed as a to-read list that can be accessed as HTML or RSS (`?format=rss`).
- Automatically scrapes page titles and descriptions when metadata is missing.
- Exposes `/list`, `/search` on private instance (or if `LIST_KEY` is compared to key parameter).
- Exposes `/suggest` for Firefox / Chrome addon.
- Ships with PostgreSQL (or MariaDB) migrations, Docker builds, and PM2-friendly runtime scripts.

## Requirements and prerequisites
- Node.js **>= 20** (package `engines` enforces this).
- PostgreSQL or MariaDB (see `sql/rsstodolist.*` for schema). Alternatively, run everything with Docker Compose.
- Copy `.env.sample` to `.env` (or use `.env.docker_compose`) and tweak the values before booting the app.

## Environment variables
| Name | Description | Default |
| --- | --- | --- |
| `PORT` | HTTP port | `8080` |
| `DATABASE_DIALECT` | Sequelize dialect (`postgres` or `mariadb`) | `postgres` |
| `DATABASE_HOST` | Database host | `127.0.0.1` |
| `DATABASE_PORT` | Database port | `5432` |
| `DATABASE_NAME` | Database name | `rsstodolist` |
| `DATABASE_USER` / `DATABASE_PASS` | Credentials | *required (unless `DATABASE_URL` overrides)* |
| `DATABASE_URL` | Full DB connection string; takes precedence over individual fields | `dialect://user:pass@host:port/name` |
| `LIST_KEY` | Protects `/list` and `/search` when `PUBLIC=true` | unset |
| `PUBLIC` | When `true`, hides the private UI and enforces `LIST_KEY` | `false` |
| `ROOT_URL` | Force the root URL used in feeds | autodetected via request host |
| `TZ` | Timezone used by Sequelize | `Etc/GMT0` |


## Local development
1. `cp .env.sample .env` and fill in database credentials.
2. `npm i` to install dependencies.
3. Start your database (Postgres example):
   ```bash
   docker compose -f ./docker/docker-compose.yml up db
   ```
4. Apply the schema manually (`sql/rsstodolist.postgres` for Postgres or `.mysql` for MariaDB).
5. Run the server in watch mode:
   ```bash
   npm run dev
   ```
6. When you're ready to test the production build:
   ```bash
   npm run build
   npm start
   ```
   or use `pm2.sh` to keep the process alive (`NODE_ENV=production pm2 start dist/index.js ...`).

## Dockerized setups
### Docker Compose
```bash
docker compose -f ./docker/docker-compose.yml build
docker compose -f ./docker/docker-compose.yml up
```
The compose stack builds the app, seeds PostgreSQL from `sql/rsstodolist.postgres`, and exposes port 8080.

To inspect the database:
```bash
docker exec -it rsstodolist-db_rsstodolist-postgres_1 psql -U rsstodolist -d rsstodolist
```

### Standalone Docker image
```bash
npm run docker-build
docker run --env-file ./.env rsstodolist
```
The `Dockerfile` bundles `wait-for-it.sh` so it waits for the database host before launching `npm start`.

## Commands you should know
- `npm run dev`: run via `tsx` for hot reload.
- `npm run build`: compile to `dist/` and copy static assets.
- `npm start`: run the compiled server in production mode.
- `npm run test`: run `vitest --run`.
- `npm run tdd`: run `vitest` in watch mode.
- `npm run dump`: export every row from the database to CSV (`dist/dump.js`).

## API overview
- `/` : form-driven UI; accepts `n`/`name`, `u`/`url`, `t`/`title`, `d`/`description`, `l`/`limit`, and `f`/`format`. Without `n` it shows the add form, with `n` it renders a feed (HTML or RSS).
- `/add`: adds a new entry (GET). Requires `n` (feed name) and `u` (URL); fetches title/description if omitted.
- `/del`: removes an entry for `n` and `u`.
- `/count`: returns the number of entries in a feed via `n`.
- `/list`: lists all feeds when the instance is private or when `LIST_KEY` matches `key` query. Responds in HTML.
- `/search`: search entries across feeds with `q`, optional `f=rss`, `l`/`limit`, and `key` when `PUBLIC=true`.
- `/suggest`: returns autocomplete-style suggestions for private instances (`q` required; disabled when `PUBLIC=true`).

`format=rss` on `/`, `/search`, and `/list` returns an RSS feed. Lengths are truncated per `FeedModel` constraints.

## Testing and maintenance
- Run the test suite: `npm run test` (or `npm run tdd`).
- Keep static helpers in sync by rerunning `npm run build` after modifying `src/static`.
- Use `npm run dump` to snapshot the database if you need to audit or migrate data.

## Deployment tips
- Fly.io currently hosts the official instance; self-hosting gives you more features and better privacy.
- set `PUBLIC=false` for a private deployment.
- `pm2.sh` is provided to restart the server automatically if it exceeds 192 MB of memory.

Enjoy turning links into shareable RSS feeds!
