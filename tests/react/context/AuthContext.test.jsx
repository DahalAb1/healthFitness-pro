import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ---------------------------------------------------------------------------
// Mocks – must be set up before the module is imported
// ---------------------------------------------------------------------------
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

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

import { AuthContext, AuthProvider } from '@/context/AuthContext';
import { useAuth } from '@/context/useAuth';
import { useContext } from 'react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeResponse(body, ok = true, status = 200) {
  return {
    ok,
    status,
    json: vi.fn().mockResolvedValue(body),
  };
}

function ConsumerComponent() {
  const ctx = useContext(AuthContext);
  return (
    <div>
      <span data-testid="token">{ctx.token ?? 'null'}</span>
      <span data-testid="loading">{String(ctx.loading)}</span>
      <span data-testid="user">{ctx.user ? ctx.user.email : 'null'}</span>
      <span data-testid="avatar">{ctx.avatar ?? 'null'}</span>
      <button onClick={() => ctx.login('user@test.com', 'pass')}>login</button>
      <button onClick={() => ctx.register('user@test.com', 'pass')}>register</button>
      <button onClick={() => ctx.logout()}>logout</button>
      <button onClick={() => ctx.setAvatar('data:image/png;base64,abc')}>set-avatar</button>
      <button onClick={() => ctx.setAvatar(null)}>clear-avatar</button>
    </div>
  );
}

function renderProvider() {
  return render(
    <AuthProvider>
      <ConsumerComponent />
    </AuthProvider>,
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    localStorageMock.clear();
    vi.clearAllMocks();
    // Ensure localStorage appears empty by default
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('starts with null token and no loading when no saved token', () => {
    renderProvider();
    expect(screen.getByTestId('token').textContent).toBe('null');
    expect(screen.getByTestId('loading').textContent).toBe('false');
  });

  it('starts loading when a saved token exists in localStorage', async () => {
    localStorageMock.getItem.mockImplementation((key) =>
      key === 'hfp_token' ? 'saved-token' : null,
    );
    // Hang the /me fetch so we can see the loading state
    mockFetch.mockImplementation(() => new Promise(() => {}));
    renderProvider();
    expect(screen.getByTestId('loading').textContent).toBe('true');
  });

  it('hydrates user from /me after a saved token is found', async () => {
    localStorageMock.getItem.mockImplementation((key) =>
      key === 'hfp_token' ? 'valid-token' : null,
    );
    mockFetch.mockResolvedValue(makeResponse({ email: 'user@test.com' }));
    renderProvider();
    await waitFor(() =>
      expect(screen.getByTestId('user').textContent).toBe('user@test.com'),
    );
    expect(screen.getByTestId('loading').textContent).toBe('false');
  });

  it('clears token when /me returns an error response', async () => {
    localStorageMock.getItem.mockImplementation((key) =>
      key === 'hfp_token' ? 'bad-token' : null,
    );
    mockFetch.mockResolvedValue(makeResponse({}, false, 401));
    renderProvider();
    await waitFor(() =>
      expect(screen.getByTestId('token').textContent).toBe('null'),
    );
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('hfp_token');
  });

  // -------------------------------------------------------------------------
  // login
  // -------------------------------------------------------------------------
  describe('login', () => {
    it('stores the access token and sets loading true while verifying', async () => {
      mockFetch
        .mockResolvedValueOnce(makeResponse({ access_token: 'tok-123' })) // /login
        .mockImplementation(() => new Promise(() => {}));                  // /me hangs
      renderProvider();
      await act(async () => {
        screen.getByRole('button', { name: 'login' }).click();
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('hfp_token', 'tok-123');
      expect(screen.getByTestId('loading').textContent).toBe('true');
    });

    it('does not store a token when /login returns a non-ok response', async () => {
      mockFetch.mockResolvedValue(makeResponse({ detail: 'Invalid credentials' }, false, 401));
      let capturedLogin;
      function LoginCapture() {
        const ctx = useContext(AuthContext);
        capturedLogin = ctx.login;
        return null;
      }
      render(
        <AuthProvider>
          <LoginCapture />
        </AuthProvider>,
      );
      await expect(capturedLogin('bad@test.com', 'wrong')).rejects.toThrow();
      expect(localStorageMock.setItem).not.toHaveBeenCalledWith('hfp_token', expect.anything());
    });
  });

  // -------------------------------------------------------------------------
  // register
  // -------------------------------------------------------------------------
  describe('register', () => {
    it('calls /register then /login and sets the token', async () => {
      mockFetch
        .mockResolvedValueOnce(makeResponse({ email: 'user@test.com' }))   // /register
        .mockResolvedValueOnce(makeResponse({ access_token: 'new-tok' }))  // /login
        .mockImplementation(() => new Promise(() => {}));                   // /me hangs
      renderProvider();
      await act(async () => {
        screen.getByRole('button', { name: 'register' }).click();
      });
      expect(localStorageMock.setItem).toHaveBeenCalledWith('hfp_token', 'new-tok');
    });
  });

  // -------------------------------------------------------------------------
  // logout
  // -------------------------------------------------------------------------
  describe('logout', () => {
    it('clears token, user, and avatar', async () => {
      localStorageMock.getItem.mockImplementation((key) =>
        key === 'hfp_token' ? 'tok' : null,
      );
      mockFetch.mockResolvedValue(makeResponse({ email: 'user@test.com' }));
      renderProvider();
      await waitFor(() =>
        expect(screen.getByTestId('user').textContent).toBe('user@test.com'),
      );
      act(() => { screen.getByRole('button', { name: 'logout' }).click(); });
      await waitFor(() => {
        expect(screen.getByTestId('token').textContent).toBe('null');
        expect(screen.getByTestId('loading').textContent).toBe('false');
      });
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('hfp_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('hfp_avatar');
    });
  });

  // -------------------------------------------------------------------------
  // setAvatar
  // -------------------------------------------------------------------------
  describe('setAvatar', () => {
    it('stores a data URL in localStorage and exposes it via context', async () => {
      renderProvider();
      act(() => { screen.getByRole('button', { name: 'set-avatar' }).click(); });
      await waitFor(() =>
        expect(screen.getByTestId('avatar').textContent).toBe('data:image/png;base64,abc'),
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'hfp_avatar',
        'data:image/png;base64,abc',
      );
    });

    it('removes the avatar from localStorage when passed null', async () => {
      renderProvider();
      act(() => { screen.getByRole('button', { name: 'clear-avatar' }).click(); });
      await waitFor(() =>
        expect(screen.getByTestId('avatar').textContent).toBe('null'),
      );
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('hfp_avatar');
    });
  });
});

// ---------------------------------------------------------------------------
// useAuth
// ---------------------------------------------------------------------------
describe('useAuth', () => {
  it('returns the AuthContext value when used inside AuthProvider', () => {
    function HookConsumer() {
      const ctx = useAuth();
      return <span data-testid="has-login">{String(typeof ctx.login === 'function')}</span>;
    }
    render(
      <AuthProvider>
        <HookConsumer />
      </AuthProvider>,
    );
    expect(screen.getByTestId('has-login').textContent).toBe('true');
  });
});
