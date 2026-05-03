'use client';

import { Button } from '@heroui/react';
import { UserProfileButton } from '@internal/core/features/authentication/client';
import { BellIcon } from 'lucide-react';
import { HeaderSidebarToggleButton } from './HeaderSidebarToggleButton';

export function Header() {
  return (
    <header className='col-span-2 flex justify-between px-3 py-1 border-b border-gray-300 items-center'>
      <HeaderSidebarToggleButton />

      <div className='flex gap-2'>
        <Button size='sm' isIconOnly variant='ghost'>
          <BellIcon size={18} />
        </Button>

        <UserProfileButton />
      </div>
    </header>
  );
}
