import { useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi, type InitializePaymentRequest } from './index';

export function useInitializePayment() {
  return useMutation({
    mutationFn: (input: InitializePaymentRequest) => paymentsApi.initialize(input),
  });
}

export function useVerifyPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reference: string) => paymentsApi.verify(reference),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}
