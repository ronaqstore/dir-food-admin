import {
  QueryClient,
  QueryCache,
  MutationCache,
  defaultShouldDehydrateQuery,
  isServer
} from '@tanstack/react-query';
import { ApiError } from '@/lib/api/types';
import { handleUnauthorizedLogout } from '@/lib/auth/session-utils';

function onQueryOrMutationError(error: unknown) {
  if (error instanceof ApiError && error.status === 401) {
    browserQueryClient?.clear();
    handleUnauthorizedLogout();
  }
}

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: onQueryOrMutationError
    }),
    mutationCache: new MutationCache({
      onError: onQueryOrMutationError
    }),
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
            return false;
          }
          return failureCount < 2;
        }
      },
      dehydrate: {
        shouldDehydrateQuery: defaultShouldDehydrateQuery
      }
    }
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (isServer) {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}
