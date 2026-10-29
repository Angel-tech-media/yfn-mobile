import { http } from '@/src/lib/http';

export interface InitializePaymentRequest {
  purpose: 'wallet_topup' | 'order_checkout';
  amountKobo?: number;
  orderId?: string;
  callbackUrl?: string;
}

export interface InitializePaymentResponse {
  success: boolean;
  authorizationUrl: string;
  reference: string;
  accessCode: string;
  amountKobo: number;
}

export interface VerifyPaymentResponse {
  success: boolean;
  reference: string;
  purpose: string;
  status: string;
  amountKobo: number;
  alreadyProcessed: boolean;
}

export const paymentsApi = {
  initialize(input: InitializePaymentRequest) {
    return http.post<InitializePaymentResponse>('/payments/initialize', input);
  },

  verify(reference: string) {
    return http.get<VerifyPaymentResponse>(`/payments/verify/${reference}`);
  },
};
