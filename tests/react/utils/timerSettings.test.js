import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock localStorage before importing the module so that the module's
// constants (KEY, FALLBACK) are set, but storage calls can be observed.
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = String(value); }),
    removeItem: vi.fn((key) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

vi.stubGlobal('localStorage', localStorageMock);

import { getDefaultRest, saveDefaultRest } from '@/utils/timerSettings';

describe('timerSettings', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe('getDefaultRest', () => {
    it('returns 60 (FALLBACK) when localStorage has no saved value', () => {
      localStorageMock.getItem.mockReturnValue(null);
      expect(getDefaultRest()).toBe(60);
    });

    it('returns the saved numeric value when one exists', () => {
      localStorageMock.getItem.mockReturnValue('90');
      expect(getDefaultRest()).toBe(90);
    });

    it('coerces the stored string to a number', () => {
      localStorageMock.getItem.mockReturnValue('120');
      const result = getDefaultRest();
      expect(typeof result).toBe('number');
      expect(result).toBe(120);
    });
  });

  describe('saveDefaultRest', () => {
    it('stores the value as a string under the correct key', () => {
      saveDefaultRest(75);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('defaultRestPeriod', '75');
    });

    it('round-trips: saved value is returned by getDefaultRest', () => {
      // Simulate what would happen in a real browser
      let stored = null;
      localStorageMock.setItem.mockImplementation((key, val) => { stored = val; });
      localStorageMock.getItem.mockImplementation(() => stored);

      saveDefaultRest(45);
      expect(getDefaultRest()).toBe(45);
    });
  });
});
