 WorkoutCreator_Template

- template_id: Integer (Unique ID)
- template_name: String (Required)
- creator_notes: Text (Optional)
- exercise_sequence: List [
    {
      exercise_id: Integer 
      target_sets: Integer
      target_reps: Integer
      rest_period: String
    }
  ]

INTERACTION LOGIC:
* [ADD FROM LIBRARY]: Opens a modal/overlay querying the Master_Library.
* [FILTER/SEARCH]: Allows user to find exercises by 'equipment' or 'muscle_group'.
* [SELECT]: Pushes the chosen Exercise_ID into the 'exercise_sequence' list.

DESIGN NOTES:
* The 'Add' button is the trigger for the relational data pull.
* Users should be able to add the same exercise multiple times (e.g., Bench Press at start and end).