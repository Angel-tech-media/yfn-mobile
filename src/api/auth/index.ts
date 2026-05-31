import { http } from '@/src/lib/http';

import type {
  AuthTokens,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  OtpSendRequest,
  OtpSendResponse,
  OtpVerifyRequest,
  OtpVerifyResponse,
  PasswordResetRequest,
  PasswordResetResponse,
  RegisterRequest,
  RegisterResponse,
  SubmitBvnRequest,
  SubmitBvnResponse,
  SubmitIdDocumentRequest,
  SubmitIdDocumentResponse,
  SubmitNinRequest,
  SubmitNinResponse,
  SubmitSelfieResponse,
} from '../types';

export const authApi = {
  register(input: RegisterRequest) {
    return http.post<RegisterResponse>('/auth/register', input, {
      anonymous: true,
      skipRefresh: true,
    });
  },

  login(input: LoginRequest) {
    return http.post<LoginResponse>('/auth/login', input, {
      anonymous: true,
      skipRefresh: true,
    });
  },

  refresh(refreshToken: string) {
    return http.post<AuthTokens>(
      '/auth/refresh',
      { refreshToken },
      { anonymous: true, skipRefresh: true },
    );
  },

  logout() {
    return http.post<LogoutResponse>('/auth/logout');
  },

  sendOtp(input: OtpSendRequest) {
    return http.post<OtpSendResponse>('/auth/otp/send', input, {
      anonymous: true,
      skipRefresh: true,
    });
  },

  verifyOtp(input: OtpVerifyRequest) {
    return http.post<OtpVerifyResponse>('/auth/otp/verify', input, {
      anonymous: true,
      skipRefresh: true,
    });
  },

  resetPassword(input: PasswordResetRequest) {
    return http.post<PasswordResetResponse>('/auth/password/reset', input, {
      anonymous: true,
      skipRefresh: true,
    });
  },

  submitNin(input: SubmitNinRequest) {
    return http.post<SubmitNinResponse>('/auth/kyc/nin', input);
  },

  submitBvn(input: SubmitBvnRequest) {
    return http.post<SubmitBvnResponse>('/auth/kyc/bvn', input);
  },

  submitIdDocument(input: SubmitIdDocumentRequest) {
    return http.post<SubmitIdDocumentResponse>('/auth/kyc/id-document', input);
  },

  submitSelfie(input: FormData) {
    return http.post<SubmitSelfieResponse>('/auth/kyc/selfie', input);
  },
};
