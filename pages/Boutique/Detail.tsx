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
import { statsService } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Radius } from "@/constants/spacing";
import { shadows } from "@/styles/utils/shadows.styles";

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

        <TouchableOpacity
          style={{ alignSelf: "flex-start", paddingVertical: 12 }}
          onPress={() => router.push("/(app)/documents")}
          activeOpacity={0.8}
          accessibilityRole="button"
        >
          <Text style={{ fontFamily: Fonts.family.nowMedium, fontSize: Fonts.sizes.sm, color: Colors.primary }}>Exporter en PDF, Excel ou CSV →</Text>
        </TouchableOpacity>
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
