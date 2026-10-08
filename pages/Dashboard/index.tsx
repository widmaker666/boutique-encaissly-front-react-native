import { useRef, useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Animated, Alert, StyleSheet } from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { boutiqueService, statsService, venteService } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { styles } from "@/styles/pages/dashboard.style";
import { router } from "expo-router";
import { AntDesign } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Radius } from "@/constants/spacing";
import { MODE_LABEL } from "@/constants/paiement";
import KpiCards from "@/components/KpiCards";
import Card from "@/components/Cards/Card";
import ListRow from "@/components/List/ListRow";
import Badge from "@/components/Badge/Badge";
import Button from "@/components/Buttons/Button";
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

/** "2026-10" — le mois en cours, au format attendu par l'API stats. */
function moisCourant() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function DashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const isDuo = user?.role === "GERANTE_CREATRICE";
  const duoMode = useAuthStore((state) => state.duoMode);
  const isGerante = user?.role === "GERANTE" || (isDuo && duoMode === "GERANTE");

  const activeEvenementId = useAuthStore((state) => state.activeEvenementId);
  const activeEvenementNom = useAuthStore((state) => state.activeEvenementNom);

  const queryClient = useQueryClient();
  const [showCreateBoutique, setShowCreateBoutique] = useState(false);
  const [boutiqueNomInput, setBoutiqueNomInput] = useState("");

  //- mode reflète la vue actuellement affichée (gérante/créatrice) — sans
  //- effet pour un compte non-DUO, mais indispensable pour un DUO puisque
  //- duoMode ne se déduit jamais du rôle seul côté serveur
  const currentMode = isGerante ? "GERANTE" : "CREATRICE";
  const mois = moisCourant();

  //- Chiffres du mois en cours (FREE : le serveur impose déjà le mois en cours)
  const { data: statsMois } = useQuery({
    queryKey: ["stats-global", `accueil:${currentMode}:${mois}`],
    queryFn: () => statsService.getGlobal({ mode: currentMode, mois }),
  });

  const { data: parCreatrice } = useQuery<{ nbVentes: number }[]>({
    queryKey: ["stats-par-creatrice", currentMode, mois],
    queryFn: () => statsService.getParCreatrice(currentMode, mois),
    enabled: isGerante,
  });

  const { data: recentVentes } = useQuery({
    queryKey: ["ventes-recent", "personal", currentMode],
    queryFn: () => venteService.getRecent(undefined, currentMode),
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

  const boutiquesListe: any[] = boutiques ?? [];
  const nomAffiche = user?.prenom || user?.nom ? `${user?.prenom ?? ""} ${user?.nom ?? ""}`.trim() : "Bonjour";
  const periode = (() => {
    const t = new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    return t.charAt(0).toUpperCase() + t.slice(1);
  })();
  //- Une créatrice ne peut vendre que dans un événement actif ; une gérante toujours
  const canSell = isGerante || !!activeEvenementId;

  const openNouvelleVente = () => router.push("/(app)/ventes?nouvelle=1");
  const openEvenements = () => router.push("/(app)/creatrice");

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingBottom: 96 }]}>
        <View style={[styles.header, { paddingTop: 20 }]}>
          <Text style={styles.name} numberOfLines={2}>{nomAffiche}</Text>
          <Text style={local.sub}>
            {periode}
            {isGerante && boutiquesListe.length === 1 ? ` · ${boutiquesListe[0].nom}` : ""}
          </Text>
        </View>

        <View style={styles.body}>
          {/* Créatrice : événement actif en violet, ou invitation à en choisir un */}
          {!isGerante &&
            (activeEvenementId ? (
              <View style={local.banner}>
                <Text style={local.bannerTitle}>Événement actif : {activeEvenementNom}</Text>
                <Text style={local.bannerSub}>Les nouvelles ventes sont enregistrées dans cet événement.</Text>
                <View style={local.bannerBtns}>
                  <TouchableOpacity style={local.bannerBtnSec} onPress={openEvenements} activeOpacity={0.8} accessibilityRole="button">
                    <Text style={local.bannerBtnSecTxt}>Changer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={local.bannerBtn} onPress={openNouvelleVente} activeOpacity={0.8} accessibilityRole="button">
                    <Text style={local.bannerBtnTxt}>+ Ajouter une vente</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <Card style={{ gap: 10 }}>
                <Text style={local.noEventTitle}>Aucun événement actif</Text>
                <Text style={local.noEventSub}>Active ou crée un événement pour pouvoir enregistrer des ventes.</Text>
                <Button onPress={openEvenements}>Choisir un événement</Button>
              </Card>
            ))}

          <View style={{ marginTop: 14 }}>
            <KpiCards
              gerante={isGerante}
              ca={statsMois?.stats?._sum?.prixVente ?? 0}
              nbVentes={statsMois?.stats?._count ?? 0}
              totalCommissions={statsMois?.totalCommissions ?? 0}
              previousCA={statsMois?.previousPeriodCA ?? 0}
              creatricesActives={(parCreatrice ?? []).filter((c) => c.nbVentes > 0).length}
            />
          </View>

          {/* ── GÉRANTE : boutiques ── */}
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
                              {boutique.nbCreatrices} créatrice{boutique.nbCreatrices !== 1 ? "s" : ""} · {round2(boutique.ca)} € au total
                            </Text>
                          </View>
                        </View>
                      }
                      right={<AntDesign name="right" size={14} color={Colors.textLight} />}
                    />
                  </AnimCard>
                ))
              )}
            </>
          )}

          {/* ── Dernières ventes (les deux vues) ── */}
          <Text style={styles.sectionTitle}>Dernières ventes</Text>
          {recentVentes?.length ? (
            recentVentes.map((vente: any, i: number) => (
              <AnimCard key={vente.id} index={i + 2}>
                <VenteRow vente={vente} showCreatrice={isGerante} />
              </AnimCard>
            ))
          ) : (
            <Notice>Aucune vente pour l'instant.</Notice>
          )}
        </View>
      </ScrollView>

      {/* Bouton flottant « + Vente » : gérante toujours, créatrice avec un événement actif */}
      {canSell && (
        <TouchableOpacity
          style={local.fab}
          onPress={openNouvelleVente}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Ajouter une vente"
        >
          <Text style={local.fabTxt}>+ Vente</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const local = StyleSheet.create({
  sub: { fontFamily: Fonts.family.nowRegular, fontSize: Fonts.sizes.sm, color: Colors.textLight, marginTop: 4 },
  banner: { backgroundColor: Colors.primary, borderRadius: Radius.lg, padding: 16, gap: 4 },
  bannerTitle: { fontFamily: Fonts.family.nowBold, fontSize: Fonts.sizes.md, color: "#fff" },
  bannerSub: { fontFamily: Fonts.family.nowRegular, fontSize: Fonts.sizes.xs, color: "rgba(255,255,255,0.85)" },
  bannerBtns: { flexDirection: "row", gap: 8, marginTop: 10 },
  bannerBtn: { flex: 1, backgroundColor: "#fff", borderRadius: Radius.md, minHeight: 40, alignItems: "center", justifyContent: "center" },
  bannerBtnTxt: { fontFamily: Fonts.family.nowBold, fontSize: Fonts.sizes.sm, color: Colors.primaryDark },
  bannerBtnSec: { borderRadius: Radius.md, minHeight: 40, paddingHorizontal: 16, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.55)" },
  bannerBtnSecTxt: { fontFamily: Fonts.family.nowMedium, fontSize: Fonts.sizes.sm, color: "#fff" },
  noEventTitle: { fontFamily: Fonts.family.nowBold, fontSize: Fonts.sizes.md, color: Colors.text },
  noEventSub: { fontFamily: Fonts.family.nowRegular, fontSize: Fonts.sizes.sm, color: Colors.textLight },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: Colors.primary,
    borderRadius: Radius.pill,
    paddingHorizontal: 20,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primaryDark,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  fabTxt: { fontFamily: Fonts.family.nowBold, fontSize: Fonts.sizes.sm, color: "#fff" },
});
