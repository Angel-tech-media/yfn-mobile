import { useQuery } from '@tanstack/react-query';

import { systemApi } from '..';
import { queryKeys } from '../../query-keys';

export const useHealth = () =>
  useQuery({
    queryKey: queryKeys.system.health,
    queryFn: systemApi.health,
  });
