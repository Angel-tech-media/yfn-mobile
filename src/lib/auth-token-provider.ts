type AuthSnapshot = {
  accessToken: string | null;
  refreshToken: string | null;
};

type AuthTokenProvider = {
  getSnapshot: () => AuthSnapshot;
  refresh: () => Promise<string | null>;
};

let provider: AuthTokenProvider | null = null;

export function setAuthTokenProvider(nextProvider: AuthTokenProvider): void {
  provider = nextProvider;
}

export function getAuthSnapshot(): AuthSnapshot {
  return provider?.getSnapshot() ?? { accessToken: null, refreshToken: null };
}

export function refreshAuthToken(): Promise<string | null> {
  return provider?.refresh() ?? Promise.resolve(null);
}
