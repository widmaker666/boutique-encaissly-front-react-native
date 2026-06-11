import { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Animated,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { statsService } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { API_BASE_URL } from "@/constants/api";

// ── AnimCard ─────────────────────────────────────────────────────────────────

function AnimCard({
  children,
  index,
  style,
}: {
  children: React.ReactNode;
  index: number;
  style?: any;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 350,
      delay: index * 60,
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [18, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const round2 = (n: number | null | undefined): string =>
  (Math.round((n ?? 0) * 100) / 100).toFixed(2);

// ── Export helper ─────────────────────────────────────────────────────────────

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  csv: "text/csv",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

async function downloadAndShare(
  path: string,
  filename: string,
  token: string | null,
) {
  if (!token) return;
  const ext = filename.split(".").pop() ?? "pdf";
  const fileUri = `${FileSystem.documentDirectory}${filename}`;
  try {
    const result = await FileSystem.downloadAsync(
      `${API_BASE_URL}${path}`,
      fileUri,
      { headers: { Authorization: `Bearer ${token}` } },
    );
    if (result.status === 200) {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(result.uri, {
          mimeType: MIME[ext] ?? "application/octet-stream",
          dialogTitle: "Ouvrir ou enregistrer le document",
          UTI: ext === "pdf" ? "com.adobe.pdf" : undefined,
        });
      } else {
        Alert.alert("Document prêt", `Fichier sauvegardé : ${filename}`);
      }
    } else {
      Alert.alert("Erreur", "Impossible de générer le document.");
    }
  } catch {
    Alert.alert("Erreur", "Une erreur est survenue lors du téléchargement.");
  }
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const activeEvenementId = useAuthStore((state) => state.activeEvenementId);
  const activeEvenementNom = useAuthStore((state) => state.activeEvenementNom);
  const isGerante = user?.role === "GERANTE";
  const isPro = user?.plan === "PRO";
  const bid = activeEvenementId ?? undefined;
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (path: string, filename: string) => {
    setDownloading(filename);
    await downloadAndShare(path, filename, accessToken);
    setDownloading(null);
  };

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, []);

  const { data: globalData } = useQuery({
    queryKey: ["stats-global", bid ?? "personal"],
    queryFn: () => statsService.getGlobal(bid),
  });

  const { data: historiqueData } = useQuery({
    queryKey: ["stats-historique", bid ?? "personal"],
    queryFn: () => statsService.getHistorique(bid),
    enabled: isPro,
  });

  const { data: topArticlesData } = useQuery({
    queryKey: ["stats-top-articles", bid ?? "personal"],
    queryFn: () => statsService.getTopArticles(bid),
  });

  const { data: parCreatriceData } = useQuery({
    queryKey: ["stats-par-creatrice"],
    queryFn: statsService.getParCreatrice,
    enabled: isGerante,
  });

  // Données dérivées
  const paiements: any[] = globalData?.paiement ?? [];
  const especes = paiements.find((p) => p.modePaiement === "ESPECES");
  const carte = paiements.find((p) => p.modePaiement === "CARTE");
  const especesMontant: number = especes?._sum?.prixVente ?? 0;
  const carteMontant: number = carte?._sum?.prixVente ?? 0;
  const paiementsTotal = especesMontant + carteMontant;

  const historique: any[] = historiqueData ?? [];
  const caMax = historique.reduce(
    (max: number, item: any) => (item.ca > max ? item.ca : max),
    0,
  );

  const topArticles: any[] = topArticlesData ?? [];
  const caMaxArticle = topArticles.reduce(
    (max: number, a: any) => (a.ca > max ? a.ca : max),
    0,
  );

  const parCreatrice: any[] = parCreatriceData ?? [];

  // Label sous-titre header
  const headerSubtitle = isPro
    ? "3 derniers mois"
    : new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });

  return (
    <ScrollView
      style={st.container}
      contentContainerStyle={st.content}
      showsVerticalScrollIndicator={false}
    >
      {/* ── 1. Header violet ── */}
      <Animated.View
        style={[
          st.header,
          { paddingTop: insets.top + 20 },
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={st.headerTitle}>STATS</Text>
        <View style={st.badgeWrap}>
          <Text style={st.badge}>
            {activeEvenementNom ? `🎪 ${activeEvenementNom}` : (isPro ? "PRO ✨" : "FREE")}
          </Text>
        </View>
        <Text style={st.headerSub}>
          {isPro ? "3 derniers mois" : `Mois en cours · ${headerSubtitle}`}
        </Text>
      </Animated.View>

      <View style={st.body}>
        {/* ── 2. KPIs grille 2×2 ── */}
        <Text style={st.sectionTitle}>Résumé</Text>
        <View style={st.cardsGrid}>
          {[
            {
              label: "Chiffre d'affaires",
              value: `${round2(globalData?.stats?._sum?.prixVente)} €`,
            },
            {
              label: "Ventes",
              value: `${globalData?.stats?._count ?? 0}`,
            },
            {
              label: "Commissions",
              value: `${round2(globalData?.totalCommissions)} €`,
            },
            {
              label: "Meilleure vente",
              value: `${round2(globalData?.stats?._max?.prixVente)} €`,
            },
          ].map((item, i) => (
            <AnimCard key={item.label} index={i} style={st.card}>
              <Text style={st.cardLabel}>{item.label}</Text>
              <Text style={st.cardValue}>{item.value}</Text>
            </AnimCard>
          ))}
        </View>

        {/* ── 3. Répartition paiements ── */}
        <Text style={st.sectionTitle}>Répartition paiements</Text>
        <AnimCard index={4} style={st.paiementsCard}>
          {[
            { label: "💵 Espèces", montant: especesMontant },
            { label: "💳 Carte", montant: carteMontant },
          ].map((item) => {
            const pct =
              paiementsTotal > 0 ? (item.montant / paiementsTotal) * 100 : 0;
            return (
              <View key={item.label} style={st.paiementRow}>
                <View style={st.paiementLabelRow}>
                  <Text style={st.paiementLabel}>{item.label}</Text>
                  <Text style={st.paiementMontant}>
                    {round2(item.montant)} €
                  </Text>
                </View>
                <View style={st.barTrack}>
                  <View
                    style={[
                      st.barFill,
                      { width: `${Math.max(pct, pct > 0 ? 2 : 0)}%` as any },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </AnimCard>

        {/* ── 4. Historique 3 mois (PRO only) ── */}
        <Text style={st.sectionTitle}>Historique mensuel</Text>
        {!isPro ? (
          <AnimCard index={5} style={st.lockedBox}>
            <Text style={st.lockedTxt}>
              Historique disponible en PRO
            </Text>
            <Text style={st.lockedDesc}>
              Accédez aux 3 derniers mois de chiffre d'affaires avec le plan PRO.
            </Text>
          </AnimCard>
        ) : historique.length > 0 ? (
          <AnimCard index={5} style={st.chartCard}>
            <View style={st.barsContainer}>
              {historique.map((item: any) => {
                const height = caMax > 0 ? (item.ca / caMax) * 110 : 4;
                const label = item.mois.split(" ")[0].slice(0, 3);
                return (
                  <View key={item.mois} style={st.barColWrapper}>
                    <Text style={st.barValueLabel}>{round2(item.ca)} €</Text>
                    <View
                      style={[
                        st.barVertical,
                        { height: Math.max(height, 4) },
                      ]}
                    />
                    <Text style={st.barMonthLabel}>{label}</Text>
                  </View>
                );
              })}
            </View>
          </AnimCard>
        ) : (
          <AnimCard index={5} style={st.emptyCard}>
            <Text style={st.emptyTxt}>Aucune donnée disponible</Text>
          </AnimCard>
        )}

        {/* ── 5. Top articles ── */}
        <Text style={st.sectionTitle}>Top articles</Text>
        {topArticles.length === 0 ? (
          <AnimCard index={6} style={st.emptyCard}>
            <Text style={st.emptyTxt}>Aucun article vendu</Text>
          </AnimCard>
        ) : (
          topArticles.map((article: any, i: number) => {
            const pct =
              caMaxArticle > 0 ? (article.ca / caMaxArticle) * 100 : 0;
            return (
              <AnimCard key={article.nomArticle ?? i} index={6 + i} style={st.articleRow}>
                <View style={st.articleHeader}>
                  <Text style={st.articleNom} numberOfLines={1}>
                    {article.nomArticle}
                  </Text>
                  <Text style={st.articleCA}>{round2(article.ca)} €</Text>
                </View>
                <Text style={st.articleMeta}>
                  {article.quantite ?? article.nbVentes} vendu(s)
                </Text>
                <View style={st.barTrack}>
                  <View
                    style={[
                      st.barFill,
                      { width: `${Math.max(pct, pct > 0 ? 2 : 0)}%` as any },
                    ]}
                  />
                </View>
              </AnimCard>
            );
          })
        )}

        {/* ── 6. Stats par créatrice (GERANTE only) ── */}
        {isGerante && (
          <>
            <Text style={st.sectionTitle}>Par créatrice</Text>
            {parCreatrice.length === 0 ? (
              <AnimCard index={12} style={st.emptyCard}>
                <Text style={st.emptyTxt}>Aucune donnée créatrice</Text>
              </AnimCard>
            ) : (
              <>
                {/* En-tête tableau */}
                <View style={st.tableHeader}>
                  <Text style={[st.tableHeaderCell, { flex: 2 }]}>Nom</Text>
                  <Text style={st.tableHeaderCell}>CA</Text>
                  <Text style={st.tableHeaderCell}>Com.</Text>
                  <Text style={st.tableHeaderCell}>Net</Text>
                </View>
                {parCreatrice.map((c: any, i: number) => (
                  <AnimCard key={c.id ?? i} index={12 + i} style={st.tableRow}>
                    <Text style={[st.tableCell, st.tableCellNom]} numberOfLines={1}>
                      {c.nom}
                    </Text>
                    <Text style={st.tableCell}>{round2(c.ca)} €</Text>
                    <Text style={st.tableCell}>{round2(c.commissions)} €</Text>
                    <Text style={[st.tableCell, st.tableCellNet]}>
                      {round2(c.net)} €
                    </Text>
                  </AnimCard>
                ))}
              </>
            )}
          </>
        )}
        {/* ── 7. Export ── */}
        <Text style={st.sectionTitle}>Téléchargements</Text>
        <AnimCard index={20} style={st.exportCard}>
          {/* PDF — disponible pour tous */}
          <ExportBtn
            label="📄 Rapport PDF"
            sublabel="Toujours disponible"
            loading={downloading === "rapport.pdf"}
            onPress={() =>
              handleDownload(
                isGerante ? "/export/pdf/boutique" : "/export/pdf",
                "rapport.pdf",
              )
            }
          />

          {/* CSV */}
          {isPro ? (
            <ExportBtn
              label="📊 Export CSV"
              sublabel="Ouvrir dans Excel / Sheets"
              loading={downloading === "export.csv"}
              onPress={() =>
                handleDownload(
                  isGerante ? "/export/csv/boutique" : "/export/csv",
                  "export.csv",
                )
              }
            />
          ) : (
            <LockedExportBtn label="📊 Export CSV" />
          )}

          {/* Excel */}
          {isPro ? (
            <ExportBtn
              label="📗 Export Excel"
              sublabel="Fichier .xlsx mis en forme"
              loading={downloading === "export.xlsx"}
              onPress={() =>
                handleDownload(
                  isGerante ? "/export/excel/boutique" : "/export/excel",
                  "export.xlsx",
                )
              }
            />
          ) : (
            <LockedExportBtn label="📗 Export Excel" />
          )}
        </AnimCard>
      </View>
    </ScrollView>
  );
}

// ── Sous-composants export ─────────────────────────────────────────────────────

function ExportBtn({
  label,
  sublabel,
  loading,
  onPress,
}: {
  label: string;
  sublabel: string;
  loading: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={st.exportBtn}
      activeOpacity={0.75}
      onPress={onPress}
      disabled={loading}
    >
      <View style={{ flex: 1 }}>
        <Text style={st.exportBtnLabel}>{label}</Text>
        <Text style={st.exportBtnSub}>{sublabel}</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="small" color={Colors.primary} />
      ) : (
        <Text style={st.exportBtnArrow}>↓</Text>
      )}
    </TouchableOpacity>
  );
}

function LockedExportBtn({ label }: { label: string }) {
  return (
    <View style={[st.exportBtn, st.exportBtnLocked]}>
      <Text style={st.exportBtnLabelLocked}>🔒 {label}</Text>
      <Text style={st.exportBtnLockedBadge}>PRO</Text>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const cardShadow = {
  shadowColor: "#7a41bb",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.09,
  shadowRadius: 8,
  elevation: 3,
};

const st = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 56,
  },

  // ── Header ──────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 28,
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontFamily: "Norwester",
    fontSize: Fonts.sizes.xl,
    letterSpacing: 2,
    marginBottom: 10,
  },
  badgeWrap: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    marginBottom: 8,
  },
  badge: {
    color: "#FFFFFF",
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.xs,
    letterSpacing: 0.5,
  },
  headerSub: {
    color: "rgba(255,255,255,0.75)",
    fontFamily: Fonts.family.nowLight,
    fontSize: Fonts.sizes.xs,
    textTransform: "capitalize",
  },

  // ── Body ────────────────────────────────────────────────────────────────────
  body: {
    padding: 16,
  },

  sectionTitle: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: 11,
    color: Colors.textLight,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 20,
  },

  // ── KPI Cards grid ──────────────────────────────────────────────────────────
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    width: "48.5%",
    ...cardShadow,
  },
  cardLabel: {
    fontFamily: Fonts.family.nowLight,
    color: Colors.textLight,
    fontSize: Fonts.sizes.xs,
    marginBottom: 6,
  },
  cardValue: {
    fontFamily: "Norwester",
    color: Colors.primary,
    fontSize: Fonts.sizes.lg,
    letterSpacing: 0.5,
  },

  // ── Paiements ────────────────────────────────────────────────────────────────
  paiementsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    gap: 14,
    ...cardShadow,
  },
  paiementRow: {
    gap: 6,
  },
  paiementLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paiementLabel: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },
  paiementMontant: {
    fontFamily: "Norwester",
    fontSize: Fonts.sizes.md,
    color: Colors.primary,
    letterSpacing: 0.5,
  },

  // ── Barres de progression ────────────────────────────────────────────────────
  barTrack: {
    height: 6,
    backgroundColor: "#e8d5f5",
    borderRadius: 3,
    marginTop: 4,
  },
  barFill: {
    height: 6,
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },

  // ── Historique chart ─────────────────────────────────────────────────────────
  chartCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    ...cardShadow,
  },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    height: 150,
  },
  barColWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  barValueLabel: {
    fontSize: 11,
    color: Colors.primary,
    fontFamily: Fonts.family.nowMedium,
    marginBottom: 4,
    textAlign: "center",
  },
  barVertical: {
    width: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  barMonthLabel: {
    fontSize: 10,
    color: Colors.textLight,
    fontFamily: Fonts.family.nowLight,
    marginTop: 6,
    textTransform: "capitalize",
  },

  // ── Articles ─────────────────────────────────────────────────────────────────
  articleRow: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    ...cardShadow,
  },
  articleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  articleNom: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  articleCA: {
    fontFamily: "Norwester",
    fontSize: Fonts.sizes.md,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  articleMeta: {
    fontFamily: Fonts.family.nowLight,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    marginBottom: 6,
  },

  // ── Tableau créatrices ────────────────────────────────────────────────────────
  tableHeader: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 4,
  },
  tableHeaderCell: {
    flex: 1,
    fontFamily: Fonts.family.nowMedium,
    fontSize: 10,
    color: Colors.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    textAlign: "right",
  },
  tableRow: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 6,
    flexDirection: "row",
    alignItems: "center",
    ...cardShadow,
  },
  tableCell: {
    flex: 1,
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.xs,
    color: Colors.text,
    textAlign: "right",
  },
  tableCellNom: {
    flex: 2,
    fontFamily: Fonts.family.nowMedium,
    textAlign: "left",
    color: Colors.text,
  },
  tableCellNet: {
    color: Colors.success,
    fontFamily: Fonts.family.nowMedium,
  },

  // ── Export ───────────────────────────────────────────────────────────────────
  exportCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 8,
    ...cardShadow,
  },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0e8f8",
    gap: 12,
  },
  exportBtnLabel: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },
  exportBtnSub: {
    fontFamily: Fonts.family.nowLight,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    marginTop: 1,
  },
  exportBtnArrow: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 18,
    color: Colors.primary,
  },
  exportBtnLocked: {
    backgroundColor: "#fafafa",
    justifyContent: "space-between",
  },
  exportBtnLabelLocked: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
  },
  exportBtnLockedBadge: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: 10,
    color: Colors.primary,
    backgroundColor: Colors.primaryLight + "25",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },

  // ── Locked / Empty ────────────────────────────────────────────────────────────
  lockedBox: {
    backgroundColor: Colors.primaryLight + "15",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight + "40",
    borderStyle: "dashed",
  },
  lockedTxt: {
    fontFamily: Fonts.family.nowMedium,
    color: Colors.primaryDark,
    fontSize: Fonts.sizes.sm,
    textAlign: "center",
    marginBottom: 6,
  },
  lockedDesc: {
    fontFamily: Fonts.family.nowLight,
    color: Colors.textLight,
    fontSize: Fonts.sizes.xs,
    textAlign: "center",
    lineHeight: 18,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginBottom: 8,
    ...cardShadow,
  },
  emptyTxt: {
    fontFamily: Fonts.family.nowLight,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
  },
});
