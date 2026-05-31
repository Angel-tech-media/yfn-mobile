import { http } from '@/src/lib/http';

import type { SignUploadRequest, SignUploadResponse } from '../types';

export const uploadsApi = {
  sign(input: SignUploadRequest) {
    return http.post<SignUploadResponse>('/upload/sign', input);
  },
};
