import { PropsWithChildren } from 'react';
import { AuthProvider } from '../client/AuthContext';
import { createOIDCClient, fetchUserProfile, resolveOIDCClientConfiguration } from './actions';

export async function ProtectedPage(props: PropsWithChildren) {
  const client = createOIDCClient(resolveOIDCClientConfiguration());
  const userProfile = await fetchUserProfile(client);

  return <AuthProvider value={{ userProfile }}>{props.children}</AuthProvider>;
}
