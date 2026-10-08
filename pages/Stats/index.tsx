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

type Filter =
  | { type: "all" }
  | { type: "event"; id: string; nom: string }
  | { type: "boutique"; id: string; nom: string };
import { useQuery } from "@tanstack/react-query";
import { statsService, evenementService, boutiqueService } from "@/services/api";
import type { StatsParams } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import PeriodePicker, { formatPeriode } from "@/components/PeriodePicker";
import { DuoModeToggle } from "@/components/DuoModeToggle";
import VentesExportButtons from "@/components/VentesExportButtons";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { shadows } from "@/styles/utils/shadows.styles";
import { Radius } from "@/constants/spacing";
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
  const isDuo = user?.role === "GERANTE_CREATRICE";
  const duoMode = useAuthStore((state) => state.duoMode);
  const isGerante = user?.role === "GERANTE" || (isDuo && duoMode === "GERANTE");
  const isCreatrice = user?.role === "CREATRICE" || (isDuo && duoMode === "CREATRICE");
  //- DUO débloque les mêmes fonctionnalités que PRO (plan payant à part
  //- entière, pas une variante de FREE) — le nom réel du plan reste affiché
  //- correctement plus bas via user?.plan, pas via ce flag
  const isPro = user?.plan === "PRO" || user?.plan === "DUO";
  const [downloading, setDownloading] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<Filter>(() =>
    activeEvenementId
      ? { type: "event", id: activeEvenementId, nom: activeEvenementNom ?? "" }
      : { type: "all" },
  );

  // Période du résumé : null = tous les mois, sinon "YYYY-MM"
  const [mois, setMois] = useState<string | null>(null);
  const moisParam = mois ?? undefined;
  const periodeLabel = formatPeriode(mois);

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

  // Queries pour peupler les pills
  const { data: mesEvenements } = useQuery<any[]>({
    queryKey: ["mes-evenements-stats"],
    queryFn: () => evenementService.getAll(),
    enabled: isCreatrice,
  });

  const { data: mesBoutiques } = useQuery<any[]>({
    queryKey: ["mes-boutiques-stats"],
    queryFn: boutiqueService.getMesBoutiques,
    enabled: isGerante,
  });

  //- mode reflète la vue actuellement affichée (gérante/créatrice) — sans
  //- effet pour un compte non-DUO, mais indispensable pour un DUO puisque
  //- duoMode ne se déduit jamais du rôle seul côté serveur
  const currentMode = isGerante ? "GERANTE" : "CREATRICE";

  // Params pour les queries stats selon le filtre choisi
  const statsParams: StatsParams =
    selectedFilter.type === "event"
      ? { evenementId: selectedFilter.id, mode: currentMode, mois: moisParam }
      : selectedFilter.type === "boutique"
        ? { boutiqueId: selectedFilter.id, mode: currentMode, mois: moisParam }
        : { mode: currentMode, mois: moisParam };

  const filterKey = (selectedFilter.type === "all"
    ? "all"
    : `${selectedFilter.type}:${selectedFilter.id}`) + `:${currentMode}`;
  const periodKey = `${filterKey}:${mois ?? "tout"}`;

  const { data: globalData } = useQuery({
    queryKey: ["stats-global", periodKey],
    queryFn: () => statsService.getGlobal(statsParams),
  });

  const { data: historiqueData } = useQuery({
    queryKey: ["stats-historique", filterKey],
    queryFn: () => statsService.getHistorique(statsParams),
    enabled: isPro,
  });

  const { data: topArticlesData } = useQuery({
    queryKey: ["stats-top-articles", periodKey],
    queryFn: () => statsService.getTopArticles(statsParams),
  });

  const { data: parCreatriceData } = useQuery({
    queryKey: ["stats-par-creatrice", currentMode, mois ?? "tout"],
    queryFn: () => statsService.getParCreatrice(currentMode, moisParam),
    enabled: isGerante,
  });

  // Données dérivées
  const paiements: any[] = globalData?.paiement ?? [];
  const especes = paiements.find((p) => p.modePaiement === "ESPECES");
  const carte = paiements.find((p) => p.modePaiement === "CARTE");
  const especesMontant: number = especes?._sum?.prixVente ?? 0;
  const carteMontant: number = carte?._sum?.prixVente ?? 0;
  const paiementsTotal = especesMontant + carteMontant;

  // KPI dérivés
  const currentCA: number = globalData?.stats?._sum?.prixVente ?? 0;
  const nbVentes: number = globalData?.stats?._count ?? 0;
  const totalCommissions: number = globalData?.totalCommissions ?? 0;
  const ticketMoyen: number = nbVentes > 0 ? currentCA / nbVentes : 0;
  const netCreatrice: number = currentCA - totalCommissions;
  const cretricesActives: number =
    (parCreatriceData as any[])?.filter((c: any) => c.nbVentes > 0).length ?? 0;

  // Évolution vs période précédente
  const previousCA: number = (globalData as any)?.previousPeriodCA ?? 0;
  const evolution: number | null =
    previousCA > 0 ? ((currentCA - previousCA) / previousCA) * 100 : null;

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
        <Text style={st.headerTitle}>Stats</Text>
        <View style={st.badgeWrap}>
          <Text style={st.badge}>
            {selectedFilter.type !== "all"
              ? `${selectedFilter.type === "event" ? "🎪" : "🏪"} ${selectedFilter.nom}`
              : isPro ? `${user?.plan} ✨` : "FREE"}
          </Text>
        </View>
        <Text style={st.headerSub}>
          {isPro ? periodeLabel : `Mois en cours · ${headerSubtitle}`}
        </Text>
        {isDuo && <DuoModeToggle variant="onLight" />}
      </Animated.View>

      {/* ── Filtre événements / boutiques ── */}
      {((mesEvenements && mesEvenements.length > 0) || (mesBoutiques && mesBoutiques.length > 0)) && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={st.pillsRow}
          style={st.pillsScroll}
        >
          <TouchableOpacity
            style={[st.pill, selectedFilter.type === "all" && st.pillActive]}
            onPress={() => setSelectedFilter({ type: "all" })}
            activeOpacity={0.75}
          >
            <Text style={[st.pillTxt, selectedFilter.type === "all" && st.pillTxtActive]}>
              Tout
            </Text>
          </TouchableOpacity>

          {mesBoutiques?.map((b: any) => {
            const active = selectedFilter.type === "boutique" && selectedFilter.id === b.id;
            return (
              <TouchableOpacity
                key={b.id}
                style={[st.pill, active && st.pillActive]}
                onPress={() => setSelectedFilter({ type: "boutique", id: b.id, nom: b.nom })}
                activeOpacity={0.75}
              >
                <Text style={[st.pillTxt, active && st.pillTxtActive]}>🏪 {b.nom}</Text>
              </TouchableOpacity>
            );
          })}

          {mesEvenements?.map((e: any) => {
            const active = selectedFilter.type === "event" && selectedFilter.id === e.id;
            return (
              <TouchableOpacity
                key={e.id}
                style={[st.pill, active && st.pillActive]}
                onPress={() => setSelectedFilter({ type: "event", id: e.id, nom: e.nom })}
                activeOpacity={0.75}
              >
                <Text style={[st.pillTxt, active && st.pillTxtActive]}>🎪 {e.nom}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <View style={st.body}>
        {/* ── 2. KPIs grille 2×2 ── */}
        <Text style={st.sectionTitle}>Résumé</Text>
        {isPro && <PeriodePicker value={mois} onChange={setMois} />}
        <View style={st.cardsGrid}>
          {/* Carte CA avec badge évolution */}
          <AnimCard key="ca" index={0} style={st.card}>
            <Text style={st.cardLabel}>
              {isGerante ? "CA boutique" : "Chiffre d'affaires"}
            </Text>
            <Text style={st.cardValue}>{round2(currentCA)} €</Text>
            {evolution !== null && (
              <Text
                style={evolution >= 0 ? st.evolutionUp : st.evolutionDown}
              >
                {evolution >= 0
                  ? `▲ +${evolution.toFixed(1)}%`
                  : `▼ ${evolution.toFixed(1)}%`}
              </Text>
            )}
          </AnimCard>

          {/* Ventes (CREATRICE) ou Créatrices actives (GERANTE) */}
          {isGerante ? (
            <AnimCard key="creatrice-actives" index={1} style={st.card}>
              <Text style={st.cardLabel}>Créatrices actives</Text>
              <Text style={st.cardValue}>{cretricesActives}</Text>
            </AnimCard>
          ) : (
            <AnimCard key="ventes" index={1} style={st.card}>
              <Text style={st.cardLabel}>Ventes</Text>
              <Text style={st.cardValue}>{nbVentes}</Text>
            </AnimCard>
          )}

          {/* Commissions reçues (GERANTE, vert) ou Net à percevoir (CREATRICE, vert) */}
          <AnimCard key="net" index={2} style={st.card}>
            <Text style={st.cardLabel}>
              {isGerante ? "Commissions reçues" : "Net à percevoir"}
            </Text>
            <Text style={st.cardValueGreen}>
              {isGerante ? round2(totalCommissions) : round2(netCreatrice)} €
            </Text>
          </AnimCard>

          {/* Ticket moyen */}
          <AnimCard key="ticket-moyen" index={3} style={st.card}>
            <Text style={st.cardLabel}>Ticket moyen</Text>
            <Text style={st.cardValue}>{round2(ticketMoyen)} €</Text>
          </AnimCard>
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

        {/* Détail des ventes de toutes les créatrices, mois par mois — vue gérante uniquement */}
        {isGerante && (
          <>
            <Text style={st.sectionTitle}>Ventes des créatrices</Text>
            <VentesExportButtons filenameBase="ventes-boutique" />
          </>
        )}
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

const st = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 56,
  },

  // ── Header crème — même DA que le web ──────────────────────────────────────
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    alignItems: "flex-start",
  },
  headerTitle: {
    color: Colors.text,
    fontFamily: Fonts.family.norwester,
    fontWeight: "800",
    fontSize: 30,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  badgeWrap: {
    backgroundColor: Colors.primaryTint,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 6,
  },
  badge: {
    color: Colors.primaryDark,
    fontFamily: Fonts.family.nowBold,
    fontSize: 11,
  },
  headerSub: {
    color: Colors.textLight,
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.xs,
  },

  // ── Filter pills (= components/Chip) ────────────────────────────────────────
  pillsScroll: {
    flexGrow: 0,
  },
  pillsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  pill: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  pillTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },
  pillTxtActive: {
    color: "#fff",
  },

  // ── Body ────────────────────────────────────────────────────────────────────
  body: {
    padding: 16,
  },

  sectionTitle: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800",
    fontSize: Fonts.sizes.lg,
    color: Colors.text,
    letterSpacing: -0.3,
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
    borderRadius: Radius.lg,
    padding: 16,
    width: "48.5%",
    ...shadows.sm,
  },
  cardLabel: {
    fontFamily: Fonts.family.nowBold,
    color: Colors.textLight,
    fontSize: 11,
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  cardValue: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800",
    color: Colors.primary,
    fontSize: Fonts.sizes.lg,
  },

  // ── Paiements ────────────────────────────────────────────────────────────────
  paiementsCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 8,
    gap: 14,
    ...shadows.sm,
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
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.md,
    color: Colors.primary,
  },

  // ── Barres de progression ────────────────────────────────────────────────────
  barTrack: {
    height: 6,
    backgroundColor: Colors.primaryTint,
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
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 8,
    ...shadows.sm,
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
    fontSize: 11,
    color: Colors.textLight,
    fontFamily: Fonts.family.nowRegular,
    marginTop: 6,
    textTransform: "capitalize",
  },

  // ── Articles ─────────────────────────────────────────────────────────────────
  articleRow: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 10,
    ...shadows.sm,
  },
  articleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  articleNom: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  articleCA: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.md,
    color: Colors.primary,
  },
  articleMeta: {
    fontFamily: Fonts.family.nowRegular,
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
    fontFamily: Fonts.family.nowBold,
    fontSize: 11,
    color: Colors.textLight,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "right",
  },
  tableRow: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    ...shadows.sm,
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
    fontFamily: Fonts.family.nowBold,
    textAlign: "left",
    color: Colors.text,
  },
  tableCellNet: {
    color: Colors.successDark,
    fontFamily: Fonts.family.nowBold,
  },

  // ── Export ───────────────────────────────────────────────────────────────────
  exportCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    overflow: "hidden",
    marginBottom: 8,
    ...shadows.sm,
  },
  exportBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  exportBtnLabel: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },
  exportBtnSub: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    marginTop: 1,
  },
  exportBtnArrow: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 18,
    color: Colors.text,
  },
  exportBtnLocked: {
    backgroundColor: Colors.surfaceHover,
    justifyContent: "space-between",
  },
  exportBtnLabelLocked: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
  },
  exportBtnLockedBadge: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 11,
    color: Colors.primaryDark,
    backgroundColor: Colors.primaryTint,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    overflow: "hidden",
  },

  // ── Locked / Empty ────────────────────────────────────────────────────────────
  lockedBox: {
    backgroundColor: Colors.primaryTint,
    borderRadius: Radius.lg,
    padding: 20,
    alignItems: "center",
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    borderStyle: "dashed",
  },
  lockedTxt: {
    fontFamily: Fonts.family.nowBold,
    color: Colors.primaryDark,
    fontSize: Fonts.sizes.sm,
    textAlign: "center",
    marginBottom: 6,
  },
  lockedDesc: {
    fontFamily: Fonts.family.nowRegular,
    color: Colors.textLight,
    fontSize: Fonts.sizes.xs,
    textAlign: "center",
    lineHeight: 18,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 20,
    marginBottom: 8,
  },
  emptyTxt: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
  },

  // ── Évolution & valeur verte ──────────────────────────────────────────────────
  evolutionUp: {
    color: Colors.successDark,
    fontFamily: Fonts.family.nowBold,
    fontSize: 11,
    marginTop: 2,
  },
  evolutionDown: {
    color: Colors.error,
    fontFamily: Fonts.family.nowBold,
    fontSize: 11,
    marginTop: 2,
  },
  cardValueGreen: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800",
    color: Colors.successDark,
    fontSize: Fonts.sizes.lg,
  },
});
