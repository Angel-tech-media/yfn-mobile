import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  type QueryKey,
  type UseInfiniteQueryOptions,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';

type ApiError = Error;

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://192.168.3.9:4000/api/v1';

function buildApiUrl(path: string) {
  if (/^https?:\/\//u.test(path)) {
    return path;
  }

  const base = API_BASE_URL || 'http://192.168.3.9:4000/api/v1';
  return new URL(path, base).toString();
}

export async function fetchFromApi<TData>(path: string, init: RequestInit = {}) {
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return (await response.json()) as TData;
}

export function useApiQuery<
  TQueryFnData = unknown,
  TError = ApiError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>) {
  return useQuery(options);
}

export function useApiMutation<
  TData = unknown,
  TError = ApiError,
  TVariables = void,
  TOnMutateResult = unknown,
>(options: UseMutationOptions<TData, TError, TVariables, TOnMutateResult>) {
  return useMutation(options);
}

export function useApiInfiniteQuery<
  TQueryFnData = unknown,
  TError = ApiError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
  TPageParam = unknown,
>(options: UseInfiniteQueryOptions<TQueryFnData, TError, TData, TQueryKey, TPageParam>) {
  return useInfiniteQuery(options);
}
