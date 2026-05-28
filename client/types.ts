export interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  _id: string;
  userId: string;
  createdAt: string;
  status: string;
  total: number;
  items: OrderItem[];
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  profileComplete: boolean;
  role: "user" | "admin";
}
