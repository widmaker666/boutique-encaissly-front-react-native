import { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
} from "react-native";
import ModalModifier from "@/components/Creatrice/ModalModifier";
import ModalInviter from "@/components/Creatrice/ModalInviter";
import { useLocalSearchParams, useRouter } from "expo-router";
import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import PeriodePicker, { formatPeriode } from "@/components/PeriodePicker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { creatriceService } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import type { CreatriceDetail, VenteDetail } from "@/types";
import { styles } from "@/styles/pages/creatriceDetail.style";

// ─── AnimCard ────────────────────────────────────────────────────────────────
function AnimCard({
  children,
  index,
  style,
}: {
  children: React.ReactNode;
  index: number;
  style?: object;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 320,
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

// ─── Groupement ventes ────────────────────────────────────────────────────────
function groupVentes(ventes: VenteDetail[]): (VenteDetail & { quantite: number })[] {
  const map = new Map<string, VenteDetail & { quantite: number }>();
  for (const v of ventes) {
    const key = `${v.nomArticle}-${v.modePaiement}`;
    if (map.has(key)) {
      const g = map.get(key)!;
      g.quantite = g.quantite + ((v as any).quantite ?? 1);
      g.prixVente += v.prixVente;
    } else {
      map.set(key, { ...v, quantite: (v as any).quantite ?? 1 });
    }
  }
  return Array.from(map.values());
}

// ─── Formateur date FR ────────────────────────────────────────────────────────
function formatDateFR(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// ─── Formateur montant ────────────────────────────────────────────────────────
function formatMontant(n: number): string {
  const rounded = Math.round(n * 100) / 100;
  return rounded.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

// ─── Écran principal ─────────────────────────────────────────────────────────
export default function CreatriceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const isGerante = user?.role === "GERANTE" || user?.role === "GERANTE_CREATRICE";
  // Vue gérante réellement active (un compte DUO peut être en vue créatrice) :
  // l'export des ventes d'une créatrice n'a de sens que côté gérante
  const duoMode = useAuthStore((state) => state.duoMode);
  const isGeranteView =
    user?.role === "GERANTE" || (user?.role === "GERANTE_CREATRICE" && duoMode === "GERANTE");
  const queryClient = useQueryClient();

  const [modalModifier, setModalModifier] = useState(false);
  const [modalInviter, setModalInviter] = useState(false);
  // Période affichée (stats + ventes) : null = tous les mois, sinon "YYYY-MM" — PRO/DUO
  const isPro = user?.plan === "PRO" || user?.plan === "DUO";
  const [mois, setMois] = useState<string | null>(null);

  const headerAnim = useRef(new Animated.Value(0)).current;

  const { data: creatrice, isLoading } = useQuery<CreatriceDetail>({
    queryKey: ["creatrice", id, mois],
    queryFn: () => creatriceService.getOne(id, mois ?? undefined),
    enabled: !!id,
    // Garde la fiche affichée pendant le chargement d'un autre mois (sinon l'écran clignote)
    placeholderData: keepPreviousData,
  });

  const { mutate: supprimerCreatrice, isPending: isDeleting } = useMutation({
    mutationFn: () => creatriceService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creatrices"] });
      router.back();
    },
    onError: () => {
      Alert.alert("Erreur", "Impossible de supprimer la créatrice.");
    },
  });

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSupprimer = () => {
    Alert.alert(
      "Supprimer",
      `Supprimer ${creatrice?.nom ?? "cette créatrice"} ? Cette action est irréversible.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => supprimerCreatrice(),
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (!creatrice) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Créatrice introuvable.</Text>
      </View>
    );
  }

  const initiales = creatrice.nom.substring(0, 2).toUpperCase();

  return (
    <View style={styles.container}>
      {/* ── HEADER ── */}
      <Animated.View
        style={[
          styles.header,
          { paddingTop: insets.top + 12 },
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
        <View style={styles.headerTop}>
          {isGerante ? (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              activeOpacity={0.75}
            >
              <Text style={styles.backTxt}>‹</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backBtn} />
          )}
          <Text style={styles.headerTitle}>
            {isGerante ? "FICHE CRÉATRICE" : "MA FICHE"}
          </Text>
        </View>

        <View style={styles.headerCenter}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{initiales}</Text>
          </View>

          <Text style={styles.nom}>{creatrice.nom}</Text>

          <View style={styles.commissionBadge}>
            <Text style={styles.commissionTxt}>
              {creatrice.tauxDeCommission}% de commission
            </Text>
          </View>
        </View>
      </Animated.View>

      {/* ── SCROLL ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Stats globales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          {isPro && <PeriodePicker value={mois} onChange={setMois} />}
          <View style={styles.statsGrid}>
            {[
              { label: "Chiffre d'affaires", value: formatMontant(creatrice.stats.ca) },
              { label: "Nombre de ventes", value: String(creatrice.stats.nbVentes) },
              { label: "Commission totale", value: formatMontant(creatrice.stats.totalCommission) },
              { label: "Net créatrice", value: formatMontant(creatrice.stats.netCreatrice) },
            ].map((stat, i) => (
              <AnimCard key={stat.label} index={i} style={styles.statCard}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </AnimCard>
            ))}
          </View>
        </View>

        {/* Bouton Catalogue */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.catalogueBtn}
            activeOpacity={0.85}
            onPress={() =>
              router.push(
                `/(app)/creatrice/articles?creatriceId=${creatrice.id}&nomCreatrice=${encodeURIComponent(creatrice.nom)}`,
              )
            }
          >
            <Text style={styles.catalogueBtnTxt}>Voir les articles</Text>
            <Text style={styles.catalogueBtnArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Export des ventes de cette créatrice — écran Documents, déjà réglé sur elle (vue gérante) */}
        {isGeranteView && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Documents</Text>
            <TouchableOpacity
              onPress={() => router.push(`/(app)/documents?creatriceId=${creatrice.id}`)}
              activeOpacity={0.8}
              accessibilityRole="button"
            >
              <Text style={{ fontFamily: Fonts.family.nowMedium, fontSize: Fonts.sizes.sm, color: Colors.primary }}>Récupérer ses ventes (PDF, Excel, CSV) →</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Ventes globales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Ventes ({creatrice.ventes.length}){mois ? ` — ${formatPeriode(mois)}` : ""}
          </Text>
          {creatrice.ventes.length === 0 && (
            <Text style={styles.emptyVentes}>
              {mois ? `Aucune vente en ${formatPeriode(mois)}.` : "Aucune vente enregistrée."}
            </Text>
          )}
          {groupVentes(creatrice.ventes).map((vente, i) => (
            <AnimCard key={vente.id} index={4 + i} style={styles.venteCard}>
              <View style={styles.venteLeft}>
                <Text style={styles.venteArticle} numberOfLines={1}>
                  {vente.nomArticle}{vente.quantite > 1 ? `  × ${vente.quantite}` : ""}
                </Text>
                <Text style={styles.venteDate}>{formatDateFR(vente.createdAt)}</Text>
              </View>
              <View style={styles.venteRight}>
                <Text style={styles.ventePrix}>{formatMontant(vente.prixVente)}</Text>
                {vente.modePaiement === "ESPECES" ? (
                  <View style={styles.badgeEspeces}><Text style={styles.badgeEspecesTxt}>Espèces</Text></View>
                ) : (
                  <View style={styles.badgeCarte}><Text style={styles.badgeCarteTxt}>Carte</Text></View>
                )}
              </View>
            </AnimCard>
          ))}
        </View>
      </ScrollView>

      {/* ── ACTIONS GERANTE ── */}
      {isGerante && (
        <View style={[styles.actionsBar, { paddingBottom: insets.bottom + 12 }]}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.btnModifier]}
            activeOpacity={0.85}
            onPress={() => setModalModifier(true)}
          >
            <Text style={styles.btnModifierTxt}>Modifier</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.btnSupprimer]}
            activeOpacity={0.85}
            onPress={handleSupprimer}
            disabled={isDeleting}
          >
            <Text style={styles.btnSupprimerTxt}>
              {isDeleting ? "..." : "Supprimer"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.btnInviter]}
            activeOpacity={0.85}
            onPress={() => setModalInviter(true)}
          >
            <Text style={styles.btnInviterTxt}>Inviter</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ── MODALS ── */}
      {isGerante && creatrice && (
        <ModalModifier
          visible={modalModifier}
          onClose={() => setModalModifier(false)}
          creatrice={creatrice}
        />
      )}
      <ModalInviter
        visible={modalInviter}
        onClose={() => setModalInviter(false)}
        creatriceId={id}
      />
    </View>
  );
}
