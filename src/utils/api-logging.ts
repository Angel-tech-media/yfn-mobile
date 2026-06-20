type LogMetadata = Record<string, unknown>;

export function logApiFailure(scope: string, error: unknown, metadata: LogMetadata = {}) {
  console.error(`[api] ${scope} failed`, {
    ...metadata,
    error: errorDetails(error),
  });
}

function errorDetails(error: unknown) {
  if (isRecord(error)) {
    const details: Record<string, unknown> = {};
    for (const key of ['name', 'message', 'status', 'body', 'phase', 'storage']) {
      if (key in error) details[key] = error[key];
    }
    if (error instanceof Error && error.stack) details.stack = error.stack;
    if (Object.keys(details).length) return details;
  }

  return error;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object';
}
