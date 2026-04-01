import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getProfile, logout as logoutRequest } from "../api/apiService";

const AuthContext = createContext(null);
const AUTH_PAGES  = new Set(["/sign_in", "/sign_up"]);

export const AuthProvider = ({ children }) => {
  const [user,        setUser]    = useState(null);
  const [authLoading, setLoading] = useState(true);

  const login  = useCallback((userData) => setUser(userData), []);

  const logout = useCallback(async () => {
    try { await logoutRequest(); } catch { /* cookie cleared server-side anyway */ }
    finally { setUser(null); }
  }, []);

  useEffect(() => {
    if (AUTH_PAGES.has(window.location.pathname)) {
      setLoading(false);
      return;
    }

    let active = true;

    (async () => {
      try {
        const { data } = await getProfile();
        if (active) setUser(data);
      } catch {
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => { active = false; };
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      authLoading,
      isAuthenticated: Boolean(user),
      isAdmin:         user?.role === "Admin",   // ✅ value not function — easier to use
      isUser:          user?.role === "User",
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
