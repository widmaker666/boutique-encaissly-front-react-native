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
    role?: "GERANTE" | "CREATRICE",
  ) => {
    const { data } = await api.post("/auth/register", {
      email,
      password,
      nom,
      prenom,
      ...(role ? { role } : {}),
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
export type StatsParams = { evenementId?: string; boutiqueId?: string };

export const statsService = {
  getGlobal: async (params?: StatsParams) => {
    const { data } = await api.get("/stats", { params: params ?? {} });
    return data;
  },
  getHistorique: async (params?: StatsParams) => {
    const { data } = await api.get("/stats/historique", { params: params ?? {} });
    return data;
  },
  getTopArticles: async (params?: StatsParams) => {
    const { data } = await api.get("/stats/top-articles", { params: params ?? {} });
    return data;
  },
  getParCreatrice: async () => {
    const { data } = await api.get("/stats/par-creatrice");
    return data;
  },
};

//- Récupération des dernière ventes
export const venteService = {
  getRecent: async (evenementId?: string) => {
    const { data } = await api.get("/vente/recent", { params: evenementId ? { evenementId } : {} });
    return data;
  },
  getAll: async (filters?: { creatriceId?: string; modePaiement?: string; evenementId?: string }) => {
    const { data } = await api.get("/vente", { params: filters });
    return data;
  },
  create: async (dto: {
    nomArticle: string;
    prixVente: number;
    modePaiement: "ESPECES" | "CARTE";
    creatriceId: string;
    evenementId?: string;
    articleId?: string;
    quantite?: number;
  }) => {
    const { data } = await api.post("/vente", dto);
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
  getMesBoutiques: async () => {
    const { data } = await api.get("/boutique");
    return data;
  },
  creerMaBoutique: async (nom: string) => {
    const { data } = await api.post("/boutique/ma-boutique", { nom });
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
  //- Crée un événement pour la CREATRICE authentifiée (plan check côté back)
  creerMonEvenement: async (nom: string) => {
    const { data } = await api.post("/evenement/mon-evenement", { nom });
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
  getAll: async (params?: { creatriceId?: string; evenementId?: string }) => {
    const { data } = await api.get("/article", { params: params ?? {} });
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
    creatriceId?: string;
    evenementId?: string;
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
    scope: { creatriceId?: string; evenementId?: string },
  ) => {
    const formData = new FormData();
    formData.append("file", { uri: fileUri, name: fileName, type: mimeType } as any);
    const token = useAuthStore.getState().accessToken;
    const params = new URLSearchParams();
    if (scope.creatriceId) params.set("creatriceId", scope.creatriceId);
    if (scope.evenementId) params.set("evenementId", scope.evenementId);
    const response = await fetch(
      `${API_BASE_URL}/article/import?${params.toString()}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      },
    );
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw { response: { data: err } };
    }
    return response.json() as Promise<{ imported: number; message: string }>;
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
  acceptInvitation: async (creatriceId: string, boutiqueId: string) => {
    const { data } = await api.post(`/creatrice/${creatriceId}/accept-invitation`, { boutiqueId });
    return data;
  },
};
//- User profile
export const userService = {
  updateProfile: (dto: { nom?: string; prenom?: string }) =>
    api.patch('/user/profile', dto).then((r) => r.data),
  updateNotifications: (enabled: boolean) =>
    api.patch('/user/notifications', { notificationsEmail: enabled }).then((r) => r.data),
  uploadAvatar: async (imageUri: string, mimeType: string) => {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() ?? 'avatar.jpg';
    formData.append('file', { uri: imageUri, name: filename, type: mimeType } as any);
    const token = useAuthStore.getState().accessToken;
    const response = await fetch(`${API_BASE_URL}/user/avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw { response: { data: err } };
    }
    return response.json();
  },
};

//- Stripe
export const stripeService = {
  createCheckoutSession: async (priceId: string) => {
    const { data } = await api.post('/stripe/checkout', { priceId });
    return data as { url: string };
  },
  cancelSubscription: async () => {
    const { data } = await api.post('/stripe/cancel');
    return data;
  },
  upgradeDuo: async () => {
    const { data } = await api.patch('/user/upgrade-duo');
    return data as import('@/types').User;
  },
};

//- Notifications
export const notificationService = {
  getAll: () => api.get('/notification').then((r) => r.data),
  getUnreadCount: () => api.get('/notification/unread-count').then((r) => r.data),
  markAllAsRead: () => api.patch('/notification/read-all').then((r) => r.data),
  markAsRead: (id: string) => api.patch(`/notification/${id}/read`).then((r) => r.data),
};

export default api;
