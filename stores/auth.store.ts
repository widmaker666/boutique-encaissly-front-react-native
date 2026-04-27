import { create } from "zustand";
import { User } from "@/types";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,

  //− Stocke les tokens après login
  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),

  //− Stocke le profil utilisateur
  setUser: (user) => set({ user }),

  //− Réinitialise tout (déconnexion ou 401)
  logout: () => set({ accessToken: null, refreshToken: null, user: null }),
}));
