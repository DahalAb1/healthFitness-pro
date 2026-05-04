#!/usr/bin/env python3
"""
One-time script: fetch exercises from ExerciseDB, upload GIFs to Supabase
Storage, and store everything in Supabase Postgres.

Run from the project root (while the ExerciseDB key is still active):
    pip install httpx psycopg2-binary python-dotenv
    python fetch_exercises.py

Needs in .env:
    RAPID_API_EXERCISE_DB = <RapidAPI key>
    SUPABASE_URL          = postgresql://...supabase.co.../postgres  (Postgres connection string)
    SUPABASE_SERVICE_KEY  = <service_role key — Supabase dashboard → Settings → API>
"""

import json
import os
import re
import sys
import time
from pathlib import Path

import httpx
import psycopg2
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

RAPIDAPI_KEY = os.environ.get("RAPID_API_EXERCISE_DB", "")
DB_URL       = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

# Derive the Supabase HTTP base URL from the Postgres connection string.
# e.g. postgresql://...@db.akjzogtctmiyedopvjkq.supabase.co:5432/postgres
#   → https://akjzogtctmiyedopvjkq.supabase.co
_match = re.search(r"@db\.([^.]+)\.supabase\.co", DB_URL)
SUPABASE_HTTP = f"https://{_match.group(1)}.supabase.co" if _match else ""

EXERCISEDB_BASE   = "https://exercisedb.p.rapidapi.com"
EXERCISEDB_HOST   = "exercisedb.p.rapidapi.com"
BUCKET            = "exercise-gifs"
PER_GROUP         = 50

# 10 body parts × 10 + 2 target muscles × 10 = 120 exercises
BODY_PARTS     = ["back", "cardio", "chest", "lower arms", "lower legs",
                  "neck", "shoulders", "upper arms", "upper legs", "waist"]
TARGET_MUSCLES = ["biceps", "triceps"]

CREATE_TABLE = """
CREATE TABLE IF NOT EXISTS exercises (
    id                TEXT PRIMARY KEY,
    name              TEXT NOT NULL,
    body_part         TEXT,
    target            TEXT,
    equipment         TEXT,
    secondary_muscles TEXT,
    instructions      TEXT,
    gif_url           TEXT
);
"""

UPSERT = """
INSERT INTO exercises (id, name, body_part, target, equipment, secondary_muscles, instructions, gif_url)
VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
ON CONFLICT (id) DO UPDATE SET gif_url = EXCLUDED.gif_url;
"""


def check_env():
    missing = [k for k in ("RAPID_API_EXERCISE_DB", "SUPABASE_URL", "SUPABASE_SERVICE_KEY")
               if not os.environ.get(k, "").strip("<")]
    if missing:
        print(f"Missing env vars: {', '.join(missing)}")
        sys.exit(1)
    if not SUPABASE_HTTP:
        print("Could not parse project ID from SUPABASE_URL — make sure it's the Postgres connection string.")
        sys.exit(1)


def fetch(api: httpx.Client, path: str) -> list:
    r = api.get(f"{EXERCISEDB_BASE}{path}", params={"limit": PER_GROUP}, timeout=20)
    r.raise_for_status()
    data = r.json()
    return data[:PER_GROUP] if isinstance(data, list) else []


def ensure_bucket(storage: httpx.Client):
    r = storage.get(f"{SUPABASE_HTTP}/storage/v1/bucket/{BUCKET}")
    if r.status_code == 200:
        return
    r = storage.post(f"{SUPABASE_HTTP}/storage/v1/bucket",
                     json={"id": BUCKET, "name": BUCKET, "public": True})
    if r.status_code not in (200, 201):
        print(f"  WARNING: could not create bucket: {r.text[:120]}")


def fetch_gif_bytes(api: httpx.Client, exercise_id: str) -> bytes | None:
    """Fetch GIF binary directly from ExerciseDB's /image endpoint."""
    try:
        r = api.get(
            f"{EXERCISEDB_BASE}/image",
            params={"exerciseId": exercise_id, "resolution": "1080"},
            timeout=60,
        )
        if r.status_code == 200 and r.headers.get("content-type", "").startswith("image/"):
            return r.content
        print(f" [gif fetch {r.status_code}]", end="")
    except Exception as e:
        print(f" [gif error: {e}]", end="")
    return None


def upload_gif(storage: httpx.Client, exercise_id: str, gif_bytes: bytes) -> str:
    """Upload GIF bytes to Supabase Storage → return permanent public URL."""
    path = f"{exercise_id}.gif"
    r = storage.post(
        f"{SUPABASE_HTTP}/storage/v1/object/{BUCKET}/{path}",
        content=gif_bytes,
        headers={"Content-Type": "image/gif"},
    )
    if r.status_code in (200, 201) or "already exists" in r.text.lower():
        return f"{SUPABASE_HTTP}/storage/v1/object/public/{BUCKET}/{path}"
    print(f" [upload failed {r.status_code}]", end="")
    return ""


def save(conn, storage: httpx.Client, api: httpx.Client, ex: dict):
    gif_bytes = fetch_gif_bytes(api, ex["id"])
    gif_url = upload_gif(storage, ex["id"], gif_bytes) if gif_bytes else ""
    with conn.cursor() as cur:
        cur.execute(UPSERT, (
            ex["id"],
            ex["name"],
            ex.get("bodyPart"),
            ex.get("target"),
            ex.get("equipment"),
            json.dumps(ex.get("secondaryMuscles", [])),
            json.dumps(ex.get("instructions", [])),
            gif_url,
        ))
    conn.commit()


def main():
    check_env()

    print("Connecting to Supabase Postgres...")
    conn = psycopg2.connect(DB_URL)
    with conn.cursor() as cur:
        cur.execute(CREATE_TABLE)
    conn.commit()
    print("Table ready.\n")

    api_headers = {"x-rapidapi-key": RAPIDAPI_KEY, "x-rapidapi-host": EXERCISEDB_HOST}
    storage_headers = {"Authorization": f"Bearer {SUPABASE_KEY}", "apikey": SUPABASE_KEY}

    with httpx.Client(headers=api_headers) as api, \
         httpx.Client(headers=storage_headers, timeout=120) as storage:

        ensure_bucket(storage)
        total = 0

        for bp in BODY_PARTS:
            print(f"[body part] {bp}")
            for ex in fetch(api, f"/exercises/bodyPart/{bp}"):
                print(f"  {ex['id']}  {ex['name']}", end=" ", flush=True)
                save(conn, storage, api, ex)
                total += 1
                print("✓")
            time.sleep(0.4)

        for muscle in TARGET_MUSCLES:
            print(f"[target]    {muscle}")
            for ex in fetch(api, f"/exercises/target/{muscle}"):
                print(f"  {ex['id']}  {ex['name']}", end=" ", flush=True)
                save(conn, storage, api, ex)
                total += 1
                print("✓")
            time.sleep(0.4)

    conn.close()
    print(f"\nDone — {total} exercises saved to Supabase.")


if __name__ == "__main__":
    main()
