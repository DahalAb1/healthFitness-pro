import json
import os
import sqlite3
import threading
from typing import List

DB_PATH = os.path.join(os.path.dirname(__file__), 'user_workouts.db')
OLD_JSON = os.path.join(os.path.dirname(__file__), 'user_workouts_store.json')
_lock = threading.Lock()


def _conn():
    return sqlite3.connect(DB_PATH, check_same_thread=False)


def init_db():
    with _lock:
        conn = _conn()
        c = conn.cursor()
        c.execute(
            """
            CREATE TABLE IF NOT EXISTS workouts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                name TEXT,
                creator_notes TEXT,
                exercises TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.commit()

        # migrate old JSON store if present and DB empty
        c.execute('SELECT COUNT(*) FROM workouts')
        count = c.fetchone()[0]
        if count == 0 and os.path.exists(OLD_JSON):
            try:
                with open(OLD_JSON, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                for w in data.get('workouts', []):
                    exercises_json = json.dumps(w.get('exercises', []), ensure_ascii=False)
                    c.execute(
                        'INSERT INTO workouts (user_id, name, creator_notes, exercises, created_at) VALUES (?,?,?,?,?)',
                        (w.get('user_id'), w.get('name'), w.get('creator_notes'), exercises_json, w.get('created_at'))
                    )
                conn.commit()
                # optional: remove old JSON file
                # os.remove(OLD_JSON)
            except Exception:
                # if migration fails, ignore and continue
                pass

        conn.close()


def add_workout(workout_dict: dict, max_per_user: int = 10) -> dict:
    init_db()
    with _lock:
        conn = _conn()
        c = conn.cursor()
        user_id = workout_dict.get('user_id')
        # enforce max per user
        c.execute('SELECT COUNT(*) FROM workouts WHERE user_id = ?', (user_id,))
        count = c.fetchone()[0]
        if count >= max_per_user:
            # delete oldest for this user
            c.execute('DELETE FROM workouts WHERE id IN (SELECT id FROM workouts WHERE user_id = ? ORDER BY created_at ASC LIMIT 1)', (user_id,))

        exercises_json = json.dumps(workout_dict.get('exercises', []), ensure_ascii=False)
        c.execute(
            'INSERT INTO workouts (user_id, name, creator_notes, exercises) VALUES (?,?,?,?)',
            (user_id, workout_dict.get('name'), workout_dict.get('creator_notes'), exercises_json)
        )
        conn.commit()
        last_id = c.lastrowid
        c.execute('SELECT * FROM workouts WHERE id = ?', (last_id,))
        row = c.fetchone()
        conn.close()

        return {
            'id': row[0],
            'user_id': row[1],
            'name': row[2],
            'creator_notes': row[3],
            'exercises': json.loads(row[4] or '[]')
        }


def list_workouts() -> List[dict]:
    init_db()
    with _lock:
        conn = _conn()
        c = conn.cursor()
        c.execute('SELECT * FROM workouts ORDER BY created_at ASC')
        rows = c.fetchall()
        conn.close()
        result = []
        for row in rows:
            result.append({
                'id': row[0],
                'user_id': row[1],
                'name': row[2],
                'creator_notes': row[3],
                'exercises': json.loads(row[4] or '[]')
            })
        return result


def list_workouts_for_user(user_id: int) -> List[dict]:
    init_db()
    with _lock:
        conn = _conn()
        c = conn.cursor()
        c.execute('SELECT * FROM workouts WHERE user_id = ? ORDER BY created_at ASC', (user_id,))
        rows = c.fetchall()
        conn.close()
        return [
            {
                'id': row[0],
                'user_id': row[1],
                'name': row[2],
                'creator_notes': row[3],
                'exercises': json.loads(row[4] or '[]')
            }
            for row in rows
        ]


def delete_workout(workout_id: int, user_id: int) -> bool:
    init_db()
    with _lock:
        conn = _conn()
        c = conn.cursor()
        c.execute('DELETE FROM workouts WHERE id = ? AND user_id = ?', (workout_id, user_id))
        conn.commit()
        deleted = c.rowcount > 0
        conn.close()
        return deleted

