import { PropsWithChildren } from 'react';

export function Content({ children }: PropsWithChildren) {
  return <main className='flex-1'>{children}</main>;
}
