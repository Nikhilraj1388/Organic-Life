import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Return auth token from localStorage or sessionStorage
export function getAuthToken(): string | null {
  return localStorage.getItem("auth-token") || sessionStorage.getItem("auth-token");
}
