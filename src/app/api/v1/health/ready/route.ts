import { getClientEnvironments } from '@internal/base/config/client';
import { getServerEnvironments } from '@internal/base/config/server';
import { SuccessResponse } from '@internal/base/response/canonical/v1/SuccessResponse';
import { StatusCodes } from 'http-status-codes';

export async function GET() {
  const checkpoints = {
    publicEnvironments: Promise.resolve(getClientEnvironments()),
    privateEnvironments: Promise.resolve(getServerEnvironments()),
  };

  const results = await Promise.allSettled(Object.values(checkpoints));

  const isHealthy = results.every((r) => r.status === 'fulfilled');
  const statusCode = isHealthy ? StatusCodes.OK : StatusCodes.INTERNAL_SERVER_ERROR;

  const details: Record<string, { status: boolean; reason?: unknown }> = Object.fromEntries(
    Object.keys(checkpoints).map((key, index) => {
      const result = results[index];

      if (result.status === 'fulfilled') {
        return [key, { status: true }];
      }

      return [
        key,
        {
          status: false,
          reason:
            result.reason instanceof Error ? result.reason.message : (result.reason as unknown),
        },
      ];
    }),
  ) as Record<string, { status: boolean; reason?: unknown }>;

  return Response.json(
    new SuccessResponse(isHealthy ? 'S0200' : 'E0500', {
      status: isHealthy ? 'healthy' : 'unhealthy',
      details,
    }),
    { status: statusCode },
  );
}
