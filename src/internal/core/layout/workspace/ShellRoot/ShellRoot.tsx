'use client';

import { PropsWithChildren } from 'react';

export function ShellRoot({ children }: PropsWithChildren) {
  return <div className='grid grid-cols-[auto_minmax(0,1fr)]'>{children}</div>;
}
