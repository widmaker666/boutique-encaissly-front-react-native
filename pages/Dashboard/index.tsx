import { useRef, useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Animated, Alert } from "react-native";
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
import { MODE_LABEL } from "@/constants/paiement";
import { DuoModeToggle } from "@/components/DuoModeToggle";
import Card from "@/components/Cards/Card";
import ListRow from "@/components/List/ListRow";
import Badge from "@/components/Badge/Badge";
import Button from "@/components/Buttons/Button";
import Chip from "@/components/Chip/Chip";
import Field from "@/components/Inputs/Field";
import Avatar from "@/components/Avatar/Avatar";
import { Notice } from "@/components/Notice/Notice";

//- Carte animée avec délai selon l'index
function AnimCard({ children, index }: { children: React.ReactNode; index: number }) {
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
      style={{
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

const round2 = (n: number | null | undefined): string => (Math.round((n ?? 0) * 100) / 100).toFixed(2);

function VenteRow({ vente, showCreatrice }: { vente: any; showCreatrice: boolean }) {
  return (
    <ListRow
      left={
        <>
          <Text style={styles.rowTitle} numberOfLines={1}>{vente.nomArticle}</Text>
          {showCreatrice && <Text style={styles.rowMeta}>{vente.creatrice?.nom}</Text>}
        </>
      }
      right={
        <>
          <Text style={styles.rowValue}>{round2(vente.prixVente)} €</Text>
          <Badge color={vente.modePaiement === "CARTE" ? "info" : "warning"}>{MODE_LABEL[vente.modePaiement as keyof typeof MODE_LABEL] ?? vente.modePaiement}</Badge>
        </>
      }
    />
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const nav = useRouter();
  const user = useAuthStore((state) => state.user);
  const isDuo = user?.role === "GERANTE_CREATRICE";
  const duoMode = useAuthStore((state) => state.duoMode);
  const isGerante = user?.role === "GERANTE" || (isDuo && duoMode === "GERANTE");
  //- DUO débloque les mêmes fonctionnalités que PRO (c'est un plan payant à
  //- part entière, pas une variante de FREE) — jamais "plan === PRO" seul ici
  const isPro = user?.plan === "PRO" || user?.plan === "DUO";

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

  //- mode reflète la vue actuellement affichée (gérante/créatrice) — sans
  //- effet pour un compte non-DUO, mais indispensable pour un DUO puisque
  //- duoMode ne se déduit jamais du rôle seul côté serveur
  const currentMode = isGerante ? "GERANTE" : "CREATRICE";

  //- Stats globales — CREATRICE uniquement
  const { data, isLoading } = useQuery({
    queryKey: ["stats", activeEvenementId ?? "personal", currentMode],
    queryFn: () =>
      statsService.getGlobal({
        ...(activeEvenementId ? { evenementId: activeEvenementId } : {}),
        mode: currentMode,
      }),
    enabled: !isGerante,
  });

  const { data: recentVentes } = useQuery({
    queryKey: ["ventes-recent", activeEvenementId ?? "personal", currentMode],
    queryFn: () => venteService.getRecent(activeEvenementId ?? undefined, currentMode),
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
    Animated.timing(headerAnim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, []);

  //- Loading uniquement pour la CREATRICE (stats désactivées pour GERANTE)
  if (!isGerante && isLoading)
    return (
      <View style={[styles.container, { justifyContent: "center", padding: 20 }]}>
        <Notice>Chargement…</Notice>
      </View>
    );

  const especes = data?.paiement?.find((p: any) => p.modePaiement === "ESPECES");
  const carte = data?.paiement?.find((p: any) => p.modePaiement === "CARTE");
  const sectionTitle = activeEvenementId ? (activeEvenementNom ?? "Événement") : "Ce mois-ci";
  const boutiquesListe: any[] = boutiques ?? [];
  const nomAffiche = user?.prenom || user?.nom ? `${user?.prenom ?? ""} ${user?.nom ?? ""}`.trim() : "Bonjour";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header crème — même DA que le web */}
      <Animated.View
        style={[
          styles.header,
          { paddingTop: insets.top + 20 },
          {
            opacity: headerAnim,
            transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) }],
          },
        ]}
      >
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.eyebrow}>{isGerante ? "GÉRANTE" : "CRÉATRICE"}</Text>
            <Text style={styles.name} numberOfLines={2}>{nomAffiche}</Text>
          </View>
          <TouchableOpacity
            onPress={() => nav.push("/(app)/notifications")}
            style={styles.bellBtn}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Notifications${unreadCount > 0 ? `, ${unreadCount} non lues` : ""}`}
          >
            <AntDesign name="bell" size={20} color={Colors.text} />
            {unreadCount > 0 && (
              <View style={styles.bellBadge}>
                <Text style={styles.bellBadgeTxt}>{unreadCount > 99 ? "99+" : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.badgeRow}>
          <Badge color={user?.plan === "DUO" ? "warning" : isPro ? "success" : "neutral"} variant="solid">
            {user?.plan ?? "FREE"}
          </Badge>
        </View>

        {isDuo && <DuoModeToggle variant="onLight" />}

        {/* Chips sélecteur d'événement (CREATRICE avec au moins 1 événement) */}
        {!isGerante && events.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
            <Chip active={!activeEvenementId} onPress={() => setActiveEvenement(null, null)}>Personnel</Chip>
            {events.map((e: any) => (
              <Chip key={e.id} active={activeEvenementId === e.id} onPress={() => setActiveEvenement(e.id, e.nom)}>
                {e.nom}
              </Chip>
            ))}
          </ScrollView>
        )}
      </Animated.View>

      <View style={styles.body}>
        {/* ── GÉRANTE ── */}
        {isGerante && (
          <>
            <Text style={styles.sectionTitle}>Mes boutiques</Text>

            {boutiquesListe.length === 0 ? (
              <AnimCard index={0}>
                <Card style={styles.emptyCard}>
                  {!showCreateBoutique ? (
                    <>
                      <Text style={styles.emptyTxt}>Tu n'as pas encore de boutique.</Text>
                      <Button fullWidth onPress={() => setShowCreateBoutique(true)}>Créer ma première boutique</Button>
                    </>
                  ) : (
                    <>
                      <Field
                        label="Nom de la boutique"
                        value={boutiqueNomInput}
                        onChangeText={setBoutiqueNomInput}
                        placeholder="Ex. : Atelier Lumière"
                        autoFocus
                        returnKeyType="done"
                        onSubmitEditing={() => {
                          if (boutiqueNomInput.trim().length > 0) creerBoutique();
                        }}
                      />
                      <View style={styles.formRow}>
                        <Button
                          variant="secondary"
                          style={{ flex: 1 }}
                          onPress={() => {
                            setShowCreateBoutique(false);
                            setBoutiqueNomInput("");
                          }}
                        >
                          Annuler
                        </Button>
                        <Button
                          style={{ flex: 1 }}
                          disabled={boutiqueNomInput.trim().length === 0}
                          loading={isCreatingBoutique}
                          onPress={() => creerBoutique()}
                        >
                          Créer
                        </Button>
                      </View>
                    </>
                  )}
                </Card>
              </AnimCard>
            ) : (
              boutiquesListe.map((boutique: any, i: number) => (
                <AnimCard key={boutique.id} index={i}>
                  <ListRow
                    onPress={() => router.push(`/(app)/boutique/${boutique.id}?nom=${encodeURIComponent(boutique.nom)}`)}
                    accessibilityLabel={`Boutique ${boutique.nom}`}
                    left={
                      <View style={styles.rowLeftInline}>
                        <Avatar name={boutique.nom} size="sm" />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.rowTitle} numberOfLines={1}>{boutique.nom}</Text>
                          <Text style={styles.rowMeta}>
                            {boutique.nbCreatrices} créatrice{boutique.nbCreatrices !== 1 ? "s" : ""} · {round2(boutique.ca)} €
                          </Text>
                        </View>
                      </View>
                    }
                    right={<AntDesign name="right" size={14} color={Colors.textLight} />}
                  />
                </AnimCard>
              ))
            )}

            <Text style={styles.sectionTitle}>Dernières ventes</Text>
            {recentVentes?.length ? (
              recentVentes.map((vente: any, i: number) => (
                <AnimCard key={vente.id} index={i + 4}>
                  <VenteRow vente={vente} showCreatrice />
                </AnimCard>
              ))
            ) : (
              <Notice>Aucune vente pour l'instant.</Notice>
            )}
          </>
        )}

        {/* ── CREATRICE ── */}
        {!isGerante && (
          <>
            <AnimCard index={0}>
              <Card padding="sm">
                <Text style={styles.infoTxt}>
                  {activeEvenementId
                    ? `🎪 ${activeEvenementNom}`
                    : memberBoutiques.length > 0
                    ? `📊 Membre de ${memberBoutiques.length} boutique${memberBoutiques.length > 1 ? "s" : ""}`
                    : "📊 Ventes directes — hors boutique"}
                </Text>
              </Card>
            </AnimCard>

            {!isPro && (
              <Badge color="warning">
                {`📅 ${new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })} — mois en cours uniquement`}
              </Badge>
            )}

            {/* KPI : CA en carte hero sombre, le reste en support */}
            <Text style={styles.sectionTitle}>{sectionTitle}</Text>
            <AnimCard index={1}>
              <View style={styles.heroCard}>
                <Text style={styles.heroLabel}>CHIFFRE D'AFFAIRES</Text>
                <Text style={styles.heroValue}>{round2(data?.stats._sum.prixVente)} €</Text>
                <Text style={styles.heroSub}>dont {round2(data?.totalCommissions)} € de commissions</Text>
              </View>
            </AnimCard>
            <View style={styles.kpiRow}>
              {[
                { label: "VENTES", value: `${data?.stats._count ?? 0}` },
                { label: "MEILLEURE VENTE", value: `${round2(data?.stats._max.prixVente)} €` },
              ].map((item, i) => (
                <View key={item.label} style={styles.kpiCard}>
                  <AnimCard index={i + 2}>
                    <Card padding="sm">
                      <Text style={styles.kpiLabel}>{item.label}</Text>
                      <Text style={styles.kpiValue} numberOfLines={1} adjustsFontSizeToFit>{item.value}</Text>
                    </Card>
                  </AnimCard>
                </View>
              ))}
            </View>

            {/* Paiements */}
            <Text style={styles.sectionTitle}>Répartition paiements</Text>
            <View style={styles.kpiRow}>
              <View style={styles.kpiCard}>
                <Card padding="sm">
                  <Text style={styles.kpiLabel}>💵 Espèces</Text>
                  <Text style={styles.kpiValue}>{round2(especes?._sum?.prixVente)} €</Text>
                </Card>
              </View>
              <View style={styles.kpiCard}>
                <Card padding="sm">
                  <Text style={styles.kpiLabel}>💳 Carte</Text>
                  <Text style={styles.kpiValue}>{round2(carte?._sum?.prixVente)} €</Text>
                </Card>
              </View>
            </View>

            {/* Dernières ventes */}
            <Text style={styles.sectionTitle}>
              {activeEvenementId ? `Dernières ventes — ${activeEvenementNom}` : "Dernières ventes"}
            </Text>
            {recentVentes?.length ? (
              recentVentes.map((vente: any, i: number) => (
                <AnimCard key={vente.id} index={i + 8}>
                  <VenteRow vente={vente} showCreatrice={false} />
                </AnimCard>
              ))
            ) : (
              <Notice>Aucune vente pour l'instant.</Notice>
            )}

            {/* Historique PRO */}
            {isPro && historique && (
              <>
                <Text style={styles.sectionTitle}>Historique</Text>
                {historique.map((item: any, i: number) => (
                  <AnimCard key={item.mois} index={i + 13}>
                    <ListRow
                      left={<Text style={[styles.rowTitle, { textTransform: "capitalize" }]}>{item.mois}</Text>}
                      right={
                        <>
                          <Text style={styles.rowValue}>{round2(item.ca)} €</Text>
                          <Text style={styles.rowMeta}>{item.nbVentes} ventes</Text>
                        </>
                      }
                    />
                  </AnimCard>
                ))}
              </>
            )}

            {!isPro && (
              <AnimCard index={16}>
                <Card style={styles.lockedCard}>
                  <Text style={styles.lockedTxt}>🔒 Historique complet disponible en PRO</Text>
                  <Text style={styles.lockedDesc}>Accède à tout ton historique de ventes, sans limite de période.</Text>
                  <Button onPress={() => router.push("/(app)/profil")}>✨ Passer à PRO — 9€/mois</Button>
                </Card>
              </AnimCard>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}
