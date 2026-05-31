import { useMutation } from '@tanstack/react-query';

import { authApi } from '..';

export const useRegister = () => useMutation({ mutationFn: authApi.register });
export const useLogin = () => useMutation({ mutationFn: authApi.login });
export const useLogout = () => useMutation({ mutationFn: authApi.logout });
export const useSendOtp = () => useMutation({ mutationFn: authApi.sendOtp });
export const useVerifyOtp = () => useMutation({ mutationFn: authApi.verifyOtp });
export const useResetPassword = () => useMutation({ mutationFn: authApi.resetPassword });
export const useSubmitNin = () => useMutation({ mutationFn: authApi.submitNin });
export const useSubmitBvn = () => useMutation({ mutationFn: authApi.submitBvn });
export const useSubmitIdDocument = () => useMutation({ mutationFn: authApi.submitIdDocument });
export const useSubmitSelfie = () => useMutation({ mutationFn: authApi.submitSelfie });
