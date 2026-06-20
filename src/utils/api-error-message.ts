import { HttpError } from '@/src/lib/http';

export function apiErrorMessage(error: unknown): string {
  if (error instanceof HttpError) {
    if (error.status === 401) return 'Your session expired. Please sign in again.';
    if (error.status === 403) return 'You do not have permission to do that.';
    if (error.status === 429) return 'Too many attempts. Please wait a moment and try again.';
    if (error.status >= 500) return 'The server is temporarily unavailable. Please try again.';
    return error.message || 'The request could not be completed.';
  }

  return 'Could not reach the server. Please check your connection and try again.';
}
