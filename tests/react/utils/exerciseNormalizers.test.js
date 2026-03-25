import { describe, it, expect } from 'vitest';
import {
  normalizeTemplateExercise,
  normalizeCustomExercise,
} from '@/components/activeWorkout/exerciseNormalizers';

describe('normalizeTemplateExercise', () => {
  it('uses details.name as the exercise name', () => {
    const result = normalizeTemplateExercise({ details: { name: 'Squat' }, exercise_id: 'sq1' });
    expect(result.name).toBe('Squat');
  });

  it('falls back to exercise_id when details.name is absent', () => {
    const result = normalizeTemplateExercise({ exercise_id: 'sq1' });
    expect(result.name).toBe('sq1');
  });

  it('defaults name to "Exercise" when no name or id is present', () => {
    const result = normalizeTemplateExercise({});
    expect(result.name).toBe('Exercise');
  });

  it('uses target_sets', () => {
    const result = normalizeTemplateExercise({ target_sets: 5 });
    expect(result.sets).toBe(5);
  });

  it('defaults sets to 3 when target_sets is absent', () => {
    const result = normalizeTemplateExercise({});
    expect(result.sets).toBe(3);
  });

  it('uses target_reps', () => {
    const result = normalizeTemplateExercise({ target_reps: 12 });
    expect(result.reps).toBe(12);
  });

  it('defaults reps to 10 when target_reps is absent', () => {
    const result = normalizeTemplateExercise({});
    expect(result.reps).toBe(10);
  });

  it('uses details.muscle_group for muscleGroup', () => {
    const result = normalizeTemplateExercise({ details: { muscle_group: 'chest' } });
    expect(result.muscleGroup).toBe('chest');
  });

  it('defaults muscleGroup to empty string when absent', () => {
    const result = normalizeTemplateExercise({});
    expect(result.muscleGroup).toBe('');
  });

  it('uses details.equipment for equipment', () => {
    const result = normalizeTemplateExercise({ details: { equipment: 'barbell' } });
    expect(result.equipment).toBe('barbell');
  });

  it('uses details.image_url for imageUrl', () => {
    const result = normalizeTemplateExercise({ details: { image_url: 'http://a.com/img.gif' } });
    expect(result.imageUrl).toBe('http://a.com/img.gif');
  });

  it('sets rest to null', () => {
    const result = normalizeTemplateExercise({});
    expect(result.rest).toBeNull();
  });
});

describe('normalizeCustomExercise', () => {
  it('uses exercise_name', () => {
    const result = normalizeCustomExercise({ exercise_name: 'Bench Press' });
    expect(result.name).toBe('Bench Press');
  });

  it('defaults name to "Exercise" when exercise_name is absent', () => {
    const result = normalizeCustomExercise({});
    expect(result.name).toBe('Exercise');
  });

  it('uses sets', () => {
    const result = normalizeCustomExercise({ sets: 4 });
    expect(result.sets).toBe(4);
  });

  it('defaults sets to 3', () => {
    const result = normalizeCustomExercise({});
    expect(result.sets).toBe(3);
  });

  it('uses reps', () => {
    const result = normalizeCustomExercise({ reps: 8 });
    expect(result.reps).toBe(8);
  });

  it('defaults reps to 10', () => {
    const result = normalizeCustomExercise({});
    expect(result.reps).toBe(10);
  });

  it('has empty string muscleGroup, equipment, and imageUrl', () => {
    const result = normalizeCustomExercise({});
    expect(result.muscleGroup).toBe('');
    expect(result.equipment).toBe('');
    expect(result.imageUrl).toBe('');
  });

  it('sets rest to null', () => {
    const result = normalizeCustomExercise({});
    expect(result.rest).toBeNull();
  });
});
