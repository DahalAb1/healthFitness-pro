import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

const API = import.meta.env.VITE_API_URL || "";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("hfp_token"));
  const [user, setUser] = useState(null);
  // loading starts true only when we already have a saved token to verify
  const [loading, setLoading] = useState(
    () => !!localStorage.getItem("hfp_token"),
  );

  // Verify token and hydrate user — no synchronous setState in the effect body
  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        if (!cancelled) {
          localStorage.removeItem("hfp_token");
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = async (email, password) => {
    // /login uses OAuth2PasswordRequestForm → URL-encoded body, field = "username"
    const body = new URLSearchParams({ username: email, password });
    const res = await fetch(`${API}/login`, { method: "POST", body });
    if (!res.ok) throw new Error((await res.json()).detail || "Login failed");
    const { access_token } = await res.json();
    localStorage.setItem("hfp_token", access_token);
    setToken(access_token);
    setLoading(true); // will resolve once /me fetch completes
  };

  const register = async (email, password) => {
    const res = await fetch(`${API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok)
      throw new Error((await res.json()).detail || "Registration failed");
    await login(email, password);
  };

  // Avatar: stored as a base64 data URL so it persists across page refreshes
  const [avatar, setAvatarState] = useState(
    () => localStorage.getItem("hfp_avatar") || null,
  );

  const setAvatar = (dataUrl) => {
    if (dataUrl) {
      localStorage.setItem("hfp_avatar", dataUrl);
    } else {
      localStorage.removeItem("hfp_avatar");
    }
    setAvatarState(dataUrl);
  };

  const logout = () => {
    localStorage.removeItem("hfp_token");
    localStorage.removeItem("hfp_avatar");
    setToken(null);
    setUser(null);
    setAvatarState(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        login,
        register,
        logout,
        avatar,
        setAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
