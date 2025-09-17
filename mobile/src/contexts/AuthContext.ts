import { createContext } from 'react';

export interface AuthContextType {
  isLoading: boolean;
  isLoggedIn: boolean;
  logout: () => Promise<void>;
  user: unknown;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
