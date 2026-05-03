'use client';

import { useMemo, useState, type PropsWithChildren } from 'react';
import {
  WorkspaceLayoutActionsContext,
  WorkspaceLayoutStateContext,
  type WorkspaceLayoutActions,
  type WorkspaceLayoutState,
} from '@internal/core/layout/workspace/context';
import { ShellRoot } from './ShellRoot/ShellRoot';

export function Layout(props: PropsWithChildren) {
  const { children } = props;

  const [leftSidebarOpen, setLeftSidebarOpen] = useState<boolean>(false);

  // Stable memo: setLeftSidebarOpen never changes, so actions context never triggers re-renders.
  const actions = useMemo<WorkspaceLayoutActions>(
    () => ({ toggleLeftSidebar: () => setLeftSidebarOpen((open) => !open) }),
    [],
  );

  // Reactive memo: only re-creates when sidebar state changes.
  const state = useMemo<WorkspaceLayoutState>(
    () => ({ sidebar: { left: { open: leftSidebarOpen } } }),
    [leftSidebarOpen],
  );

  return (
    <WorkspaceLayoutActionsContext value={actions}>
      <WorkspaceLayoutStateContext value={state}>
        <ShellRoot>{children}</ShellRoot>
      </WorkspaceLayoutStateContext>
    </WorkspaceLayoutActionsContext>
  );
}
