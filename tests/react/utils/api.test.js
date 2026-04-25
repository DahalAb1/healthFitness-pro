import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ---------------------------------------------------------------------------
// Module-level fetch mock – must be set up before importing the module under test
// ---------------------------------------------------------------------------
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

import {
  getExercises,
  getTemplates,
  getTemplateExercises,
  getWorkoutByDate,
  getUserWorkouts,
  postUserWorkout,
  deleteUserWorkout,
  searchFoods,
  logWorkout,
  getWorkouts,
  getProgressWeights,
  getMealLogs,
  getNutritionActiveDates,
  addMealLog,
  deleteMealLog,
  getNutritionTrends,
} from '@/utils/api';

function makeResponse(body, ok = true, status = 200) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  };
}

describe('api utilities', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // getExercises
  // -------------------------------------------------------------------------
  describe('getExercises', () => {
    it('fetches all exercises when bodyPart is not provided', async () => {
      const data = [{ id: '1', name: 'Curl', bodyParts: ['upper arms'] }];
      mockFetch.mockResolvedValue(makeResponse(data));
      const result = await getExercises();
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/exercises'));
      expect(result).toHaveLength(1);
    });

    it('fetches all exercises when bodyPart is "ALL"', async () => {
      mockFetch.mockResolvedValue(makeResponse([]));
      await getExercises('ALL');
      const url = mockFetch.mock.calls[0][0];
      expect(url).not.toContain('bodyPart=');
    });

    it('appends bodyPart query param for known body parts', async () => {
      mockFetch.mockResolvedValue(makeResponse([]));
      await getExercises('CHEST');
      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('bodyPart=chest');
    });

    it('lowercases unknown body parts', async () => {
      mockFetch.mockResolvedValue(makeResponse([]));
      await getExercises('SHOULDERS');
      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('bodyPart=shoulders');
    });
  });

  // -------------------------------------------------------------------------
  // getTemplates
  // -------------------------------------------------------------------------
  describe('getTemplates', () => {
    it('returns parsed JSON from /templates', async () => {
      const templates = [{ id: 1, name: 'Push Day' }];
      mockFetch.mockResolvedValue(makeResponse(templates));
      const result = await getTemplates();
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/templates'));
      expect(result).toEqual(templates);
    });
  });

  // -------------------------------------------------------------------------
  // getTemplateExercises
  // -------------------------------------------------------------------------
  describe('getTemplateExercises', () => {
    it('calls the correct URL with the templateId', async () => {
      mockFetch.mockResolvedValue(makeResponse([]));
      await getTemplateExercises(42);
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/templates/42/exercises'));
    });
  });

  // -------------------------------------------------------------------------
  // getWorkoutByDate
  // -------------------------------------------------------------------------
  describe('getWorkoutByDate', () => {
    it('sends Authorization header and date query param', async () => {
      mockFetch.mockResolvedValue(makeResponse({ duration_minutes: 30 }));
      await getWorkoutByDate('tok123', '2026-01-15');
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('workout_date=2026-01-15');
      expect(opts.headers.Authorization).toBe('Bearer tok123');
    });
  });

  // -------------------------------------------------------------------------
  // getUserWorkouts
  // -------------------------------------------------------------------------
  describe('getUserWorkouts', () => {
    it('sends Authorization header', async () => {
      mockFetch.mockResolvedValue(makeResponse([]));
      await getUserWorkouts('mytoken');
      const [, opts] = mockFetch.mock.calls[0];
      expect(opts.headers.Authorization).toBe('Bearer mytoken');
    });
  });

  // -------------------------------------------------------------------------
  // postUserWorkout
  // -------------------------------------------------------------------------
  describe('postUserWorkout', () => {
    it('sends POST with JSON body and Authorization header', async () => {
      mockFetch.mockResolvedValue(makeResponse({ id: 1 }));
      const payload = { name: 'Push Day' };
      await postUserWorkout(payload, 'tok');
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/user-workouts');
      expect(opts.method).toBe('POST');
      expect(opts.headers['Content-Type']).toBe('application/json');
      expect(opts.headers.Authorization).toBe('Bearer tok');
      expect(JSON.parse(opts.body)).toEqual(payload);
    });
  });

  // -------------------------------------------------------------------------
  // deleteUserWorkout
  // -------------------------------------------------------------------------
  describe('deleteUserWorkout', () => {
    it('sends DELETE with Authorization header', async () => {
      mockFetch.mockResolvedValue(makeResponse({}));
      await deleteUserWorkout(7, 'tok');
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/user-workouts/7');
      expect(opts.method).toBe('DELETE');
      expect(opts.headers.Authorization).toBe('Bearer tok');
    });
  });

  // -------------------------------------------------------------------------
  // searchFoods
  // -------------------------------------------------------------------------
  describe('searchFoods', () => {
    it('encodes the query and includes default pagination params', async () => {
      mockFetch.mockResolvedValue(makeResponse([]));
      await searchFoods('chicken breast');
      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('q=chicken%20breast');
      expect(url).toContain('page=0');
      expect(url).toContain('max_results=20');
    });

    it('accepts custom page and maxResults', async () => {
      mockFetch.mockResolvedValue(makeResponse([]));
      await searchFoods('oats', 2, 10);
      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('page=2');
      expect(url).toContain('max_results=10');
    });
  });

  // -------------------------------------------------------------------------
  // logWorkout
  // -------------------------------------------------------------------------
  describe('logWorkout', () => {
    it('sends POST with correct headers and returns data', async () => {
      const workoutData = { exercises: [] };
      mockFetch.mockResolvedValue(makeResponse({ id: 99 }));
      const result = await logWorkout(workoutData, 'tok');
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/workouts');
      expect(opts.method).toBe('POST');
      expect(result).toEqual({ id: 99 });
    });

    it('throws when response is not ok', async () => {
      mockFetch.mockResolvedValue(makeResponse({}, false, 422));
      await expect(logWorkout({}, 'tok')).rejects.toThrow('logWorkout failed: 422');
    });
  });

  // -------------------------------------------------------------------------
  // getWorkouts
  // -------------------------------------------------------------------------
  describe('getWorkouts', () => {
    it('sends Authorization header and returns data', async () => {
      const data = [{ id: 1 }];
      mockFetch.mockResolvedValue(makeResponse(data));
      const result = await getWorkouts('tok');
      const [, opts] = mockFetch.mock.calls[0];
      expect(opts.headers.Authorization).toBe('Bearer tok');
      expect(result).toEqual(data);
    });
  });

  // -------------------------------------------------------------------------
  // getProgressWeights
  // -------------------------------------------------------------------------
  describe('getProgressWeights', () => {
    it('encodes the exercise name in the URL', async () => {
      mockFetch.mockResolvedValue(makeResponse({ points: [] }));
      await getProgressWeights('tok', 'Bench Press');
      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('exercise_name=Bench%20Press');
    });

    it('throws when response is not ok', async () => {
      mockFetch.mockResolvedValue(makeResponse({}, false, 404));
      await expect(getProgressWeights('tok', 'Unknown')).rejects.toThrow('No data found');
    });
  });

  // -------------------------------------------------------------------------
  // getMealLogs
  // -------------------------------------------------------------------------
  describe('getMealLogs', () => {
    it('sends Authorization header and date param', async () => {
      mockFetch.mockResolvedValue(makeResponse([]));
      await getMealLogs('tok', '2026-04-01');
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('log_date=2026-04-01');
      expect(opts.headers.Authorization).toBe('Bearer tok');
    });

    it('throws when response is not ok', async () => {
      mockFetch.mockResolvedValue(makeResponse({}, false, 500));
      await expect(getMealLogs('tok', '2026-04-01')).rejects.toThrow('getMealLogs failed: 500');
    });
  });

  // -------------------------------------------------------------------------
  // getNutritionActiveDates
  // -------------------------------------------------------------------------
  describe('getNutritionActiveDates', () => {
    it('sends year and month params with Authorization', async () => {
      mockFetch.mockResolvedValue(makeResponse({ days: [1, 5, 10] }));
      const result = await getNutritionActiveDates('tok', 2026, 4);
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('year=2026');
      expect(url).toContain('month=4');
      expect(opts.headers.Authorization).toBe('Bearer tok');
      expect(result).toEqual({ days: [1, 5, 10] });
    });

    it('throws when response is not ok', async () => {
      mockFetch.mockResolvedValue(makeResponse({}, false, 500));
      await expect(getNutritionActiveDates('tok', 2026, 4)).rejects.toThrow(
        'getNutritionActiveDates failed: 500',
      );
    });
  });

  // -------------------------------------------------------------------------
  // addMealLog
  // -------------------------------------------------------------------------
  describe('addMealLog', () => {
    it('sends POST with JSON entry and Authorization', async () => {
      const entry = { food_name: 'Apple', kcal: 95, meal_type: 'breakfast' };
      mockFetch.mockResolvedValue(makeResponse({ id: 1, ...entry }));
      const result = await addMealLog('tok', entry);
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/nutrition/logs');
      expect(opts.method).toBe('POST');
      expect(JSON.parse(opts.body)).toEqual(entry);
      expect(result.id).toBe(1);
    });

    it('throws when response is not ok', async () => {
      mockFetch.mockResolvedValue(makeResponse({}, false, 400));
      await expect(addMealLog('tok', {})).rejects.toThrow('addMealLog failed: 400');
    });
  });

  // -------------------------------------------------------------------------
  // deleteMealLog
  // -------------------------------------------------------------------------
  describe('deleteMealLog', () => {
    it('sends DELETE request with Authorization', async () => {
      mockFetch.mockResolvedValue(makeResponse(null, true, 204));
      await deleteMealLog('tok', 55);
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/nutrition/logs/55');
      expect(opts.method).toBe('DELETE');
      expect(opts.headers.Authorization).toBe('Bearer tok');
    });

    it('throws when response is not ok', async () => {
      mockFetch.mockResolvedValue(makeResponse({}, false, 404));
      await expect(deleteMealLog('tok', 99)).rejects.toThrow('deleteMealLog failed: 404');
    });
  });

  // -------------------------------------------------------------------------
  // getNutritionTrends
  // -------------------------------------------------------------------------
  describe('getNutritionTrends', () => {
    it('sends Authorization header to /nutrition/logs/trends', async () => {
      mockFetch.mockResolvedValue(makeResponse([]));
      await getNutritionTrends('tok', null);
      const [url, opts] = mockFetch.mock.calls[0];
      expect(url).toContain('/nutrition/logs/trends');
      expect(opts.headers.Authorization).toBe('Bearer tok');
    });

    it('appends days param when days is provided', async () => {
      mockFetch.mockResolvedValue(makeResponse([]));
      await getNutritionTrends('tok', 30);
      const url = mockFetch.mock.calls[0][0];
      expect(url).toContain('days=30');
    });

    it('omits days param when days is null', async () => {
      mockFetch.mockResolvedValue(makeResponse([]));
      await getNutritionTrends('tok', null);
      const url = mockFetch.mock.calls[0][0];
      expect(url).not.toContain('days=');
    });
  });
});
