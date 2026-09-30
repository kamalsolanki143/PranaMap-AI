"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = 'admin' | 'city_authority' | 'environment_officer' | 'viewer';

export interface User {
  name: string;
  email: string;
  role?: UserRole;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, role?: UserRole) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: (email: string, role: UserRole = 'environment_officer') =>
        set({
          isAuthenticated: true,
          user: {
            name: email.split("@")[0] ?? "Officer",
            email,
            role,
          },
        }),
      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    {
      name: "pranamap-auth",
      skipHydration: false,
    }
  )
);
