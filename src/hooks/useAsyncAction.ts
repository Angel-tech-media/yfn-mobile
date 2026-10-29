import { useCallback, useEffect, useRef, useState } from 'react';

import { useToast } from '@/src/hooks/use-toast';
import { apiErrorMessage } from '@/src/utils/api-error-message';

type Options<R> = {
  /** Toast title shown when the action throws. Omit to fail silently (caller handles errors). */
  errorTitle?: string;
  /** Toast title shown when the action resolves. */
  successTitle?: string;
  onSuccess?: (result: R) => void;
  onError?: (error: unknown) => void;
};

/**
 * Encapsulates the "tap -> await something -> show feedback" flow every action button needs:
 *  - re-entry guard (a second tap while in flight is ignored, even before React re-renders)
 *  - `pending` state for spinners / disabled buttons
 *  - consistent error toast
 *  - no setState after unmount
 *
 * Returns `undefined` from `run` when the action was skipped (already running) or failed.
 */
export function useAsyncAction<Args extends unknown[], R>(
  action: (...args: Args) => Promise<R>,
  options: Options<R> = {},
) {
  const toast = useToast();
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);
  const mounted = useRef(true);
  const actionRef = useRef(action);
  const optionsRef = useRef(options);

  actionRef.current = action;
  optionsRef.current = options;

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const run = useCallback(
    async (...args: Args): Promise<R | undefined> => {
      if (inFlight.current) return undefined;
      inFlight.current = true;
      setPending(true);

      try {
        const result = await actionRef.current(...args);
        const { successTitle, onSuccess } = optionsRef.current;
        if (successTitle) toast.success(successTitle);
        onSuccess?.(result);
        return result;
      } catch (error) {
        const { errorTitle, onError } = optionsRef.current;
        if (errorTitle) toast.error(errorTitle, { description: apiErrorMessage(error) });
        onError?.(error);
        return undefined;
      } finally {
        inFlight.current = false;
        if (mounted.current) setPending(false);
      }
    },
    [toast],
  );

  return { run, pending };
}
