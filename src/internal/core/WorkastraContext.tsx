'use client';

import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { theme } from '@internal/core/theme';
import { ThemeProvider } from '@emotion/react';
import { AuthContext } from '../features/authentication/client/AuthContext';

type WorkastraProviderProperties = Readonly<{
  children: React.ReactNode;
}>;

export function WorkastraContext({ children }: WorkastraProviderProperties) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={theme}>
        <AuthContext value={{}}>{children}</AuthContext>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
