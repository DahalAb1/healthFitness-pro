DESIGN DOCUMENT: 

1. DATABASE SCHEMA 
-------------------------------------
The system utilizes a relational database structure to manage users, 
custom workout routines, and a comprehensive exercise library.


A. USER TABLE
   - id (PK): Unique identifier for the user.
   - username: User's chosen display name.
   - email: Registered email address.

B. WORKOUTTEMPLATE TABLE
   - id (PK): Unique identifier for the routine header.
   - name: The title of the workout (e.g., "Monday Push Day").
   - description: Optional notes about the workout's focus.
   - creator_id (FK): Links to the User table.

C. EXERCISE TABLE (Core Library)
   - id (PK): Unique identifier for the exercise.
   - name: Name of the movement (e.g., "Bench Press").
   - muscle_group: Primary muscle targeted (e.g., "Chest").
   - equipment: Needed tools (e.g., "Barbell").
   - description: Step-by-step performance instructions.
   - image_url: Link to the visual guide (webp/mp4).

D. TEMPLATEEXERCISE TABLE 
   - id (PK): Primary key for the specific entry.
   - template_id (FK): Links to the WorkoutTemplate.
   - exercise_id (FK): Links to the Exercise.
   - target_sets: Number of sets planned for this routine.
   - target_reps: Number of reps planned for this routine.


2. FASTAPI SCHEMA DESIGN (PYDANTIC)
-----------------------------------
The Exercise schema is designed to handle data validation for the 
following fields:
- id: int
- name: str
- muscle_group: str
- equipment: str
- description: str


3. API ENDPOINTS DESIGN
-----------------------
These endpoints allow the frontend to interact with the database 
and external API data:

A. GET /exercises
   - Function: Retrieves the list of all available exercises.
   - Feature: Includes "filter by muscle" functionality to narrow 
     results by specific muscle groups.

B. GET /exercises/{id}
   - Function: Retrieves the full detailed profile of a specific 
     exercise using its unique ID.
   - Return: Includes name, muscle_group, equipment, and description.


4. STORAGE STRATEGY
-------------------
- Local Storage: SQLite is used for development to store User and 
  Template data locally.
- Normalization: The design uses a Many-to-Many relationship via the 
  TemplateExercise table to prevent data duplication and ensure 
  database efficiency.


