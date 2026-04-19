import { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  getProfile,
  logout as logoutRequest,
  resetInterceptorState,
} from "../api/apiService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,        setUser]   = useState(null);
  const [authLoading, setLoading] = useState(true);

  const login = useCallback((userData) => setUser(userData), []);

  // Full logout: call the backend endpoint, reset the interceptor's
  // in-flight state, then clear React user state.
  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch {
      // Swallow — the backend will clear cookies regardless.
      // We still need to clean up the frontend state.
    } finally {
      resetInterceptorState(); // prevent isRefreshing from getting stuck
      setUser(null);
    }
  }, []);

  // The interceptor dispatches this when the refresh token is dead.
  // We must also call resetInterceptorState() here, because the interceptor
  // has already set isRefreshing = false in its finally block — but
  // failedQueue may still have stale entries if processQueue(err) threw.
  // Calling reset here is a safety net.
  useEffect(() => {
    const forceLogout = () => {
      resetInterceptorState();
      setUser(null);
    };
    window.addEventListener("auth:logout", forceLogout);
    return () => window.removeEventListener("auth:logout", forceLogout);
  }, []);

  // On mount: fetch the profile to rehydrate user state from cookies.
  //
  // If the access token has just expired, getProfile() returns 401.
  // The interceptor catches that 401, calls /token/refresh/, and retries
  // getProfile() automatically. This component never sees the 401.
  //
  // If the refresh token is also dead, the interceptor dispatches
  // "auth:logout" (handled above) and rejects the promise — the catch
  // below sets user to null cleanly.
  //
  // IMPORTANT: /profile/ must NOT be in AUTH_ROUTES in apiService.js,
  // otherwise the interceptor skips the refresh for this exact call
  // and the user gets logged out every 15 minutes.
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const { data } = await getProfile();
        if (active) setUser(data);
      } catch {
        // 401 with dead refresh token, network error, etc.
        // The interceptor has already handled cleanup — we just clear state.
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        isAuthenticated: Boolean(user),
        isAdmin:         user?.role === "Admin",
        isUser:          user?.role === "User",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};