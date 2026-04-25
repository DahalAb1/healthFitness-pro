import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/useAuth";

const API = import.meta.env.VITE_API_URL || "";

// Allowlist of fields that are safe to send to the backend for profile updates.
// This prevents unintended or malicious fields from being included in PATCH /me requests.
// Do NOT remove this filter without verifying backend validation.
const allowedProfileFields = new Set([
  "display_name",
  "height_inches",
  "weight_lbs",
  "units",
  "workout_sounds",
  "notifications",
]);

/**
 * Encapsulates all profile state and persistence for AccountPage.
 * Single Responsibility: manages profile data and the PATCH /me API call.
 * Dependency Inversion: AccountPage depends on this hook, not raw fetch.
 */
export function useAccountProfile() {
  const { user, token } = useAuth();

  const [heightInches, setHeightInches] = useState(user?.height_inches ?? null);
  const [weightLbs, setWeightLbs] = useState(user?.weight_lbs ?? null);
  const [profile, setProfile] = useState({
    email: user?.email || "",
    displayName: user?.display_name || user?.email?.split("@")[0] || "",
    units: user?.units || "Imperial",
    workoutSounds: user?.workout_sounds || "On",
    notifications: user?.notifications || "On",
  });

  // Re-sync when user object changes (e.g. after page reload)
  useEffect(() => {
    if (!user) return;
    setHeightInches(user.height_inches ?? null);
    setWeightLbs(user.weight_lbs ?? null);
    setProfile({
      email: user.email || "",
      displayName: user.display_name || user.email?.split("@")[0] || "",
      units: user.units || "Imperial",
      workoutSounds: user.workout_sounds || "On",
      notifications: user.notifications || "On",
    });
  }, [user]);

  const saveProfile = useCallback(
    async (updates) => {
      if (!token) return;
      const safeUpdates = Object.fromEntries(
        Object.entries(updates).filter(([key]) =>
          allowedProfileFields.has(key),
        ),
      );
      if (Object.keys(safeUpdates).length === 0) return;
      try {
        const res = await fetch(`${API}/me`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(safeUpdates),
        });
        if (!res.ok) {
          console.error("Failed to save profile:", await res.text());
        }
      } catch (err) {
        console.error("Profile save error:", err);
      }
    },
    [token],
  );

  /** Returns an onChange handler that updates local state and persists to backend. */
  const set = useCallback(
    (key, backendKey) => (val) => {
      setProfile((p) => ({ ...p, [key]: val }));
      saveProfile({ [backendKey]: val });
    },
    [saveProfile],
  );

  return {
    profile,
    heightInches,
    weightLbs,
    setHeightInches,
    setWeightLbs,
    set,
    saveProfile,
  };
}
