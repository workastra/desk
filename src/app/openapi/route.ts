import { ApiReference } from '@scalar/nextjs-api-reference';

export const GET = ApiReference({
  agent: {
    disabled: true,
  },
  sources: [
    {
      title: 'v1',
      url: '/openapi/v1.yaml',
    },
  ],
  showDeveloperTools: 'never',
  isLoading: true,
  telemetry: false,
  hideClientButton: true,
  orderRequiredPropertiesFirst: true,
});
