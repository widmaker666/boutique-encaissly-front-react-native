import { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  StyleSheet,
  Platform,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  boutiqueService,
  evenementService,
  notificationService,
  statsService,
  venteService,
} from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { styles } from "@/styles/pages/dashboard.style";
import { router, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { DuoModeToggle } from "@/components/DuoModeToggle";

//- Carte animée avec délai selon l'index
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
      pointerEvents="box-none"
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

const round2 = (n: number | null | undefined): string =>
  (Math.round((n ?? 0) * 100) / 100).toFixed(2);

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const nav = useRouter();
  const user = useAuthStore((state) => state.user);
  const isDuo = user?.role === "GERANTE_CREATRICE";
  const duoMode = useAuthStore((state) => state.duoMode);
  const isGerante = user?.role === "GERANTE" || (isDuo && duoMode === "GERANTE");
  const isPro = user?.plan === "PRO";

  const activeEvenementId = useAuthStore((state) => state.activeEvenementId);
  const activeEvenementNom = useAuthStore((state) => state.activeEvenementNom);
  const setActiveEvenement = useAuthStore((state) => state.setActiveEvenement);

  const headerAnim = useRef(new Animated.Value(0)).current;

  const queryClient = useQueryClient();
  const [showCreateBoutique, setShowCreateBoutique] = useState(false);
  const [boutiqueNomInput, setBoutiqueNomInput] = useState("");

  const { data: unreadData } = useQuery({
    queryKey: ["notifications-count"],
    queryFn: notificationService.getUnreadCount,
    refetchInterval: 30000,
  });
  const unreadCount: number = unreadData?.count ?? 0;

  //- Événements de la CREATRICE — pour les chips de contexte
  const { data: mesEvenements } = useQuery<any[]>({
    queryKey: ["mes-evenements"],
    queryFn: () => evenementService.getAll(),
    enabled: !isGerante,
  });

  //- Boutiques dont la CREATRICE est membre (invitée par une GERANTE)
  const { data: memberBoutiquesData } = useQuery<any[]>({
    queryKey: ["mes-boutiques"],
    queryFn: () => boutiqueService.getMesBoutiques(),
    enabled: !isGerante,
  });

  const events: any[] = mesEvenements ?? [];
  const memberBoutiques: any[] = memberBoutiquesData ?? [];

  //- Stats globales — CREATRICE uniquement
  const { data, isLoading } = useQuery({
    queryKey: ["stats", activeEvenementId ?? "personal"],
    queryFn: () => statsService.getGlobal(activeEvenementId ? { evenementId: activeEvenementId } : {}),
    enabled: !isGerante,
  });

  const { data: recentVentes } = useQuery({
    queryKey: ["ventes-recent", activeEvenementId ?? "personal"],
    queryFn: () => venteService.getRecent(activeEvenementId ?? undefined),
  });

  //- Historique mensuel — CREATRICE PRO uniquement
  const { data: historique } = useQuery({
    queryKey: ["historique", activeEvenementId ?? "personal"],
    queryFn: () => statsService.getHistorique(activeEvenementId ? { evenementId: activeEvenementId } : {}),
    enabled: isPro && !isGerante,
  });

  //- Boutiques de la GERANTE — tous plans
  const { data: boutiques } = useQuery({
    queryKey: ["boutiques"],
    queryFn: boutiqueService.getAvecStats,
    enabled: isGerante,
  });

  //- Mutation création boutique
  const { mutate: creerBoutique, isPending: isCreatingBoutique } = useMutation({
    mutationFn: () => boutiqueService.creerMaBoutique(boutiqueNomInput.trim()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boutiques"] });
      setShowCreateBoutique(false);
      setBoutiqueNomInput("");
    },
    onError: () => Alert.alert("Erreur", "Impossible de créer la boutique."),
  });

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, []);

  //- Loading uniquement pour la CREATRICE (stats désactivées pour GERANTE)
  if (!isGerante && isLoading)
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: "#7a7a7a", fontFamily: "Now-Light" }}>Chargement...</Text>
      </View>
    );

  const especes = data?.paiement?.find((p: any) => p.modePaiement === "ESPECES");
  const carte = data?.paiement?.find((p: any) => p.modePaiement === "CARTE");

  const sectionTitle = activeEvenementId ? (activeEvenementNom ?? "Événement") : "Ce mois-ci";

  const boutiquesListe: any[] = boutiques ?? [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header violet */}
      <Animated.View
        style={[
          styles.header,
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
        {/* Bouton cloche notifications */}
        <TouchableOpacity
          onPress={() => nav.push("/(app)/notifications")}
          style={dashStyles.bellBtn}
          activeOpacity={0.8}
        >
          <AntDesign name="bell" size={22} color="#fff" />
          {unreadCount > 0 && (
            <View style={dashStyles.bellBadge}>
              <Text style={dashStyles.bellBadgeTxt}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.name}>
          {user?.prenom || user?.nom
            ? `${user.prenom ?? ""} ${user.nom ?? ""}`.trim()
            : "Bonjour"}
        </Text>
        <Text style={styles.greeting}>{user?.email}</Text>
        <View style={styles.badgeWrap}>
          <Text style={styles.badge}>
            {user?.role} · {user?.plan} {isPro ? "✨" : "🔒"}
          </Text>
        </View>

        {isDuo && <DuoModeToggle />}

        {/* Chips sélecteur d'événement (CREATRICE avec au moins 1 événement) */}
        {!isGerante && events.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginTop: 14 }}
            contentContainerStyle={{ gap: 8, paddingHorizontal: 2 }}
          >
            <TouchableOpacity
              style={[dashStyles.chip, !activeEvenementId && dashStyles.chipActive]}
              onPress={() => setActiveEvenement(null, null)}
              activeOpacity={0.75}
            >
              <Text style={[dashStyles.chipTxt, !activeEvenementId && dashStyles.chipTxtActive]}>
                Personnel
              </Text>
            </TouchableOpacity>
            {events.map((e: any) => (
              <TouchableOpacity
                key={e.id}
                style={[dashStyles.chip, activeEvenementId === e.id && dashStyles.chipActive]}
                onPress={() => setActiveEvenement(e.id, e.nom)}
                activeOpacity={0.75}
              >
                <Text
                  style={[
                    dashStyles.chipTxt,
                    activeEvenementId === e.id && dashStyles.chipTxtActive,
                  ]}
                >
                  {e.nom}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </Animated.View>

      <View style={styles.body}>
        {/* ── GÉRANTE ──────────────────────────────────── */}
        {isGerante && (
          <>
            <Text style={styles.sectionTitle}>Mes boutiques</Text>

            {boutiquesListe.length === 0 ? (
              <AnimCard index={0} style={dashStyles.emptyBoutiqueCard}>
                {!showCreateBoutique ? (
                  <>
                    <Text style={dashStyles.emptyBoutiqueTxt}>
                      Vous n'avez pas encore de boutique.
                    </Text>
                    <TouchableOpacity
                      style={[dashStyles.createBtn, { flex: 0, paddingHorizontal: 24 }]}
                      activeOpacity={0.85}
                      onPress={() => setShowCreateBoutique(true)}
                    >
                      <Text style={dashStyles.createBtnTxt}>Créer ma première boutique</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <Text style={dashStyles.emptyBoutiqueTxt}>Nom de la boutique</Text>
                    <TextInput
                      style={dashStyles.input}
                      value={boutiqueNomInput}
                      onChangeText={setBoutiqueNomInput}
                      placeholder="Ex. : Atelier Lumière"
                      placeholderTextColor={Colors.textLight}
                      autoFocus
                      returnKeyType="done"
                      onSubmitEditing={() => {
                        if (boutiqueNomInput.trim().length > 0) creerBoutique();
                      }}
                    />
                    <View style={dashStyles.createRow}>
                      <TouchableOpacity
                        style={dashStyles.cancelBtn}
                        activeOpacity={0.75}
                        onPress={() => {
                          setShowCreateBoutique(false);
                          setBoutiqueNomInput("");
                        }}
                      >
                        <Text style={dashStyles.cancelBtnTxt}>Annuler</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          dashStyles.createBtn,
                          (boutiqueNomInput.trim().length === 0 || isCreatingBoutique) &&
                            dashStyles.createBtnDisabled,
                        ]}
                        activeOpacity={0.85}
                        disabled={boutiqueNomInput.trim().length === 0 || isCreatingBoutique}
                        onPress={() => creerBoutique()}
                      >
                        {isCreatingBoutique ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={dashStyles.createBtnTxt}>Créer</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </AnimCard>
            ) : (
              boutiquesListe.map((boutique: any, i: number) => (
                <AnimCard key={boutique.id} index={i} style={styles.boutiqueRow}>
                  <TouchableOpacity
                    onPress={() =>
                      router.push(
                        `/(app)/boutique/${boutique.id}?nom=${encodeURIComponent(boutique.nom)}`
                      )
                    }
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                    activeOpacity={0.75}
                  >
                    <View>
                      <Text style={styles.boutiqueName}>{boutique.nom}</Text>
                      <Text style={styles.boutiqueMeta}>
                        {boutique.nbCreatrices} créatrice
                        {boutique.nbCreatrices !== 1 ? "s" : ""} · {round2(boutique.ca)} €
                      </Text>
                    </View>
                    <Text style={styles.boutiqueArrow}>›</Text>
                  </TouchableOpacity>
                </AnimCard>
              ))
            )}

            <Text style={styles.sectionTitle}>Dernières ventes</Text>
            {recentVentes?.map((vente: any, i: number) => (
              <AnimCard key={vente.id} index={i + 4} style={styles.venteRow}>
                <View>
                  <Text style={styles.venteName}>{vente.nomArticle}</Text>
                  <Text style={styles.venteMeta}>
                    {vente.creatrice.nom} · {vente.modePaiement}
                  </Text>
                </View>
                <Text style={styles.ventePrice}>{round2(vente.prixVente)} €</Text>
              </AnimCard>
            ))}
          </>
        )}

        {/* ── CREATRICE ─────────────────────────────────── */}
        {!isGerante && (
          <>
            <AnimCard index={0} style={styles.infoBox}>
              <Text style={styles.infoTxt}>
                {activeEvenementId
                  ? `🎪 ${activeEvenementNom}`
                  : memberBoutiques.length > 0
                  ? `📊 Membre de ${memberBoutiques.length} boutique${
                      memberBoutiques.length > 1 ? "s" : ""
                    }`
                  : "📊 Ventes directes — hors boutique"}
              </Text>
            </AnimCard>

            {!isPro && (
              <AnimCard index={1} style={styles.moisBadge}>
                <Text style={styles.moisTxt}>
                  📅{" "}
                  {new Date().toLocaleDateString("fr-FR", {
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  — mois en cours uniquement
                </Text>
              </AnimCard>
            )}

            {/* KPIs */}
            <Text style={styles.sectionTitle}>{sectionTitle}</Text>
            <View style={styles.cardsGrid}>
              {[
                {
                  label: "Chiffre d'affaires",
                  value: `${round2(data?.stats._sum.prixVente)} €`,
                },
                { label: "Ventes", value: `${data?.stats._count ?? 0}` },
                { label: "Commissions", value: `${round2(data?.totalCommissions)} €` },
                { label: "Meilleure vente", value: `${round2(data?.stats._max.prixVente)} €` },
              ].map((item, i) => (
                <AnimCard key={item.label} index={i + 1} style={styles.card}>
                  <Text style={styles.cardLabel}>{item.label}</Text>
                  <Text style={styles.cardValue}>{item.value}</Text>
                </AnimCard>
              ))}
            </View>

            {/* Paiements */}
            <Text style={styles.sectionTitle}>Répartition paiements</Text>
            <View style={styles.paiementRow}>
              <AnimCard index={6} style={styles.paiementCard}>
                <Text style={styles.cardLabel}>💵 Espèces</Text>
                <Text style={styles.cardValue}>{round2(especes?._sum?.prixVente)} €</Text>
              </AnimCard>
              <AnimCard index={7} style={styles.paiementCard}>
                <Text style={styles.cardLabel}>💳 Carte</Text>
                <Text style={styles.cardValue}>{round2(carte?._sum?.prixVente)} €</Text>
              </AnimCard>
            </View>

            {/* Dernières ventes */}
            <Text style={styles.sectionTitle}>
              {activeEvenementId
                ? `Dernières ventes — ${activeEvenementNom}`
                : "Dernières ventes"}
            </Text>
            {recentVentes?.map((vente: any, i: number) => (
              <AnimCard key={vente.id} index={i + 8} style={styles.venteRow}>
                <View>
                  <Text style={styles.venteName}>{vente.nomArticle}</Text>
                  <Text style={styles.venteMeta}>
                    {vente.creatrice.nom} · {vente.modePaiement}
                  </Text>
                </View>
                <Text style={styles.ventePrice}>{round2(vente.prixVente)} €</Text>
              </AnimCard>
            ))}

            {/* Historique PRO */}
            {isPro && historique && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Historique</Text>
                {historique.map((item: any, i: number) => (
                  <AnimCard key={item.mois} index={i + 13} style={styles.historiqueRow}>
                    <Text style={styles.historiqueMois}>{item.mois}</Text>
                    <View style={styles.historiqueRight}>
                      <Text style={styles.historiqueCA}>{round2(item.ca)} €</Text>
                      <Text style={styles.historiqueNb}>{item.nbVentes} ventes</Text>
                    </View>
                  </AnimCard>
                ))}
              </>
            )}

            {!isPro && (
              <AnimCard index={16} style={styles.lockedBox}>
                <Text style={styles.lockedTxt}>🔒 Historique complet disponible en PRO</Text>
                <Text style={styles.lockedDesc}>
                  Accédez à tout votre historique de ventes, sans limite de période.
                </Text>
                <TouchableOpacity
                  style={styles.upgradeBtn}
                  activeOpacity={0.85}
                  onPress={() => router.push("/(app)/profil")}
                >
                  <Text style={styles.upgradeTxt}>✨ Passer à PRO — 9€/mois</Text>
                </TouchableOpacity>
              </AnimCard>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

// ── Styles locaux Dashboard ───────────────────────────────────────────────────

const dashStyles = StyleSheet.create({
  bellBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    padding: 4,
    zIndex: 10,
  },
  bellBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#e53935",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  bellBadgeTxt: {
    fontFamily: "Now-Bold",
    fontSize: 9,
    color: "#fff",
    lineHeight: Platform.OS === "android" ? 14 : undefined,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.6)",
    backgroundColor: "transparent",
  },
  chipActive: {
    backgroundColor: "#fff",
    borderColor: "#fff",
  },
  chipTxt: {
    fontFamily: "Now-Medium",
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
  },
  chipTxtActive: {
    color: "#7a41bb",
  },

  // ── GÉRANTE — carte vide + création boutique ─────────────────────────────
  emptyBoutiqueCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 20,
    marginBottom: 8,
    alignItems: "center",
    shadowColor: "#7a41bb",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyBoutiqueTxt: {
    fontFamily: Fonts.family.nowLight,
    color: Colors.textLight,
    fontSize: 13,
    marginBottom: 14,
    textAlign: "center",
  },
  input: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: Colors.primaryLight + "80",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "android" ? 8 : 11,
    fontFamily: Fonts.family.nowRegular,
    fontSize: 14,
    color: Colors.text,
    backgroundColor: "#fff",
    marginBottom: 12,
  },
  createRow: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight + "80",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
  },
  cancelBtnTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: 13,
    color: Colors.textLight,
  },
  createBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  createBtnDisabled: {
    opacity: 0.5,
  },
  createBtnTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: 13,
    color: "#fff",
    letterSpacing: 0.2,
  },
});
