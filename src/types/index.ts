export type Role = "admin" | "sender" | "receiver";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  isBlocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ParcelLog {
  _id?: string;
  status: string;
  note?: string;
  updatedBy?: User | string;
  timestamp: string;
}

export interface Parcel {
  _id: string;
  trackingId: string;
  sender: User | string;
  receiver: User | string;
  origin: string;
  destination: string;
  weight?: number;
  cost?: number;
  status: "created" | "dispatched" | "in_transit" | "delivered" | "cancelled";
  logs: ParcelLog[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ParcelCreateDto {
  receiverId?: string;
  receiverEmail?: string;
  origin: string;
  destination: string;
  weight?: number;
  cost?: number;
  note?: string;
}

// Standard API wrapper for paginated lists (useful elsewhere)
export interface Paginated<T> {
  items: T[];
  total: number;
  page?: number;
  limit?: number;
}
