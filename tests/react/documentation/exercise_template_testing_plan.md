# Exercise Template Frontend Unit Testing Plan

## Overview
This document outlines the unit testing plan for the exercise template frontend feature. The purpose of these tests is to verify that the `useTemplatesView` hook manages template and exercise state correctly, and that the `ExerciseRow` component propagates user input changes to its parent as expected.

---

## Test 1: `useTemplatesView` loads templates on mount

**Feature:** Exercise template list loading.

**Code being tested:** `useTemplatesView` hook in `src/hooks/useTemplatesView.js`

**Fields used:**
- `templates` — state array populated from `getTemplates` API call
- `getTemplates` — mocked API utility

**Return object:**
The hook returns a `templates` array containing objects with:
- `id`
- `name`

**Expected result:**
After the hook mounts, `getTemplates` should be called and `templates` should be populated with the returned data.

---

## Test 2: `useTemplatesView` — `openTemplate` sets selected template and loads its exercises

**Feature:** Exercise list loading for a selected template.

**Code being tested:** `openTemplate` function returned by `useTemplatesView` in `src/hooks/useTemplatesView.js`

**Fields used:**
- `selectedTemplate` — set to the template passed into `openTemplate`
- `exercises` — populated from `getTemplateExercises` response
- `loadingExercises` — boolean flag toggled during fetch
- `getTemplateExercises(id)` — mocked API utility called with template id

**Return object:**
The hook returns:
- `selectedTemplate`: the opened template object (`{ id, name }`)
- `exercises`: array of exercise objects (`{ id, exercise_name, sets, reps }`)
- `loadingExercises`: `false` once fetch completes

**Expected result:**
After calling `openTemplate`, `selectedTemplate` should equal the passed template, `exercises` should be populated from the API response, and `loadingExercises` should return to `false`.

---

## Test 3: `ExerciseRow` calls `onUpdate` with the correct field and value when an input changes

**Feature:** Inline exercise editing in a workout template row.

**Code being tested:** `ExerciseRow` component in `src/components/workoutTemplate/ExerciseRow.jsx`

**Fields used:**
- `row.id` — identifies which row triggered the update
- `row.exercise`, `row.sets`, `row.reps`, `row.rest` — current values rendered in inputs
- `onUpdate(id, field, value)` — callback prop called on input change

**Return object:**
`onUpdate` is called with:
- `id`: the row's id
- `field`: the name of the changed field (e.g. `'exercise'`, `'sets'`, `'reps'`, `'rest'`)
- `value`: the new input value (string for `exercise`/`rest`, number for `sets`/`reps`)

**Expected result:**
When a user changes any input field, `onUpdate` should be called exactly once with the correct row id, field name, and updated value.

---

## Suggested Test Stack
- Vitest
- React Testing Library (`@testing-library/react`)
- `vi.fn()` for mocking API calls and callbacks

## Definition of Done
- Hook state transitions (loading, populated, empty) are verified.
- `openTemplate` correctly wires template selection to exercise fetching.
- `ExerciseRow` correctly delegates all field changes to its parent via `onUpdate`.
- All tests pass locally with `vitest run`.
