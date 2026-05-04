#!/usr/bin/env python3
import os
from pathlib import Path
import psycopg2
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

conn = psycopg2.connect(os.environ["SUPABASE_URL"])
cur = conn.cursor()

cur.execute("SELECT COUNT(*) FROM exercises;")
print(f"Total exercises: {cur.fetchone()[0]}\n")

cur.execute("SELECT id, name, body_part, target, gif_url IS NOT NULL AS has_gif FROM exercises LIMIT 10;")
rows = cur.fetchall()
for row in rows:
    gif = "✓" if row[4] else "✗"
    print(f"[{row[0]}] {row[1]:<45} body={row[2]:<12} target={row[3]:<15} gif={gif}")

cur.execute("SELECT gif_url FROM exercises WHERE gif_url IS NOT NULL LIMIT 1;")
row = cur.fetchone()
if row:
    import webbrowser
    print(f"\nOpening GIF: {row[0]}")
    webbrowser.open(row[0])

conn.close()
