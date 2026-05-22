'use client';

import { createContext, use } from 'react';
import { UserInfoResponse } from 'oauth4webapi';

interface AuthState {
  userProfile: UserInfoResponse | null;
}

const AuthContext = createContext<AuthState | null>(null);
AuthContext.displayName = 'AuthContext';

export const { Provider: AuthProvider } = AuthContext;

export function useAuth() {
  const context = use(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  if (context.userProfile === null) {
    return {
      isAuthenticated: false,
      userProfile: null,
    } as const;
  }

  return {
    isAuthenticated: true,
    userProfile: context.userProfile,
  } as const;
}
