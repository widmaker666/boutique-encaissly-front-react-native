import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { statsService } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { API_BASE_URL } from "@/constants/api";
import VentesExportButtons from "@/components/VentesExportButtons";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Radius } from "@/constants/spacing";
import { shadows } from "@/styles/utils/shadows.styles";

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  csv: "text/csv",
};

async function downloadAndShare(path: string, filename: string, token: string | null) {
  if (!token) return;
  const ext = filename.split(".").pop() ?? "pdf";
  const fileUri = `${FileSystem.documentDirectory}${filename}`;
  try {
    const result = await FileSystem.downloadAsync(path, fileUri, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (result.status === 200) {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(result.uri, {
          mimeType: MIME[ext] ?? "application/octet-stream",
          dialogTitle: "Ouvrir ou enregistrer le document",
          UTI: ext === "pdf" ? "com.adobe.pdf" : undefined,
        });
      }
    }
  } catch {}
}

function fmt(n: number | null | undefined) {
  return (Math.round((n ?? 0) * 100) / 100).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " €";
}

function toUpper(str: string) {
  return str.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
}

export default function BoutiqueDetailScreen() {
  const { id, nom } = useLocalSearchParams<{ id: string; nom: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  //- DUO débloque les mêmes fonctionnalités que PRO (plan payant à part
  //- entière, pas une variante de FREE)
  const isPro = user?.plan === "PRO" || user?.plan === "DUO";

  const [downloading, setDownloading] = useState<string | null>(null);

  const boutiqueName = nom ? decodeURIComponent(nom) : "Boutique";

  const { data: stats, isLoading } = useQuery<any>({
    queryKey: ["stats-boutique", id],
    queryFn: () => statsService.getGlobal({ boutiqueId: id }),
    enabled: !!id,
  });

  const ca = stats?.stats._sum?.prixVente ?? 0;
  const nbVentes = stats?.stats._count ?? 0;
  const commissions = stats?.totalCommissions ?? 0;
  const netBoutique = ca - commissions;

  const handleDownload = async (type: "pdf" | "excel" | "csv") => {
    const ext = type === "excel" ? "xlsx" : type;
    const filename = `boutique-${boutiqueName.toLowerCase().replace(/\s+/g, "-")}.${ext}`;
    const path = `${API_BASE_URL}/export/${type}/boutique?boutiqueId=${id}`;
    setDownloading(type);
    await downloadAndShare(path, filename, accessToken);
    setDownloading(null);
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.75}>
          <Text style={s.backTxt}>‹</Text>
        </TouchableOpacity>
        <View style={s.headerCenter}>
          <Text style={s.sousTitre}>FICHE BOUTIQUE</Text>
          <Text style={s.titre} numberOfLines={1}>{boutiqueName}</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Stats */}
        <Text style={s.sectionTitle}>Statistiques</Text>
        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginVertical: 24 }} />
        ) : (
          <View style={s.statsGrid}>
            {[
              { label: "Chiffre d'affaires", value: fmt(ca) },
              { label: "Ventes", value: String(nbVentes) },
              { label: "Commissions créatrices", value: fmt(commissions) },
              { label: "Net boutique", value: fmt(netBoutique) },
            ].map((item) => (
              <View key={item.label} style={s.statCard}>
                <Text style={s.statValue}>{item.value}</Text>
                <Text style={s.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Export */}
        <Text style={[s.sectionTitle, { marginTop: 8 }]}>Exporter les stats</Text>

        <TouchableOpacity
          style={[s.exportBtn, downloading === "pdf" && s.exportBtnLoading]}
          activeOpacity={0.85}
          onPress={() => handleDownload("pdf")}
          disabled={!!downloading}
        >
          {downloading === "pdf" ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={s.exportIcon}>📄</Text>
              <View style={s.exportInfo}>
                <Text style={s.exportLabel}>Rapport PDF</Text>
                <Text style={s.exportSub}>Résumé complet · Gratuit</Text>
              </View>
              <Text style={s.exportArrow}>›</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.exportBtn, !isPro && s.exportBtnLocked, downloading === "excel" && s.exportBtnLoading]}
          activeOpacity={isPro ? 0.85 : 1}
          onPress={() => isPro && handleDownload("excel")}
          disabled={!isPro || !!downloading}
        >
          {downloading === "excel" ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={s.exportIcon}>📊</Text>
              <View style={s.exportInfo}>
                <Text style={[s.exportLabel, !isPro && s.exportLabelLocked]}>Export Excel</Text>
                <Text style={s.exportSub}>{isPro ? "Toutes les ventes · .xlsx" : "Disponible en PRO"}</Text>
              </View>
              {!isPro ? <Text style={s.lockIcon}>🔒</Text> : <Text style={s.exportArrow}>›</Text>}
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.exportBtn, !isPro && s.exportBtnLocked, downloading === "csv" && s.exportBtnLoading]}
          activeOpacity={isPro ? 0.85 : 1}
          onPress={() => isPro && handleDownload("csv")}
          disabled={!isPro || !!downloading}
        >
          {downloading === "csv" ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={s.exportIcon}>📋</Text>
              <View style={s.exportInfo}>
                <Text style={[s.exportLabel, !isPro && s.exportLabelLocked]}>Export CSV</Text>
                <Text style={s.exportSub}>{isPro ? "Compatible tableur · .csv" : "Disponible en PRO"}</Text>
              </View>
              {!isPro ? <Text style={s.lockIcon}>🔒</Text> : <Text style={s.exportArrow}>›</Text>}
            </>
          )}
        </TouchableOpacity>

        {/* Détail des ventes de toutes les créatrices de cette boutique, mois par mois */}
        <Text style={[s.sectionTitle, { marginTop: 12 }]}>Ventes des créatrices</Text>
        <VentesExportButtons
          boutiqueId={id}
          filenameBase={`ventes-${boutiqueName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
        />

        <View style={{ height: insets.bottom + 24 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header crème — même DA que le web
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: Radius.md, backgroundColor: Colors.surface,
    alignItems: "center", justifyContent: "center",
  },
  backTxt: { fontFamily: Fonts.family.nowBold, fontSize: 24, color: Colors.text, lineHeight: 28 },
  headerCenter: { flex: 1 },
  titre: { fontFamily: Fonts.family.norwester, fontWeight: "800", fontSize: 26, color: Colors.text, letterSpacing: -0.3 },
  sousTitre: { fontFamily: Fonts.family.nowBold, fontSize: 11, color: Colors.primary, letterSpacing: 0.6, marginBottom: 2 },

  scroll: { padding: 16 },

  sectionTitle: {
    fontFamily: Fonts.family.norwester, fontWeight: "800", fontSize: Fonts.sizes.lg, color: Colors.text,
    letterSpacing: -0.3, marginBottom: 10, marginTop: 4,
  },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1, minWidth: "45%", backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: 16, ...shadows.sm,
  },
  statValue: { fontFamily: Fonts.family.norwester, fontWeight: "800", fontSize: 20, color: Colors.text, marginBottom: 4 },
  statLabel: { fontFamily: Fonts.family.nowBold, fontSize: 11, color: Colors.textLight, letterSpacing: 0.3 },

  exportBtn: {
    flexDirection: "row", alignItems: "center", backgroundColor: Colors.surface,
    borderRadius: Radius.lg, padding: 16, marginBottom: 10, minHeight: 56, ...shadows.sm,
  },
  exportBtnLocked: { opacity: 0.5 },
  exportBtnLoading: { backgroundColor: Colors.text },
  exportIcon: { fontSize: 24, marginRight: 12 },
  exportInfo: { flex: 1 },
  exportLabel: { fontFamily: Fonts.family.nowBold, fontSize: 14, color: Colors.text },
  exportLabelLocked: { color: Colors.textLight },
  exportSub: { fontFamily: Fonts.family.nowRegular, fontSize: 12, color: Colors.textLight, marginTop: 2 },
  exportArrow: { fontFamily: Fonts.family.nowBold, fontSize: 18, color: Colors.text },
  lockIcon: { fontSize: 16 },
});
