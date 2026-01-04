import { createAuthorizationRequest } from '@internal/features/authentication/server';
import { StatusCodes } from 'http-status-codes';

export async function GET() {
  const authorizationRequest = await createAuthorizationRequest();

  return Response.redirect(authorizationRequest.authorizationURL, StatusCodes.MOVED_TEMPORARILY);
}
