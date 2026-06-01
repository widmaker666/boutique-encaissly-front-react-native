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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { creatriceService } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
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
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " €";
}

// ─── Écran principal ─────────────────────────────────────────────────────────
export default function CreatriceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const isGerante = user?.role === "GERANTE";
  const queryClient = useQueryClient();

  const [modalModifier, setModalModifier] = useState(false);
  const [modalInviter, setModalInviter] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;

  const { data: creatrice, isLoading } = useQuery<CreatriceDetail>({
    queryKey: ["creatrice", id],
    queryFn: () => creatriceService.getOne(id),
    enabled: !!id,
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
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.75}
          >
            <Text style={styles.backTxt}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>FICHE CRÉATRICE</Text>
        </View>

        <View style={styles.headerCenter}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{initiales}</Text>
          </View>

          <Text style={styles.nom}>{creatrice.nom}</Text>

          {!!creatrice.email && (
            <Text style={styles.contactLine}>{creatrice.email}</Text>
          )}
          {!!creatrice.telephone && (
            <Text style={styles.contactLine}>{creatrice.telephone}</Text>
          )}

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
        {/* Stats 2×2 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>STATISTIQUES</Text>
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

        {/* Liste ventes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            VENTES ({creatrice.ventes.length})
          </Text>

          {creatrice.ventes.length === 0 && (
            <Text style={styles.emptyVentes}>Aucune vente enregistrée.</Text>
          )}

          {creatrice.ventes.map((vente: VenteDetail, i: number) => (
            <AnimCard key={vente.id} index={4 + i} style={styles.venteCard}>
              <View style={styles.venteLeft}>
                <Text style={styles.venteArticle} numberOfLines={1}>
                  {vente.nomArticle}
                </Text>
                <Text style={styles.venteDate}>{formatDateFR(vente.createdAt)}</Text>
              </View>

              <View style={styles.venteRight}>
                <Text style={styles.ventePrix}>
                  {formatMontant(vente.prixVente)}
                </Text>
                {vente.modePaiement === "ESPECES" ? (
                  <View style={styles.badgeEspeces}>
                    <Text style={styles.badgeEspecesTxt}>ESPECES</Text>
                  </View>
                ) : (
                  <View style={styles.badgeCarte}>
                    <Text style={styles.badgeCarteTxt}>CARTE</Text>
                  </View>
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
