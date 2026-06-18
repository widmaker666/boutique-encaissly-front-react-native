import { create } from "zustand";
import { User } from "@/types";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  activeEvenementId: string | null;
  activeEvenementNom: string | null;
  duoMode: "GERANTE" | "CREATRICE";
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setActiveEvenement: (id: string | null, nom: string | null) => void;
  setDuoMode: (mode: "GERANTE" | "CREATRICE") => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  refreshToken: null,
  user: null,
  activeEvenementId: null,
  activeEvenementNom: null,
  duoMode: "GERANTE",

  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
  setUser: (user) => set({ user }),
  setActiveEvenement: (id, nom) => set({ activeEvenementId: id, activeEvenementNom: nom }),
  setDuoMode: (mode) => set({ duoMode: mode }),
  logout: () => set({ accessToken: null, refreshToken: null, user: null, activeEvenementId: null, activeEvenementNom: null, duoMode: "GERANTE" }),
}));
