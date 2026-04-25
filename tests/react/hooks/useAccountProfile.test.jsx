import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let mockUser = {
  email: 'user@test.com',
  display_name: 'Test User',
  units: 'Imperial',
  workout_sounds: 'On',
  notifications: 'On',
  height_inches: 70,
  weight_lbs: 180,
};
let mockToken = 'test-token';

vi.mock('@/context/useAuth', () => ({
  useAuth: () => ({ user: mockUser, token: mockToken }),
}));

import { useAccountProfile } from '@/hooks/useAccountProfile';

function buildFetchMock() {
  return vi.fn().mockResolvedValue({
    ok: true,
    text: vi.fn().mockResolvedValue(''),
  });
}

describe('useAccountProfile', () => {
  let mockFetch;

  beforeEach(() => {
    mockFetch = buildFetchMock();
    vi.stubGlobal('fetch', mockFetch);
    mockToken = 'test-token';
    mockUser = {
      email: 'user@test.com',
      display_name: 'Test User',
      units: 'Imperial',
      workout_sounds: 'On',
      notifications: 'On',
      height_inches: 70,
      weight_lbs: 180,
    };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('initialises profile from the user object', () => {
    const { result } = renderHook(() => useAccountProfile());
    expect(result.current.profile.email).toBe('user@test.com');
    expect(result.current.profile.displayName).toBe('Test User');
    expect(result.current.profile.units).toBe('Imperial');
    expect(result.current.profile.workoutSounds).toBe('On');
    expect(result.current.profile.notifications).toBe('On');
    expect(result.current.heightInches).toBe(70);
    expect(result.current.weightLbs).toBe(180);
  });

  it('derives displayName from email prefix when display_name is absent', () => {
    mockUser = { ...mockUser, display_name: null };
    const { result } = renderHook(() => useAccountProfile());
    expect(result.current.profile.displayName).toBe('user');
  });

  it('falls back to default values when optional user fields are absent', () => {
    mockUser = { email: 'a@b.com' };
    const { result } = renderHook(() => useAccountProfile());
    expect(result.current.profile.units).toBe('Imperial');
    expect(result.current.profile.workoutSounds).toBe('On');
    expect(result.current.profile.notifications).toBe('On');
    expect(result.current.heightInches).toBeNull();
    expect(result.current.weightLbs).toBeNull();
  });

  it('setHeightInches updates heightInches', () => {
    const { result } = renderHook(() => useAccountProfile());
    act(() => { result.current.setHeightInches(72); });
    expect(result.current.heightInches).toBe(72);
  });

  it('setWeightLbs updates weightLbs', () => {
    const { result } = renderHook(() => useAccountProfile());
    act(() => { result.current.setWeightLbs(175); });
    expect(result.current.weightLbs).toBe(175);
  });

  it('saveProfile sends a PATCH request with correct headers and body', async () => {
    const { result } = renderHook(() => useAccountProfile());
    await act(async () => {
      await result.current.saveProfile({ units: 'Metric' });
    });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/me'),
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token',
        }),
        body: JSON.stringify({ units: 'Metric' }),
      }),
    );
  });

  it('saveProfile is a no-op when token is null', async () => {
    mockToken = null;
    const { result } = renderHook(() => useAccountProfile());
    await act(async () => {
      await result.current.saveProfile({ units: 'Metric' });
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('set returns a setter that updates the profile state', async () => {
    const { result } = renderHook(() => useAccountProfile());
    await act(async () => {
      result.current.set('units', 'units')('Metric');
    });
    expect(result.current.profile.units).toBe('Metric');
  });

  it('set also persists the change via a PATCH request', async () => {
    const { result } = renderHook(() => useAccountProfile());
    await act(async () => {
      result.current.set('units', 'units')('Metric');
    });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/me'),
      expect.objectContaining({
        method: 'PATCH',
        body: JSON.stringify({ units: 'Metric' }),
      }),
    );
  });

  it('set correctly updates a nested profile field like notifications', async () => {
    const { result } = renderHook(() => useAccountProfile());
    await act(async () => {
      result.current.set('notifications', 'notifications')('Off');
    });
    expect(result.current.profile.notifications).toBe('Off');
  });

  it('re-syncs profile state when the user object changes', async () => {
    const { result, rerender } = renderHook(() => useAccountProfile());
    expect(result.current.profile.email).toBe('user@test.com');

    mockUser = {
      email: 'updated@test.com',
      display_name: 'Updated User',
      units: 'Metric',
      workout_sounds: 'Off',
      notifications: 'Off',
      height_inches: 65,
      weight_lbs: 150,
    };
    rerender();

    await waitFor(() => {
      expect(result.current.profile.email).toBe('updated@test.com');
      expect(result.current.profile.displayName).toBe('Updated User');
      expect(result.current.profile.units).toBe('Metric');
      expect(result.current.heightInches).toBe(65);
      expect(result.current.weightLbs).toBe(150);
    });
  });

  // -----------------------------------------------------------------------
  // Branch coverage additions
  // -----------------------------------------------------------------------

  it('profile.email defaults to "" and profile.displayName to "" when user has no email', () => {
    mockUser = { display_name: null, units: 'Imperial', workout_sounds: 'On', notifications: 'On' };
    const { result } = renderHook(() => useAccountProfile());
    expect(result.current.profile.email).toBe('');
    expect(result.current.profile.displayName).toBe('');
  });

  it('useEffect re-sync: email and displayName fall back to "" when user has no email or display_name', async () => {
    const { result, rerender } = renderHook(() => useAccountProfile());
    expect(result.current.profile.email).toBe('user@test.com');

    mockUser = { units: 'Metric', workout_sounds: 'Off', notifications: 'Off' }; // no email, no display_name
    rerender();

    await waitFor(() => {
      expect(result.current.profile.email).toBe('');
      expect(result.current.profile.displayName).toBe('');
    });
  });

  it('useEffect returns early when user becomes null', async () => {
    const { result, rerender } = renderHook(() => useAccountProfile());
    const originalEmail = result.current.profile.email;

    mockUser = null;
    rerender();
    await act(async () => {});
    // State is unchanged because useEffect returned early
    expect(result.current.profile.email).toBe(originalEmail);
  });

  it('saveProfile handles a non-ok response without throwing', async () => {
    mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      text: vi.fn().mockResolvedValue('Bad Request'),
    });
    vi.stubGlobal('fetch', mockFetch);
    const { result } = renderHook(() => useAccountProfile());
    await act(async () => {
      await result.current.saveProfile({ units: 'Metric' });
    });
    expect(mockFetch).toHaveBeenCalled();
    // No throw means the !res.ok branch was handled correctly
  });

  it('saveProfile handles a fetch error without throwing (catch branch)', async () => {
    mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.stubGlobal('fetch', mockFetch);
    const { result } = renderHook(() => useAccountProfile());
    await act(async () => {
      await result.current.saveProfile({ units: 'Metric' });
    });
    // catch block ran without crashing
    expect(mockFetch).toHaveBeenCalled();
  });
});
