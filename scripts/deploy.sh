#!/usr/bin/env bash
set -euo pipefail

# PranaMap AI - Deployment Script
# Deploys backend to Render, frontend to Vercel

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

ENVIRONMENT="${1:-staging}"
echo "============================================"
echo "  PranaMap AI - Deploy ($ENVIRONMENT)"
echo "============================================"

# ---- Pre-deployment checks ----
echo ""
echo ">> Running pre-deployment checks..."

# Lint
if command -v ruff >/dev/null 2>&1; then
    echo "   Running ruff linter..."
    ruff check "$ROOT_DIR/backend/" "$ROOT_DIR/scripts/" || { echo "Fix lint errors before deploying."; exit 1; }
fi

# Type check
if command -v mypy >/dev/null 2>&1; then
    echo "   Running mypy type checker..."
    mypy "$ROOT_DIR/backend/" --ignore-missing-imports || echo "   Type check warnings (non-fatal)."
fi

# Tests
if [ -d "$ROOT_DIR/tests" ]; then
    echo "   Running tests..."
    cd "$ROOT_DIR"
    python -m pytest tests/ -x -q --tb=short || { echo "Tests failed. Fix before deploying."; exit 1; }
    cd "$ROOT_DIR"
fi

echo "   All checks passed."

# ---- Build frontend ----
echo ""
echo ">> Building frontend..."
if [ -f "$ROOT_DIR/frontend/package.json" ]; then
    cd "$ROOT_DIR/frontend"
    npm run build
    echo "   Frontend build complete."
    cd "$ROOT_DIR"
fi

# ---- Deploy backend (Render) ----
echo ""
echo ">> Deploying backend to Render..."
if command -v git >/dev/null 2>&1 && [ -d "$ROOT_DIR/.git" ]; then
    if [ "$ENVIRONMENT" = "production" ]; then
        echo "   Pushing to production branch..."
        git push origin main
    else
        echo "   Pushing to staging branch..."
        git push origin develop
    fi
    echo "   Push complete. Render will auto-deploy."
else
    echo "   Not a git repo - skipping Render deploy."
    echo "   Deploy manually or push to GitHub."
fi

# ---- Deploy frontend (Vercel) ----
echo ""
echo ">> Deploying frontend to Vercel..."
if command -v vercel >/dev/null 2>&1 && [ -f "$ROOT_DIR/frontend/vercel.json" ]; then
    cd "$ROOT_DIR/frontend"
    if [ "$ENVIRONMENT" = "production" ]; then
        vercel --prod --yes
    else
        vercel --yes
    fi
    echo "   Vercel deployment complete."
    cd "$ROOT_DIR"
else
    echo "   Vercel CLI not found or no vercel.json."
    echo "   Deploy manually: cd frontend && vercel --prod"
fi

echo ""
echo "============================================"
echo "  Deployment complete ($ENVIRONMENT)"
echo "============================================"
