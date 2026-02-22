
OFFICIAL DESIGN: API & DATA MODEL


1. EXERCISE SCHEMA
-----------------------
Entity: Exercise
- id: Integer 
- name: String
- exercise_type: String
- equipment: String
- description: Text/String

2. API ENDPOINTS
----------------
- GET /exercises: Retrieve full library.
- GET /exercises?muscle=[group]: Filtered library search.
- GET /exercises/{id}: Retrieve specific details for one move.

3. DATA FLOW
------------
- Frontend requests data via FastAPI endpoints.
- Backend queries the SQL database using the Exercise Schema.
- Database returns structured data objects to the user interface.
