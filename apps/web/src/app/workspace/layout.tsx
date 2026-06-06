import { PropsWithChildren } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarProvider,
  SidebarRail,
} from '@universe/x-shadcn/components/sidebar';

export default function WorkspaceLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader />
        <SidebarContent>
          <SidebarGroup />
          <SidebarGroup />
        </SidebarContent>
        <SidebarFooter />
        <SidebarRail />
      </Sidebar>
      {children}
    </SidebarProvider>
  );
}
