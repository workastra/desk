import { StatusCodes } from 'http-status-codes';

export function GET() {
  return new Response('OK', { status: StatusCodes.OK });
}
