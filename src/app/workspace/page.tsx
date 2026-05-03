import { Metadata } from 'next';

export function generateMetadata(): Metadata {
  return {
    title: 'Workspace',
  };
}

export default function WorkspacePage() {
  return <h1>Workspace</h1>;
}
