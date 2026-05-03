'use client';
import { createContext, use } from 'react';
import 'client-only';

export interface WorkspaceLayoutState {
  sidebar: {
    left: {
      open: boolean;
    };
  };
}

export interface WorkspaceLayoutActions {
  toggleLeftSidebar: () => void;
}

// Split into two contexts so components that only call actions (e.g. a close
// button deep in the tree) never re-render when shell state changes.
export const WorkspaceLayoutStateContext = createContext<WorkspaceLayoutState | null>(null);
export const WorkspaceLayoutActionsContext = createContext<WorkspaceLayoutActions | null>(null);

/** @internal */
export function useWorkspaceLayoutState(): WorkspaceLayoutState {
  const context = use(WorkspaceLayoutStateContext);
  if (!context)
    throw new Error('useWorkspaceLayoutState must be used within WorkspaceLayoutStateContext');
  return context;
}

/** @internal */
export function useWorkspaceLayoutActions(): WorkspaceLayoutActions {
  const context = use(WorkspaceLayoutActionsContext);
  if (!context)
    throw new Error('useWorkspaceLayoutActions must be used within WorkspaceLayoutActionsContext');
  return context;
}
