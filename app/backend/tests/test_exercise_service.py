"""
Unit tests for resolve_exercise in exercise_service.py.

resolve_exercise is the lookup layer between the routes and ExerciseClient.
It tries to find an exercise by ID first, then falls back to name search.
If either call comes back rate-limited, it must stop immediately and return
the error — making an extra API call while already rate-limited would be wasteful.
"""
