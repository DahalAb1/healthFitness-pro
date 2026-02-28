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
});
