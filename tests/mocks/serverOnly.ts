/**
 * Mock implementation of "server-only" package for testing
 *
 * The real "server-only" package throws an error when imported in client-side code.
 * In tests, we want to bypass this check to allow testing server-side code.
 */

export const __isServerOnlyMock = true;
