/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export interface CartItemShared {
  id: string;
  name: string;
  price: number;
  image?: string;
  category?: string;
  quantity: number;
  selectedQuantityOption?: { label: string; value: number } | null;
}

export interface CartStateShared {
  items: CartItemShared[];
  isOpen: boolean;
}

export interface SyncCartRequest {
  userId: string;
  cart: CartStateShared;
}
