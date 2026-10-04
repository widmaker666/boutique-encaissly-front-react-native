import { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { useAuthStore } from "@/stores/auth.store";
import { downloadAndShare } from "@/services/download";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { shadows } from "@/styles/utils/shadows.styles";

const MOIS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
];

type Format = "pdf" | "excel" | "csv";

const FORMATS: { type: Format; ext: string; icon: string; label: string; proOnly: boolean }[] = [
  { type: "pdf", ext: "pdf", icon: "📄", label: "PDF", proOnly: false },
  { type: "excel", ext: "xlsx", icon: "📊", label: "Excel", proOnly: true },
  { type: "csv", ext: "csv", icon: "📋", label: "CSV", proOnly: true },
];

type Props = {
  /** Sans boutiqueId : toutes les boutiques de la gérante */
  boutiqueId?: string;
  /** Sans creatriceId : toutes les créatrices */
  creatriceId?: string;
  /** Début du nom de fichier, le mois est ajouté (ex. "ventes-boutique-2026-09.pdf") */
  filenameBase: string;
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Détail des ventes (une ligne par vente) d'un mois, en PDF / Excel / CSV.
 * Vue gérante uniquement — c'est à l'écran qui l'affiche d'appliquer cette condition.
 * FREE : PDF uniquement et mois en cours uniquement. PRO / DUO : tous formats, tous mois.
 */
export default function VentesExportButtons({ boutiqueId, creatriceId, filenameBase }: Props) {
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  // DUO débloque exactement ce que PRO débloque
  const isPro = user?.plan === "PRO" || user?.plan === "DUO";

  const now = new Date();
  const currentKey = `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-11
  const [downloading, setDownloading] = useState<Format | null>(null);

  const key = `${year}-${pad(month + 1)}`;
  const isCurrent = key === currentKey;

  const goPrev = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };
  const goNext = () => {
    if (isCurrent) return; // pas de mois futur
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  const handleDownload = async (format: (typeof FORMATS)[number]) => {
    const params = [
      boutiqueId ? `boutiqueId=${encodeURIComponent(boutiqueId)}` : null,
      creatriceId ? `creatriceId=${encodeURIComponent(creatriceId)}` : null,
      `mois=${key}`,
    ]
      .filter(Boolean)
      .join("&");
    setDownloading(format.type);
    await downloadAndShare(
      `/export/${format.type}/ventes?${params}`,
      `${filenameBase}-${key}.${format.ext}`,
      token,
    );
    setDownloading(null);
  };

  const sub = (format: (typeof FORMATS)[number]) => {
    if (format.proOnly && !isPro) return "Disponible en PRO";
    if (format.type === "pdf") return isPro ? "Une ligne par vente + totaux" : "Mois en cours · avec filigrane";
    if (format.type === "excel") return "Fichier .xlsx mis en forme";
    return "Compatible Excel / Sheets";
  };

  const chevronsLocked = !isPro;

  return (
    <View style={s.card}>
      <Text style={s.intro}>
        {creatriceId
          ? "Toutes ses ventes du mois, ligne par ligne, avec sa commission et son net."
          : "Les ventes de toutes les créatrices du mois, ligne par ligne, triées par créatrice."}
      </Text>

      {/* Sélecteur de mois */}
      <View style={s.monthRow}>
        <TouchableOpacity
          style={[s.chevron, chevronsLocked && s.chevronDisabled]}
          onPress={goPrev}
          disabled={chevronsLocked}
          activeOpacity={0.7}
          accessibilityLabel="Mois précédent"
        >
          <Text style={s.chevronTxt}>‹</Text>
        </TouchableOpacity>
        <View style={s.monthCenter}>
          <Text style={s.monthLabel}>
            {MOIS_FR[month]} {year}
          </Text>
          {isPro ? (
            isCurrent ? <Text style={s.monthHint}>Mois en cours</Text> : null
          ) : (
            <Text style={s.monthHint}>🔒 Autres mois : PRO / DUO</Text>
          )}
        </View>
        <TouchableOpacity
          style={[s.chevron, (chevronsLocked || isCurrent) && s.chevronDisabled]}
          onPress={goNext}
          disabled={chevronsLocked || isCurrent}
          activeOpacity={0.7}
          accessibilityLabel="Mois suivant"
        >
          <Text style={s.chevronTxt}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Formats */}
      {FORMATS.map((format) => {
        const locked = format.proOnly && !isPro;
        const loading = downloading === format.type;
        return (
          <TouchableOpacity
            key={format.type}
            style={[s.formatBtn, locked && s.formatBtnLocked]}
            activeOpacity={locked ? 1 : 0.8}
            onPress={() => !locked && handleDownload(format)}
            disabled={locked || !!downloading}
          >
            <Text style={s.formatIcon}>{format.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[s.formatLabel, locked && s.formatLabelLocked]}>
                Récupérer en {format.label}
              </Text>
              <Text style={s.formatSub}>{sub(format)}</Text>
            </View>
            {loading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : locked ? (
              <Text style={s.lock}>🔒</Text>
            ) : (
              <Text style={s.arrow}>↓</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    ...shadows.sm,
  },
  intro: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    marginBottom: 12,
    lineHeight: 17,
  },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 6,
    marginBottom: 10,
  },
  chevron: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  chevronDisabled: { opacity: 0.25 },
  chevronTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 28,
    lineHeight: 32,
    color: Colors.text,
  },
  monthCenter: { flex: 1, alignItems: "center" },
  monthLabel: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.md,
    color: Colors.text,
  },
  monthHint: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 1,
  },
  formatBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  formatBtnLocked: { opacity: 0.5 },
  formatIcon: { fontSize: 22 },
  formatLabel: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },
  formatLabelLocked: { color: Colors.textLight },
  formatSub: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    marginTop: 1,
  },
  arrow: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 18,
    color: Colors.text,
  },
  lock: { fontSize: 16 },
});
