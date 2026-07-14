# PranaMap AI — Deployment Guide

## Environments

| Environment | Purpose | URL |
|-------------|---------|-----|
| **Local** | Development on your machine | `localhost:3000` (frontend), `localhost:8000` (backend) |
| **Staging** | Pre-production testing | `staging.pranamap.ai` |
| **Production** | Live platform | `pranamap.ai` |

---

## Prerequisites

- Docker & Docker Compose v2+
- Node.js 18+ (for local frontend dev)
- Python 3.11+ (for local backend dev)
- PostgreSQL 15 client tools (for direct DB access)
- Git

---

## Local Development

### 1. Clone & Configure

```bash
git clone https://github.com/your-org/PranaMap-AI.git
cd PranaMap-AI

cp .env.example .env
```

Edit `.env` with your API keys:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pranamap

# APIs
OPENWEATHER_API_KEY=your_key_here
SENTINEL_HUB_CLIENT_ID=your_client_id
SENTINEL_HUB_CLIENT_SECRET=your_client_secret
NASA_FIRMS_API_KEY=your_key_here

# Auth
JWT_SECRET_KEY=your_secret_key_here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

### 2. Docker Compose (Recommended)

```bash
docker-compose up -d
```

This starts:

| Service | Port | Description |
|---------|------|-------------|
| `database` | 5432 | PostgreSQL + PostGIS |
| `backend` | 8000 | FastAPI application |
| `frontend` | 3000 | Next.js development server |

Verify services are running:

```bash
docker-compose ps
curl http://localhost:8000/health
```

### 3. Manual Setup (Without Docker)

**Database:**

```bash
# Create the database
createdb pranamap

# Run schema and seed scripts
psql pranamap < database/schema.sql
psql pranamap < database/seed.sql
```

**Backend:**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

### 4. Running ML Training Locally

```bash
cd ml
pip install -r requirements.txt
python training/train.py --config training/config.yaml
```

Model artifacts are saved to `ml/models/`.

---

## Production Deployment

### Frontend → Vercel

1. Connect the GitHub repository to Vercel.
2. Set the **Root Directory** to `frontend`.
3. Add environment variables in the Vercel dashboard:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://api.pranamap.ai/v1` |
| `NEXT_PUBLIC_WS_URL` | `wss://api.pranamap.ai/ws` |

4. Deploy settings:

| Setting | Value |
|---------|-------|
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Node.js Version | 18.x |

5. Custom domain: configure `pranamap.ai` in Vercel DNS.

### Backend → Render

1. Create a new **Web Service** on Render.
2. Connect the GitHub repository.
3. Configure:

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Environment | Docker |
| Dockerfile | `./Dockerfile` |
| Port | 8000 |
| Instance Type | Standard (or Professional for production) |

4. Add environment variables (same as `.env`, plus production values).
5. Set **Health Check Path** to `/health`.

### Database → Render (or AWS RDS)

1. Create a **PostgreSQL** instance on Render (or RDS).
2. Enable the PostGIS extension:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

3. Run the schema:

```bash
psql $DATABASE_URL < database/schema.sql
```

4. Update `DATABASE_URL` in the backend environment variables.

### Nginx Reverse Proxy

For self-hosted deployments, use the provided Nginx config:

```nginx
# deployment/nginx/nginx.conf

server {
    listen 80;
    server_name api.pranamap.ai;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.pranamap.ai;

    ssl_certificate /etc/ssl/certs/pranamap.pem;
    ssl_certificate_key /etc/ssl/private/pranamap.key;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /ws {
        proxy_pass http://backend:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_read_timeout 86400;
    }
}
```

---

## CI/CD Pipeline

### GitHub Actions

```yaml
# deployment/github_actions/ci.yml

name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Install backend dependencies
        run: pip install -r backend/requirements.txt -r backend/requirements-dev.txt

      - name: Lint backend
        run: ruff check backend/

      - name: Type-check backend
        run: mypy backend/

      - name: Run backend tests
        run: pytest backend/tests/ -v

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "18"

      - name: Install frontend dependencies
        run: npm ci
        working-directory: frontend

      - name: Lint frontend
        run: npm run lint
        working-directory: frontend

      - name: Type-check frontend
        run: npm run typecheck
        working-directory: frontend

      - name: Build frontend
        run: npm run build
        working-directory: frontend
```

### Deployment Triggers

| Branch | Action |
|--------|--------|
| `develop` | Deploy to staging |
| `main` | Deploy to production |
| Pull request | Run lint, type-check, and tests |

---

## Database Migrations

Migrations are managed with **Alembic**:

```bash
# Generate a new migration
cd backend
alembic revision --autogenerate -m "add new column"

# Apply migrations
alembic upgrade head

# Rollback one step
alembic downgrade -1
```

Migration files live in `backend/alembic/versions/`.

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `OPENWEATHER_API_KEY` | Yes | OpenWeatherMap API key |
| `SENTINEL_HUB_CLIENT_ID` | No | Sentinel Hub credentials (for satellite data) |
| `SENTINEL_HUB_CLIENT_SECRET` | No | Sentinel Hub credentials |
| `NASA_FIRMS_API_KEY` | No | NASA FIRMS API key |
| `JWT_SECRET_KEY` | Yes | Secret for signing JWT tokens |
| `JWT_ALGORITHM` | No | Default: `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | Default: `15` |
| `CORS_ORIGINS` | No | Comma-separated allowed origins |
| `LOG_LEVEL` | No | `DEBUG`, `INFO`, `WARNING`, `ERROR` (default: `INFO`) |
| `NEXT_PUBLIC_API_URL` | Yes | Frontend → Backend API URL |
| `NEXT_PUBLIC_WS_URL` | Yes | Frontend → Backend WebSocket URL |

---

## Monitoring & Logs

### Application Logs

Logs are structured JSON emitted to stdout. In production, collect with:

- **Render**: Built-in log drain
- **Docker**: `docker-compose logs -f backend`
- **Self-hosted**: Pipe to `journalctl` or a log aggregator (Datadog, Grafana Loki)

### Health Check

```bash
curl http://localhost:8000/health
# Returns: {"status": "healthy", "database": "connected", "models": ["xgb_aqi_v3", "lgb_aqi_v3"]}
```

### Uptime Monitoring

Configure an external uptime checker (UptimeRobot, BetterStack) to ping `/health` every 5 minutes.

---

## Backup & Recovery

### Database Backups

```bash
# Manual backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore
psql $DATABASE_URL < backup_20260714_150000.sql
```

Automated daily backups are configured via the database provider (Render automatic backups or AWS RDS automated snapshots with 7-day retention).

### Model Artifact Backups

Model files in `ml/models/` are versioned in Git. The active model path is tracked in the `forecast_models` table, so recovering from a bad model promotion is a single database UPDATE.
