import { http } from '@/src/lib/http';

import type {
  Address,
  CreateAddressRequest,
  CreatePaymentMethodRequest,
  DataExportResponse,
  DeleteMeResponse,
  DeleteResponse,
  Id,
  MeResponse,
  PaymentMethod,
  UpdateAddressRequest,
  UpdateMeRequest,
} from '../types';

export const accountApi = {
  me() {
    return http.get<MeResponse>('/me');
  },

  updateMe(input: UpdateMeRequest) {
    return http.patch<MeResponse>('/me', input);
  },

  addresses() {
    return http.get<Address[]>('/me/addresses');
  },

  createAddress(input: CreateAddressRequest) {
    return http.post<Address>('/me/addresses', input);
  },

  updateAddress(id: Id, input: UpdateAddressRequest) {
    return http.patch<Address>(`/me/addresses/${id}`, input);
  },

  deleteAddress(id: Id) {
    return http.delete<DeleteResponse>(`/me/addresses/${id}`);
  },

  paymentMethods() {
    return http.get<PaymentMethod[]>('/me/payment-methods');
  },

  createPaymentMethod(input: CreatePaymentMethodRequest) {
    return http.post<PaymentMethod>('/me/payment-methods', input);
  },

  deletePaymentMethod(id: Id) {
    return http.delete<DeleteResponse>(`/me/payment-methods/${id}`);
  },

  dataExport() {
    return http.get<DataExportResponse>('/me/data-export');
  },

  deleteMe() {
    return http.delete<DeleteMeResponse>('/me');
  },
};
