import { UnauthenticationError } from '@internal/base/exception/UnauthenticationError';
import {
  createOIDCClient,
  fetchUserProfile,
  resolveOIDCClientConfiguration,
} from '@internal/core/features/authentication/server';
import { StatusCodes } from 'http-status-codes';
import { WWWAuthenticateChallengeError } from 'oauth4webapi';

export async function GET() {
  try {
    const client = createOIDCClient(resolveOIDCClientConfiguration());
    const userProfile = await fetchUserProfile(client);
    return Response.json(userProfile, { status: StatusCodes.OK });
  } catch (error) {
    if (error instanceof WWWAuthenticateChallengeError || error instanceof UnauthenticationError) {
      return Response.json({ error: 'Unauthenticated' }, { status: StatusCodes.UNAUTHORIZED });
    }

    return Response.json(
      { error: 'Failed to fetch user profile' },
      { status: StatusCodes.INTERNAL_SERVER_ERROR },
    );
  }
}
