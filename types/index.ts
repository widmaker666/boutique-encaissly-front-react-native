export type Plan = "FREE" | "PRO";
export type Role = "GERANTE" | "CREATRICE";
export type Status = "ACTIVE" | "INVITE" | "SUSPENDUE";
export type ModePaiement = "ESPECES" | "CARTE";

export interface User {
  id: string;
  email: string;
  plan: Plan;
  role: Role;
  notificationsEmail: boolean;
  lastExportData: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Creatrice {
  id: string;
  nom: string;
  email?: string;
  telephone?: string;
  tauxDeCommission: number;
  createdAt: string;
  userId?: string;
}

export interface Vente {
  id: string;
  photo?: string;
  nomArticle: string;
  prixVente: number;
  modePaiement: ModePaiement;
  creatriceId: string;
  boutiqueId?: string;
  createdAt: string;
  creatrice?: Pick<Creatrice, "nom" | "tauxDeCommission">;
  montantCommission: number;
  netCreatrice: number;
}

export interface Boutique {
  id: string;
  nom: string;
  email?: string;
  telephone?: string;
  createdAt: string;
  geranteId: string;
}
