import { describe, it, expect } from 'vitest';
import { normalizeExercise, unwrapExerciseList, BODY_PART_MAP } from '@/utils/exerciseUtils';

describe('BODY_PART_MAP', () => {
  it('maps CHEST to chest', () => {
    expect(BODY_PART_MAP.CHEST).toBe('chest');
  });

  it('maps ABS to waist', () => {
    expect(BODY_PART_MAP.ABS).toBe('waist');
  });

  it('maps LEGS to thighs', () => {
    expect(BODY_PART_MAP.LEGS).toBe('thighs');
  });

  it('maps BACK to back', () => {
    expect(BODY_PART_MAP.BACK).toBe('back');
  });

  it('maps SHOULDERS to shoulders', () => {
    expect(BODY_PART_MAP.SHOULDERS).toBe('shoulders');
  });

  it('has 7 entries', () => {
    expect(Object.keys(BODY_PART_MAP)).toHaveLength(7);
  });
});

describe('normalizeExercise', () => {
  it('uses exerciseId when available', () => {
    const result = normalizeExercise({ exerciseId: 'abc123', name: 'Squat' });
    expect(result.id).toBe('abc123');
  });

  it('falls back to id when exerciseId is absent', () => {
    const result = normalizeExercise({ id: 'xyz', name: 'Bench Press' });
    expect(result.id).toBe('xyz');
  });

  it('uses targetMuscles[0] for muscle_group', () => {
    const result = normalizeExercise({ id: '1', name: 'Curl', targetMuscles: ['biceps'] });
    expect(result.muscle_group).toBe('biceps');
  });

  it('falls back to bodyParts[0] for muscle_group', () => {
    const result = normalizeExercise({ id: '1', name: 'Curl', bodyParts: ['upper arms'] });
    expect(result.muscle_group).toBe('upper arms');
  });

  it('falls back to target for muscle_group', () => {
    const result = normalizeExercise({ id: '1', name: 'Curl', target: 'biceps' });
    expect(result.muscle_group).toBe('biceps');
  });

  it('returns empty string when no muscle group info present', () => {
    const result = normalizeExercise({ id: '1', name: 'Plank' });
    expect(result.muscle_group).toBe('');
  });

  it('uses equipments[0] for equipment', () => {
    const result = normalizeExercise({ id: '1', name: 'Dumbbell Curl', equipments: ['dumbbell'] });
    expect(result.equipment).toBe('dumbbell');
  });

  it('falls back to equipment field when equipments is absent', () => {
    const result = normalizeExercise({ id: '1', name: 'Barbell Curl', equipment: 'barbell' });
    expect(result.equipment).toBe('barbell');
  });

  it('returns empty string when no equipment info present', () => {
    const result = normalizeExercise({ id: '1', name: 'Push-up' });
    expect(result.equipment).toBe('');
  });

  it('uses instructions for description', () => {
    const result = normalizeExercise({ id: '1', name: 'Squat', instructions: ['Stand up', 'Sit down'] });
    expect(result.description).toEqual(['Stand up', 'Sit down']);
  });

  it('falls back to steps for description', () => {
    const result = normalizeExercise({ id: '1', name: 'Push-up', steps: 'Do a push-up.' });
    expect(result.description).toBe('Do a push-up.');
  });

  it('uses imageUrl for image_url', () => {
    const result = normalizeExercise({ id: '1', name: 'Squat', imageUrl: 'http://img.test/squat.gif' });
    expect(result.image_url).toBe('http://img.test/squat.gif');
  });

  it('falls back to gifUrl for image_url', () => {
    const result = normalizeExercise({ id: '1', name: 'Squat', gifUrl: 'http://img.test/squat.gif' });
    expect(result.image_url).toBe('http://img.test/squat.gif');
  });

  it('falls back to image_url field directly', () => {
    const result = normalizeExercise({ id: '1', name: 'Squat', image_url: 'http://img.test/squat.png' });
    expect(result.image_url).toBe('http://img.test/squat.png');
  });

  it('returns all expected keys in the normalized shape', () => {
    const result = normalizeExercise({ id: '1', name: 'X' });
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('muscle_group');
    expect(result).toHaveProperty('equipment');
    expect(result).toHaveProperty('description');
    expect(result).toHaveProperty('image_url');
  });
});

describe('unwrapExerciseList', () => {
  it('returns a plain array as-is', () => {
    const arr = [{ id: 1 }, { id: 2 }];
    expect(unwrapExerciseList(arr)).toBe(arr);
  });

  it('unwraps data.data', () => {
    const inner = [{ id: 2 }];
    expect(unwrapExerciseList({ data: inner })).toBe(inner);
  });

  it('unwraps data.exercises', () => {
    const inner = [{ id: 3 }];
    expect(unwrapExerciseList({ exercises: inner })).toBe(inner);
  });

  it('returns empty array for an unrecognised shape', () => {
    expect(unwrapExerciseList({ foo: 'bar' })).toEqual([]);
  });

  it('returns empty array for an empty object', () => {
    expect(unwrapExerciseList({})).toEqual([]);
  });
});
