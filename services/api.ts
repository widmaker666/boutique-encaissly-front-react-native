import axios from "axios";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { API_BASE_URL } from "@/constants/api";
import { useAuthStore } from "@/stores/auth.store";
import { makeRedirectUri } from "expo-auth-session";
import { User } from "@/types";

WebBrowser.maybeCompleteAuthSession();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

//- Injecte automatiquement le token JWT dans chaque requête
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//- Gère les 401 globalement (token expiré)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

export const useGoogleAuth = () => {
  const redirectUri = makeRedirectUri({
    scheme: "encaissly",
  });

  console.log(redirectUri);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    redirectUri,
  });

  return { request, response, promptAsync };
};

//- Service de récupération ID pour google et autre
export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post<{
      accessToken: string;
      refreshToken: string;
    }>("/auth/login", { email, password });
    return data;
  },

  register: async (
    email: string,
    password: string,
    nom?: string,
    prenom?: string,
  ) => {
    const { data } = await api.post("/auth/register", {
      email,
      password,
      nom,
      prenom,
    });
    return data;
  },

  getProfile: async () => {
    const { data } = await api.get<User>("/user/profile");
    return data;
  },

  //- Envoie le token Google au backend pour récupérer les JWT Encaissly
  googleMobile: async (googleAccessToken: string) => {
    const { data } = await api.post<{
      accessToken: string;
      refreshToken: string;
    }>("/auth/google/mobile", { accessToken: googleAccessToken });
    return data;
  },
};

//- Récupération des stats
export const statsService = {
  getGlobal: async () => {
    const { data } = await api.get("/stats");
    return data;
  },
  getHistorique: async () => {
    const { data } = await api.get("/stats/historique");
    return data;
  },
};

//- Récupération des dernière ventes
export const venteService = {
  getRecent: async () => {
    const { data } = await api.get("/vente/recent");
    return data;
  },
};

//- Les boutiques
export const boutiqueService = {
  getStats: async () => {
    const { data } = await api.get("/boutique/stats");
    return data;
  },
  getAvecStats: async () => {
    const { data } = await api.get("/boutique/avec-stats");
    return data;
  },
  getNbBoutiques: async () => {
    const { data } = await api.get("/boutique/mes-boutiques/count");
    return data;
  },
};

//- Les évênements
export const evenementService = {
  getAll: async (creatriceId?: string) => {
    const { data } = await api.get("/evenement", {
      params: creatriceId ? { creatriceId } : {},
    });
    return data;
  },
  getOne: async (id: string) => {
    const { data } = await api.get(`/evenement/${id}`);
    return data;
  },
  create: async (dto: {
    nom: string;
    dateDebut: string;
    dateFin?: string;
    creatriceId: string;
  }) => {
    const { data } = await api.post("/evenement", dto);
    return data;
  },
  update: async (
    id: string,
    dto: Partial<{ nom: string; dateDebut: string; dateFin?: string }>,
  ) => {
    const { data } = await api.patch(`/evenement/${id}`, dto);
    return data;
  },
  remove: async (id: string) => {
    const { data } = await api.delete(`/evenement/${id}`);
    return data;
  },
};

//- Articles
export const articleService = {
  getAll: async (creatriceId?: string) => {
    const { data } = await api.get("/article", {
      params: creatriceId ? { creatriceId } : {},
    });
    return data;
  },
  getOne: async (id: string) => {
    const { data } = await api.get(`/article/${id}`);
    return data;
  },
  create: async (dto: {
    nom: string;
    description?: string;
    prixIndicatif?: number;
    quantite?: number;
    creatriceId: string;
  }) => {
    const { data } = await api.post("/article", dto);
    return data;
  },
  update: async (
    id: string,
    dto: Partial<{ nom: string; description?: string; prixIndicatif?: number; quantite?: number }>,
  ) => {
    const { data } = await api.patch(`/article/${id}`, dto);
    return data;
  },
  remove: async (id: string) => {
    const { data } = await api.delete(`/article/${id}`);
    return data;
  },
  importFile: async (
    fileUri: string,
    fileName: string,
    mimeType: string,
    creatriceId: string,
  ) => {
    const formData = new FormData();
    formData.append("file", {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    } as any);
    //- Ne pas forcer Content-Type — Axios doit générer la boundary automatiquement
    const { data } = await api.post(
      `/article/import?creatriceId=${creatriceId}`,
      formData,
    );
    return data as { imported: number; message: string };
  },
};

//- Creatrices
export const creatriceService = {
  getAll: async () => {
    const { data } = await api.get("/creatrice");
    return data;
  },
  getOne: async (id: string) => {
    const { data } = await api.get(`/creatrice/${id}`);
    return data;
  },
  create: async (dto: {
    nom: string;
    email?: string;
    telephone?: string;
    tauxDeCommission: number;
  }) => {
    const { data } = await api.post("/creatrice", dto);
    return data;
  },
  update: async (
    id: string,
    dto: Partial<{
      nom: string;
      email?: string;
      telephone?: string;
      tauxDeCommission: number;
    }>,
  ) => {
    const { data } = await api.patch(`/creatrice/${id}`, dto);
    return data;
  },
  remove: async (id: string) => {
    const { data } = await api.delete(`/creatrice/${id}`);
    return data;
  },
  invite: async (id: string, email: string, boutiqueId: string) => {
    const { data } = await api.post(`/creatrice/${id}/invite`, {
      email,
      boutiqueId,
    });
    return data;
  },
};
export default api;
