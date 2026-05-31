import { http } from '@/src/lib/http';

import type {
  CreateProductRequest,
  DeleteResponse,
  Id,
  ProductDetail,
  UpdateProductRequest,
} from '../types';

export const productsApi = {
  byId(id: Id) {
    return http.get<ProductDetail>(`/products/${id}`);
  },

  create(input: CreateProductRequest) {
    return http.post<ProductDetail>('/products', input);
  },

  update(id: Id, input: UpdateProductRequest) {
    return http.patch<ProductDetail>(`/products/${id}`, input);
  },

  delete(id: Id) {
    return http.delete<DeleteResponse>(`/products/${id}`);
  },
};
