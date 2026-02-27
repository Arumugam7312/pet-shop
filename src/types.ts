import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Pet {
  id: number;
  name: string;
  breed: string;
  type: string;
  gender: string;
  color: string;
  dob: string;
  price: number;
  description: string;
  image_url: string;
  health_status: string;
  vaccination_status: string;
  breeder_name: string;
  breeder_rating: number;
  breeder_reviews: number;
  is_available: number;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  address: string;
  district: string;
  state: string;
  pincode: string;
  payment_method: string;
  date: string;
  status: string;
  amount: number;
}

export interface DashboardStats {
  totalPets: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  distribution: {
    male: number;
    female: number;
    imported: number;
  };
}
