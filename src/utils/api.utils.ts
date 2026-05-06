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

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

function buildApiUrl(path: string) {
  if (/^https?:\/\//u.test(path)) {
    return path;
  }

  if (!API_BASE_URL) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL is not defined.');
  }

  return new URL(path, API_BASE_URL).toString();
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
