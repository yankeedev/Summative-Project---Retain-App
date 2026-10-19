import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { signIn as apiSignIn, signUp as apiSignUp } from "../services/mockApi";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean; // true only while restoring a session
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const TOKEN_KEY = "retain.token";
const USER_KEY = "retain.user";

// localStorage only 
function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

// undefined object
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY)
  );
  const [loading, setLoading] = useState(false);

  async function handleSignIn(email: string, password: string): Promise<void> {
    setLoading(true);
    try {
      const result = await apiSignIn(email, password);
      localStorage.setItem(TOKEN_KEY, result.token);
      localStorage.setItem(USER_KEY, JSON.stringify(result.user));
      setToken(result.token);
      setUser(result.user);
    } finally {
      setLoading(false);
    }
  }

  //  sign-up pattern
  async function handleSignUp(
    name: string,
    email: string,
    password: string
  ): Promise<void> {
    setLoading(true);
    try {
      const result = await apiSignUp(name, email, password);
      localStorage.setItem(TOKEN_KEY, result.token);
      localStorage.setItem(USER_KEY, JSON.stringify(result.user));
      setToken(result.token);
      setUser(result.user);
    } finally {
      setLoading(false);
    }
  }

  
  function handleSignOut(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }

 
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        signIn: handleSignIn,
        signUp: handleSignUp,
        signOut: handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}