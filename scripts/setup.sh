#!/usr/bin/env bash
set -euo pipefail

# PranaMap AI - Project Setup Script
# Sets up the full development environment

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

echo "============================================"
echo "  PranaMap AI - Project Setup"
echo "============================================"

# ---- System checks ----
command -v python3 >/dev/null 2>&1 || { echo "ERROR: python3 not found"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "ERROR: node not found"; exit 1; }
command -v psql >/dev/null 2>&1 || { echo "WARNING: psql not found - database setup will be skipped"; }

# ---- Create directory structure ----
echo ""
echo ">> Creating directory structure..."
mkdir -p "$ROOT_DIR"/{geospatial/{wards,shapefiles,raster,satellite,hotspots,roads,industries,hospitals,schools,utilities}}
mkdir -p "$ROOT_DIR"/{data_pipeline/{weather,aqi,satellite,nasa_firms,osm,scheduler,preprocess}}
mkdir -p "$ROOT_DIR"/{database/postgis}
mkdir -p "$ROOT_DIR"/{scripts}
mkdir -p "$ROOT_DIR"/{tests/{frontend,backend,agents,ml,integration}}
mkdir -p "$ROOT_DIR"/{logs,cache,model_artifacts}
echo "   Done."

# ---- Python virtual environment ----
echo ""
echo ">> Setting up Python environment..."
if [ ! -d "$ROOT_DIR/.venv" ]; then
    python3 -m venv "$ROOT_DIR/.venv"
    echo "   Virtual environment created."
else
    echo "   Virtual environment already exists."
fi

source "$ROOT_DIR/.venv/bin/activate"

# ---- Python dependencies ----
echo ""
echo ">> Installing Python dependencies..."
pip install --upgrade pip setuptools wheel

if [ -f "$ROOT_DIR/requirements.txt" ]; then
    pip install -r "$ROOT_DIR/requirements.txt"
    echo "   Installed from requirements.txt"
else
    echo "   No requirements.txt found - installing core dependencies..."
    pip install \
        fastapi uvicorn[standard] \
        sqlalchemy psycopg2-binary geoalchemy2 \
        httpx aiohttp \
        pandas numpy scikit-learn \
        tensorflow keras \
        geopandas shapely fiona rasterio \
        rasterstats pyproj \
        celery redis \
        pydantic python-dotenv \
        pytest pytest-asyncio pytest-cov \
        ruff mypy
fi

# ---- Node.js / frontend ----
echo ""
echo ">> Setting up frontend..."
if [ -f "$ROOT_DIR/frontend/package.json" ]; then
    cd "$ROOT_DIR/frontend"
    npm install
    echo "   Frontend dependencies installed."
else
    echo "   No frontend/package.json found - skipping npm install."
fi

# ---- Database setup ----
echo ""
echo ">> Setting up database..."
DB_NAME="${DB_NAME:-pranamap}"
DB_USER="${DB_USER:-pranamap_user}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

if command -v psql >/dev/null 2>&1; then
    echo "   Creating database and user (may prompt for postgres password)..."
    PGPASSWORD="${PGPASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c "
        DO \$\$
        BEGIN
            IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
                CREATE ROLE ${DB_USER} WITH LOGIN PASSWORD 'pranamap_dev_2024';
            END IF;
        END
        \$\$
    " 2>/dev/null || echo "   Warning: Could not create role (may already exist or need manual setup)"

    PGPASSWORD="${PGPASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c "
        SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
        WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')
    " 2>/dev/null

    PGPASSWORD="${PGPASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U postgres -c "
        GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
    " 2>/dev/null || true

    echo "   Applying schema..."
    if [ -f "$ROOT_DIR/database/schema.sql" ]; then
        PGPASSWORD="${PGPASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
            -f "$ROOT_DIR/database/schema.sql" 2>/dev/null \
            || echo "   Schema application had warnings (check manually)"
    fi

    echo "   Seeding data..."
    if [ -f "$ROOT_DIR/database/seed.sql" ]; then
        PGPASSWORD="${PGPASSWORD:-}" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
            -f "$ROOT_DIR/database/seed.sql" 2>/dev/null \
            || echo "   Seed data had warnings (may already exist)"
    fi

    echo "   Database setup complete."
else
    echo "   psql not found - skipping database setup. Install PostgreSQL and run manually."
fi

# ---- Environment file ----
echo ""
echo ">> Checking .env file..."
if [ ! -f "$ROOT_DIR/.env" ]; then
    cat > "$ROOT_DIR/.env" << 'ENVEOF'
# PranaMap AI - Environment Variables
DATABASE_URL=postgresql://pranamap_user:pranamap_dev_2024@localhost:5432/pranamap
REDIS_URL=redis://localhost:6379/0

# API Keys (fill in real values)
OPENWEATHER_API_KEY=
NASA_FIRMS_API_KEY=
WAQI_API_KEY=
WEATHERAPI_KEY=
SENTINEL_HUB_CLIENT_ID=
SENTINEL_HUB_CLIENT_SECRET=

# Application
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=INFO
API_HOST=0.0.0.0
API_PORT=8000

# ML Model
MODEL_PATH=./model_artifacts/
MODEL_VERSION=v1.2
ENVEOF
    echo "   Created .env template - fill in API keys."
else
    echo "   .env already exists."
fi

echo ""
echo "============================================"
echo "  Setup complete!"
echo "  Next steps:"
echo "    1. Fill in API keys in .env"
echo "    2. source .venv/bin/activate"
echo "    3. Run: python scripts/download_data.py"
echo "    4. Run: python scripts/train_model.py"
echo "    5. Run: uvicorn backend.app:app --reload"
echo "============================================"
