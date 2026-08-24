"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ApiUser,
  authApi,
  clearTokens,
  getAccessToken,
  setTokens,
} from "@/lib/api/auth";

export type AuthEvent = {
  type: "login" | "register" | "logout";
  message: string;
};

type AuthContextValue = {
  user: ApiUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    marketing_opt_in?: boolean;
    password: string;
    password_confirm: string;
  }) => Promise<void>;
  logout: () => void;
  authEvent: AuthEvent | null;
  clearAuthEvent: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [authEvent, setAuthEvent] = useState<AuthEvent | null>(null);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then(setUser)
      .catch(() => clearTokens())
      .finally(() => setLoading(false));
  }, []);

  const clearAuthEvent = useCallback(() => setAuthEvent(null), []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    setTokens(data.access, data.refresh);
    setUser(data.user);
    const name = data.user.first_name?.trim();
    setAuthEvent({
      type: "login",
      message: name ? `Welcome back, ${name}.` : "Welcome back.",
    });
  }, []);

  const register = useCallback(
    async (payload: Parameters<AuthContextValue["register"]>[0]) => {
      // Create account only — do not auto-login. User signs in next.
      await authApi.register(payload);
      clearTokens();
      setUser(null);
      setAuthEvent({
        type: "register",
        message: "Account created. Please sign in to continue.",
      });
    },
    []
  );

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    setAuthEvent({
      type: "logout",
      message: "You have been signed out",
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      authEvent,
      clearAuthEvent,
    }),
    [user, loading, login, register, logout, authEvent, clearAuthEvent]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
