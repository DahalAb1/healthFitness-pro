/**
 * Unit tests for script.js
 * Tests the exercise loading functionality
 */

// Mock fetch globally
global.fetch = jest.fn();

// Import the functions to test
// Note: In a real setup, you'd need to configure module exports in script.js

describe('Exercise Loading Functions', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    // Clear the global exercises array (mutate it, don't reassign)
    global.exercises.length = 0;
  });

  describe('loadExercises()', () => {
    test('should fetch all exercises when no body part is specified', async () => {
      // Mock response data
      const mockData = [
        {
          id: '1',
          name: 'Bench Press',
          target: 'Chest',
          equipment: 'Barbell',
          instructions: 'Lie on bench, press bar up',
          gifUrl: 'http://example.com/bench-press.gif'
        }
      ];

      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockData)
      });

      const result = await loadExercises();

      expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/exercises');
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Bench Press');
    });

    test('should fetch exercises filtered by body part', async () => {
      const mockData = [
        {
          id: '2',
          name: 'Dumbbell Curl',
          target: 'Biceps',
          equipment: 'Dumbbell',
          instructions: 'Curl dumbbell up',
          gifUrl: 'http://example.com/curl.gif'
        }
      ];

      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockData)
      });

      const result = await loadExercises('BICEPS');

      expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/exercises?bodyPart=BICEPS');
      expect(result).toHaveLength(1);
      expect(result[0].muscle_group).toBe('Biceps');
    });

    test('should transform API response to application format', async () => {
      const mockData = [
        {
          id: '3',
          name: 'Push Up',
          target: 'Chest',
          equipment: 'Bodyweight',
          instructions: 'Get on ground, push up',
          gifUrl: 'http://example.com/pushup.gif'
        }
      ];

      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockData)
      });

      const result = await loadExercises();

      expect(result[0]).toEqual({
        id: '3',
        name: 'Push Up',
        muscle_group: 'Chest',
        equipment: 'Bodyweight',
        description: 'Get on ground, push up',
        image_url: 'http://example.com/pushup.gif'
      });
    });

    test('should store exercises in global exercises array', async () => {
      const mockData = [
        {
          id: '4',
          name: 'Squat',
          target: 'Legs',
          equipment: 'Barbell',
          instructions: 'Squat down and up',
          gifUrl: 'http://example.com/squat.gif'
        }
      ];

      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockData)
      });

      await loadExercises();

      expect(global.exercises).toHaveLength(1);
      expect(global.exercises[0].name).toBe('Squat');
    });

    test('should handle fetch errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await loadExercises();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load exercises:',
        expect.any(Error)
      );
      expect(result).toBeUndefined();

      consoleErrorSpy.mockRestore();
    });

    test('should handle empty response from API', async () => {
      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce([])
      });

      const result = await loadExercises();

      expect(result).toEqual([]);
      expect(global.exercises).toHaveLength(0);
    });

    test('should handle multiple exercises in response', async () => {
      const mockData = [
        {
          id: '5',
          name: 'Exercise 1',
          target: 'Chest',
          equipment: 'Barbell',
          instructions: 'Instructions 1',
          gifUrl: 'http://example.com/ex1.gif'
        },
        {
          id: '6',
          name: 'Exercise 2',
          target: 'Back',
          equipment: 'Dumbbell',
          instructions: 'Instructions 2',
          gifUrl: 'http://example.com/ex2.gif'
        }
      ];

      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockData)
      });

      const result = await loadExercises();

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Exercise 1');
      expect(result[1].name).toBe('Exercise 2');
    });

    test('should support various body part filters', async () => {
      const bodyParts = ['CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'ABS'];

      for (const bodyPart of bodyParts) {
        fetch.mockResolvedValueOnce({
          json: jest.fn().mockResolvedValueOnce([])
        });

        await loadExercises(bodyPart);

        expect(fetch).toHaveBeenCalledWith(
          `http://127.0.0.1:8000/exercises?bodyPart=${bodyPart}`
        );
      }
    });
  });

  describe('loadExerciseById()', () => {
    test('should fetch a single exercise by ID', async () => {
      const mockExercise = {
        id: '10',
        name: 'Bench Press',
        target: 'Chest',
        equipment: 'Barbell',
        instructions: 'Press the bar up',
        gifUrl: 'http://example.com/bench.gif'
      };

      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockExercise)
      });

      const result = await loadExerciseById('10');

      expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/exercises/10');
      expect(result).toEqual({
        id: '10',
        name: 'Bench Press',
        muscle_group: 'Chest',
        equipment: 'Barbell',
        description: 'Press the bar up',
        image_url: 'http://example.com/bench.gif'
      });
    });

    test('should handle fetch errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await loadExerciseById('999');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load exercise:',
        expect.any(Error)
      );
      expect(result).toBeUndefined();
      consoleErrorSpy.mockRestore();
    });
  });
});

describe('Template Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loadTemplates()', () => {
    test('should fetch all templates', async () => {
      const mockTemplates = [
        { id: 1, name: 'Push Day', description: 'Chest and triceps', exercises: [] },
        { id: 2, name: 'Pull Day', description: 'Back and biceps', exercises: [] }
      ];

      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockTemplates)
      });

      const result = await loadTemplates();

      expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/templates');
      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('Push Day');
    });

    test('should return templates with exercise data', async () => {
      const mockTemplates = [
        {
          id: 1,
          name: 'Push Day',
          description: 'Chest and triceps',
          exercises: [
            { exercise_id: 'Bench Press', target_sets: 4, target_reps: 10 }
          ]
        }
      ];

      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockTemplates)
      });

      const result = await loadTemplates();

      expect(result[0].exercises).toHaveLength(1);
      expect(result[0].exercises[0].exercise_id).toBe('Bench Press');
      expect(result[0].exercises[0].target_sets).toBe(4);
      expect(result[0].exercises[0].target_reps).toBe(10);
    });

    test('should handle fetch errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await loadTemplates();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load templates:',
        expect.any(Error)
      );
      expect(result).toBeUndefined();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('loadTemplateById()', () => {
    test('should fetch a single template by ID', async () => {
      const mockTemplate = {
        id: 1,
        name: 'Push Day',
        description: 'Chest and triceps',
        exercises: [
          { exercise_id: 'Bench Press', target_sets: 4, target_reps: 10 }
        ]
      };

      fetch.mockResolvedValueOnce({
        json: jest.fn().mockResolvedValueOnce(mockTemplate)
      });

      const result = await loadTemplateById(1);

      expect(fetch).toHaveBeenCalledWith('http://127.0.0.1:8000/templates/1');
      expect(result.name).toBe('Push Day');
      expect(result.exercises).toHaveLength(1);
    });

    test('should handle fetch errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await loadTemplateById(999);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to load template:',
        expect.any(Error)
      );
      expect(result).toBeUndefined();
      consoleErrorSpy.mockRestore();
    });
  });
});
