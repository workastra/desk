'use client';

import { createContext, useCallback } from 'react';

export const AuthContext = createContext({});

export function useAuth() {
  const login = useCallback(() => {}, []);
}
