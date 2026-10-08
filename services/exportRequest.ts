// Construit l'adresse serveur et le nom de fichier d'un export (écran Documents).
// Fonction pure, sans dépendance : testable seule. Mêmes routes que le web.

export type ExportFormat = "pdf" | "excel" | "csv";
export type ExportDoc = "ventes" | "recap";

const EXT: Record<ExportFormat, string> = { pdf: "pdf", excel: "xlsx", csv: "csv" };

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export interface ExportParams {
  format: ExportFormat;
  /** Vue gérante (détail/récapitulatif) ou créatrice (ses ventes) */
  gerante: boolean;
  doc: ExportDoc;
  /** "YYYY-MM", ou null = tous les mois (PRO/DUO ; FREE reçoit toujours le mois en cours) */
  mois: string | null;
  boutiqueId?: string;
  /** Boutique effective pour le récapitulatif (1re boutique si plusieurs et aucune choisie) */
  boutiqueRecap?: string;
  creatriceId?: string;
  creatriceNom?: string;
}

export function buildExportRequest(p: ExportParams): { path: string; filename: string } {
  const ext = EXT[p.format];
  const suffix = p.mois ? `-${p.mois}` : "-tout";
  const q = (params: (string | null)[]) => params.filter(Boolean).join("&");
  const withQuery = (path: string, query: string) => (query ? `${path}?${query}` : path);

  if (!p.gerante) {
    return { path: withQuery(`/export/${p.format}`, q([p.mois ? `mois=${p.mois}` : null])), filename: `ventes${suffix}.${ext}` };
  }
  if (p.doc === "recap") {
    const query = q([p.boutiqueRecap ? `boutiqueId=${encodeURIComponent(p.boutiqueRecap)}` : null, p.mois ? `mois=${p.mois}` : null]);
    return { path: withQuery(`/export/${p.format}/boutique`, query), filename: `rapport-boutique${suffix}.${ext}` };
  }
  const query = q([
    p.boutiqueId ? `boutiqueId=${encodeURIComponent(p.boutiqueId)}` : null,
    p.creatriceId ? `creatriceId=${encodeURIComponent(p.creatriceId)}` : null,
    p.mois ? `mois=${p.mois}` : null,
  ]);
  const base = p.creatriceId && p.creatriceNom ? `ventes-${slug(p.creatriceNom)}` : "ventes-boutique";
  return { path: withQuery(`/export/${p.format}/ventes`, query), filename: `${base}${suffix}.${ext}` };
}
