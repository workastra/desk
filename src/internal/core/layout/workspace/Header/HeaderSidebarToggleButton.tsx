'use client';
import { Button } from '@heroui/react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useWorkspaceLayoutActions, useWorkspaceLayoutState } from '../context';

export function HeaderSidebarToggleButton() {
  const state = useWorkspaceLayoutState();
  const actions = useWorkspaceLayoutActions();

  return (
    <Button size='sm' isIconOnly variant='ghost' onClick={actions.toggleLeftSidebar}>
      {state.sidebar.left.open ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
    </Button>
  );
}
