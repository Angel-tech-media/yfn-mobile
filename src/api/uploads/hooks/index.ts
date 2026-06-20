import { useMutation } from '@tanstack/react-query';

import { uploadsApi } from '..';

export const useSignUpload = () => useMutation({ mutationFn: uploadsApi.sign });

export const useDeleteUpload = () => useMutation({ mutationFn: uploadsApi.delete });
