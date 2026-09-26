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
          <Text style={s.titre} numberOfLines={1}>{toUpper(boutiqueName)}</Text>
          <Text style={s.sousTitre}>FICHE BOUTIQUE</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Stats */}
        <Text style={s.sectionTitle}>STATISTIQUES</Text>
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
        <Text style={[s.sectionTitle, { marginTop: 8 }]}>EXPORTER LES STATS</Text>

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
        <Text style={[s.sectionTitle, { marginTop: 12 }]}>VENTES DES CRÉATRICES</Text>
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

  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: { width: 36, alignItems: "center" },
  backTxt: { fontFamily: Fonts.family.nowBold, fontSize: 28, color: "#fff", lineHeight: 36 },
  headerCenter: { flex: 1, alignItems: "center" },
  titre: { fontFamily: "Norwester", fontSize: 18, color: "#fff", letterSpacing: 2 },
  sousTitre: { fontFamily: Fonts.family.nowRegular, fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 2 },

  scroll: { padding: 16 },

  sectionTitle: {
    fontFamily: Fonts.family.nowBold, fontSize: 12, color: Colors.textLight,
    letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, marginTop: 4,
  },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1, minWidth: "45%", backgroundColor: Colors.surface, borderRadius: 12,
    padding: 14, shadowColor: "#7a41bb", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  statValue: { fontFamily: "Norwester", fontSize: 18, color: Colors.primary, marginBottom: 4 },
  statLabel: { fontFamily: Fonts.family.nowRegular, fontSize: 11, color: Colors.textLight },

  exportBtn: {
    flexDirection: "row", alignItems: "center", backgroundColor: Colors.surface,
    borderRadius: 12, padding: 14, marginBottom: 10,
    shadowColor: "#7a41bb", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1,
  },
  exportBtnLocked: { opacity: 0.5 },
  exportBtnLoading: { backgroundColor: Colors.primary },
  exportIcon: { fontSize: 24, marginRight: 12 },
  exportInfo: { flex: 1 },
  exportLabel: { fontFamily: Fonts.family.nowBold, fontSize: 14, color: Colors.text },
  exportLabelLocked: { color: Colors.textLight },
  exportSub: { fontFamily: Fonts.family.nowRegular, fontSize: 12, color: Colors.textLight, marginTop: 2 },
  exportArrow: { fontFamily: Fonts.family.nowBold, fontSize: 18, color: Colors.primary },
  lockIcon: { fontSize: 16 },
});
