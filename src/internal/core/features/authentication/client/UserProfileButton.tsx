'use client';

import { useMemo } from 'react';
import { Avatar, Dropdown, Label } from '@heroui/react';
import { LogOutIcon } from 'lucide-react';
import { useAuth } from './AuthContext';

function UserAvatar() {
  const auth = useAuth();

  const fallbackText = useMemo<string>(() => {
    if (!auth.isAuthenticated) {
      return '??';
    }

    const { name } = auth.userProfile;
    const fullname = name?.trim();

    if (fullname === undefined || fullname.length === 0) {
      return '??';
    }

    const words = fullname.split(/\s+/);
    const first = words[0];
    const last = words.at(-1) ?? first;
    const fallback = first === last ? first[0] : first[0] + last[0];

    return fallback.toUpperCase();
  }, [auth.isAuthenticated, auth.userProfile]);

  return (
    <Avatar size='sm'>
      {auth.isAuthenticated ? (
        <Avatar.Image alt={auth.userProfile.name} src={auth.userProfile.picture} />
      ) : null}
      <Avatar.Fallback className='border-none bg-gradient-to-br from-pink-500 to-purple-500 text-white'>
        {fallbackText}
      </Avatar.Fallback>
    </Avatar>
  );
}

export function UserProfileButton() {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return null;
  }

  return (
    <Dropdown>
      <Dropdown.Trigger>
        <UserAvatar />
      </Dropdown.Trigger>

      <Dropdown.Popover>
        <div className='px-3 pt-3 pb-1'>
          <div className='flex items-center gap-2'>
            <UserAvatar />
            <div className='flex flex-col gap-0'>
              <p className='text-sm leading-5 font-medium'>{auth.userProfile.name}</p>
              <p className='text-xs leading-none text-muted'>{auth.userProfile.email}</p>
            </div>
          </div>
        </div>
        <Dropdown.Menu>
          <Dropdown.Item id='logout' textValue='Logout' variant='danger'>
            <div className='flex w-full items-center justify-between gap-2'>
              <Label>Log Out</Label>
              <LogOutIcon size={16} className='text-danger' />
            </div>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
