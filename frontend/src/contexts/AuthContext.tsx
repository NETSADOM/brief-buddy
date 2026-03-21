import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getDemoToken, setToken, clearToken } from "@/lib/api";

const USER_ID_KEY = "voicebrief_userId";

type AuthContextValue = {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem("voicebrief_token"));
  const [userId, setUserIdState] = useState<string | null>(() => localStorage.getItem(USER_ID_KEY));

  const login = useCallback(async () => {
    const { token: t, userId: u } = await getDemoToken();
    setToken(t);
    localStorage.setItem(USER_ID_KEY, u);
    setTokenState(t);
    setUserIdState(u);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUserIdState(null);
  }, []);

  useEffect(() => {
    const onAuthExpired = () => {
      setTokenState(null);
      setUserIdState(null);
    };
    window.addEventListener("voicebrief:auth-expired", onAuthExpired);
    return () => window.removeEventListener("voicebrief:auth-expired", onAuthExpired);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        userId,
        isAuthenticated: Boolean(token),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
