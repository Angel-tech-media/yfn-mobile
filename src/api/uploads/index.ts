import { http } from '@/src/lib/http';

import type { DeleteAssetResponse, Id, SignUploadRequest, SignUploadResponse } from '../types';

export const uploadsApi = {
  sign(input: SignUploadRequest) {
    return http.post<SignUploadResponse>('/upload/sign', input);
  },

  delete(id: Id) {
    return http.delete<DeleteAssetResponse>(`/upload/${id}`);
  },
};
