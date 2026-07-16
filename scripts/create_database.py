#!/usr/bin/env python3
"""
PranaMap AI - Database Creation Script

Creates the PostgreSQL database, PostGIS extension, and applies schema.
Standalone script that doesn't require the full application stack.
"""

import os
import sys
from pathlib import Path

import psycopg2
from dotenv import load_dotenv
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

load_dotenv()

ROOT_DIR = Path(__file__).resolve().parent.parent
SCHEMA_FILE = ROOT_DIR / "database" / "schema.sql"
SEED_FILE = ROOT_DIR / "database" / "seed.sql"

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "port": int(os.getenv("DB_PORT", 5432)),
    "user": os.getenv("DB_USER", "pranamap_user"),
    "password": os.getenv("DB_PASSWORD", "pranamap_dev_2024"),
    "dbname": os.getenv("DB_NAME", "pranamap"),
}

SUPERUSER_CONFIG = {
    "host": DB_CONFIG["host"],
    "port": DB_CONFIG["port"],
    "user": "postgres",
    "password": os.getenv("PGPASSWORD", ""),
}


def create_role_and_database():
    """Create database role and database if they don't exist."""
    print(">> Connecting to PostgreSQL as superuser...")
    try:
        conn = psycopg2.connect(**SUPERUSER_CONFIG)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()

        role_name = DB_CONFIG["user"]
        db_name = DB_CONFIG["dbname"]

        cur.execute("SELECT 1 FROM pg_roles WHERE rolname = %s", (role_name,))
        if not cur.fetchone():
            print(f"   Creating role '{role_name}'...")
            cur.execute(
                f"CREATE ROLE {role_name} WITH LOGIN PASSWORD %s CREATEDB",
                (DB_CONFIG["password"],),
            )
        else:
            print(f"   Role '{role_name}' already exists.")

        cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (db_name,))
        if not cur.fetchone():
            print(f"   Creating database '{db_name}'...")
            cur.execute(f"CREATE DATABASE {db_name} OWNER {role_name}")
        else:
            print(f"   Database '{db_name}' already exists.")

        cur.execute(f"GRANT ALL PRIVILEGES ON DATABASE {db_name} TO {role_name}")

        cur.close()
        conn.close()
        print("   Done.")
        return True
    except psycopg2.OperationalError as e:
        print(f"   Could not connect as superuser: {e}")
        print("   Attempting direct connection to target database...")
        return False


def apply_schema():
    """Apply the schema.sql file to the database."""
    print("\n>> Applying schema...")
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    schema_sql = SCHEMA_FILE.read_text()
    try:
        cur.execute(schema_sql)
        conn.commit()
        print("   Schema applied successfully.")
    except psycopg2.errors.DuplicateTable:
        conn.rollback()
        print("   Tables already exist. Skipping schema creation.")
    except Exception as e:
        conn.rollback()
        print(f"   Schema error: {e}")
        conn.close()
        return False

    cur.close()
    conn.close()
    return True


def seed_data():
    """Apply the seed.sql file."""
    if not SEED_FILE.exists():
        print("\n>> No seed file found. Skipping.")
        return True

    print("\n>> Seeding sample data...")
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    seed_sql = SEED_FILE.read_text()
    try:
        cur.execute(seed_sql)
        conn.commit()
        print("   Seed data inserted successfully.")
    except psycopg2.errors.UniqueViolation:
        conn.rollback()
        print("   Seed data already exists. Skipping.")
    except Exception as e:
        conn.rollback()
        print(f"   Seed error: {e}")
        conn.close()
        return False

    cur.close()
    conn.close()
    return True


def verify_installation():
    """Verify PostGIS is installed and tables exist."""
    print("\n>> Verifying installation...")
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()

    cur.execute("SELECT PostGIS_Version();")
    postgis_version = cur.fetchone()[0]
    print(f"   PostGIS version: {postgis_version}")

    cur.execute("""
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public'
        ORDER BY table_name;
    """)
    tables = [row[0] for row in cur.fetchall()]
    print(f"   Tables: {', '.join(tables)}")

    cur.execute("SELECT COUNT(*) FROM wards;")
    ward_count = cur.fetchone()[0]
    print(f"   Wards loaded: {ward_count}")

    cur.close()
    conn.close()


def main():
    print("=" * 50)
    print("  PranaMap AI - Database Setup")
    print("=" * 50)

    # Check if schema file exists
    if not SCHEMA_FILE.exists():
        print(f"\nERROR: Schema file not found at {SCHEMA_FILE}")
        sys.exit(1)

    # Try to create role/database first
    create_role_and_database()

    # Try connecting to the target database
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        conn.close()
    except psycopg2.OperationalError:
        print(f"\nCannot connect to database '{DB_CONFIG['dbname']}' as '{DB_CONFIG['user']}'")
        print("Please ensure PostgreSQL is running and credentials are correct.")
        sys.exit(1)

    # Apply schema and seed
    if apply_schema():
        seed_data()
        verify_installation()
        print("\nDatabase setup complete!")
    else:
        print("\nDatabase setup failed. Check the error messages above.")
        sys.exit(1)


if __name__ == "__main__":
    main()
