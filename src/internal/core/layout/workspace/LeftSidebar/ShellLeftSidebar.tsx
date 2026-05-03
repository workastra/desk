'use client';

import { PropsWithChildren } from 'react';
import { useWorkspaceLayoutState } from '../context';

export function LeftSidebar({ children }: PropsWithChildren) {
  const { sidebar } = useWorkspaceLayoutState();

  return (
    <nav className={`w-64 border-r border-gray-300 p-3 ${sidebar.left.open ? 'block' : 'hidden'}`}>
      {children}
    </nav>
  );
}
