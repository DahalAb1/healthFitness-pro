import { describe, it, expect } from 'vitest';
import { normalizeExercise, BODY_PART_MAP } from '@/utils/exerciseUtils';

describe('BODY_PART_MAP', () => {
  it('maps CHEST to chest', () => {
    expect(BODY_PART_MAP.CHEST).toBe('chest');
  });

  it('maps ABS to waist', () => {
    expect(BODY_PART_MAP.ABS).toBe('waist');
  });

  it('maps LEGS to upper legs', () => {
    expect(BODY_PART_MAP.LEGS).toBe('upper legs');
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
  it('uses id field', () => {
    const result = normalizeExercise({ id: 'xyz', name: 'Bench Press' });
    expect(result.id).toBe('xyz');
  });

  it('uses target for muscle_group', () => {
    const result = normalizeExercise({ id: '1', name: 'Curl', target: 'biceps' });
    expect(result.muscle_group).toBe('biceps');
  });


  it('falls back to target for muscle_group', () => {
    const result = normalizeExercise({ id: '1', name: 'Curl', target: 'biceps' });
    expect(result.muscle_group).toBe('biceps');
  });

  it('returns empty string when no muscle group info present', () => {
    const result = normalizeExercise({ id: '1', name: 'Plank' });
    expect(result.muscle_group).toBe('');
  });

  it('uses equipment field', () => {
    const result = normalizeExercise({ id: '1', name: 'Barbell Curl', equipment: 'barbell' });
    expect(result.equipment).toBe('barbell');
  });

  it('returns empty string when no equipment info present', () => {
    const result = normalizeExercise({ id: '1', name: 'Push-up' });
    expect(result.equipment).toBe('');
  });

  it('joins instructions array for description', () => {
    const result = normalizeExercise({ id: '1', name: 'Squat', instructions: ['Stand up', 'Sit down'] });
    expect(result.description).toBe('Stand up Sit down');
  });

  it('uses gifUrl for image_url', () => {
    const result = normalizeExercise({ id: '1', name: 'Squat', gifUrl: 'http://img.test/squat.gif' });
    expect(result.image_url).toBe('http://img.test/squat.gif');
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

