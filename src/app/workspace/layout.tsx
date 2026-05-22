import { PropsWithChildren } from 'react';
import { ProtectedPage } from '@internal/core/features/authentication/server/ProtectedPage';
import { Content, Header, Layout, LeftSidebar } from '@internal/core/layout/workspace';

export const dynamic = 'force-dynamic';

export default function WorkspaceLayout({ children }: PropsWithChildren) {
  return (
    <ProtectedPage>
      <Layout>
        <Header />
        <LeftSidebar />
        <Content>{children}</Content>
      </Layout>
    </ProtectedPage>
  );
}
