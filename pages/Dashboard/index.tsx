import { useRef, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Animated } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { boutiqueService, statsService, venteService } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { styles } from "@/styles/pages/dashboard.style";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const isGerante = user?.role === "GERANTE";
  const isPro = user?.plan === "PRO";

  const headerAnim = useRef(new Animated.Value(0)).current;

  const { data, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: statsService.getGlobal,
  });

  const { data: recentVentes } = useQuery({
    queryKey: ["ventes-recent"],
    queryFn: venteService.getRecent,
  });

  const { data: boutiqueStats } = useQuery({
    queryKey: ["boutique-stats"],
    queryFn: boutiqueService.getStats,
    enabled: isGerante,
  });

  const { data: historique } = useQuery({
    queryKey: ["historique"],
    queryFn: statsService.getHistorique,
    enabled: isPro,
  });

  const { data: boutiques } = useQuery({
    queryKey: ["boutiques"],
    queryFn: boutiqueService.getAvecStats,
    enabled: isGerante && isPro,
  });

  const { data: mesBoutiques } = useQuery({
    queryKey: ["mes-boutiques-count"],
    queryFn: boutiqueService.getNbBoutiques,
    enabled: !isGerante,
  });

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, []);

  if (isLoading)
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: "#7a7a7a", fontFamily: "Now-Light" }}>Chargement...</Text>
      </View>
    );

  //- Récupère les montants espèces et carte depuis le tableau paiement
  const especes = data?.paiement?.find(
    (p: any) => p.modePaiement === "ESPECES",
  );
  const carte = data?.paiement?.find((p: any) => p.modePaiement === "CARTE");

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
        <Text style={styles.greeting}>Bonjour 👋</Text>
        <Text style={styles.name}>
          {user?.prenom && user?.nom
            ? `${user.prenom} ${user.nom}`
            : user?.email}
        </Text>
        <View style={styles.badgeWrap}>
          <Text style={styles.badge}>
            {user?.role} · {user?.plan} {isPro ? "✨" : "🔒"}
          </Text>
        </View>
      </Animated.View>

      <View style={styles.body}>
        {/* Info boutique */}
        {!isGerante && (
          <AnimCard index={0} style={styles.infoBox}>
            <Text style={styles.infoTxt}>
              📊{" "}
              {mesBoutiques?.nbBoutiques > 0
                ? `Membre de ${mesBoutiques.nbBoutiques} boutique${mesBoutiques.nbBoutiques > 1 ? "s" : ""}`
                : "Ventes directes — hors boutique"}
            </Text>
          </AnimCard>
        )}

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

        {isGerante && (
          <AnimCard index={0} style={styles.infoBox}>
            <Text style={styles.infoTxt}>
              🏪{" "}
              {isPro
                ? "Multi-boutiques · Stats avancées · Historique complet"
                : "1 boutique · 3 créatrices max"}
            </Text>
          </AnimCard>
        )}

        {isGerante && !isPro && (
          <AnimCard index={2} style={styles.lockedBox}>
            <Text style={styles.lockedTxt}>🏪 Gérez plusieurs boutiques en PRO</Text>
            <Text style={styles.lockedDesc}>
              Créez plusieurs boutiques et consultez les stats de chacune séparément.
            </Text>
            <TouchableOpacity style={styles.upgradeBtn} activeOpacity={0.85}>
              <Text style={styles.upgradeTxt}>✨ Passer à PRO — 9€/mois</Text>
            </TouchableOpacity>
          </AnimCard>
        )}

        {/* Boutiques PRO */}
        {isGerante && isPro && boutiques && (
          <>
            <Text style={styles.sectionTitle}>Mes boutiques</Text>
            {boutiques.map((boutique: any, i: number) => (
              <AnimCard key={boutique.id} index={i} style={styles.boutiqueRow}>
                <TouchableOpacity
                  onPress={() => router.push(`/(app)/boutique/${boutique.id}`)}
                  style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
                  activeOpacity={0.75}
                >
                  <View>
                    <Text style={styles.boutiqueName}>{boutique.nom}</Text>
                    <Text style={styles.boutiqueMeta}>
                      {boutique.nbCreatrices} créatrices · {boutique.ca} €
                    </Text>
                  </View>
                  <Text style={styles.boutiqueArrow}>›</Text>
                </TouchableOpacity>
              </AnimCard>
            ))}
          </>
        )}

        {/* KPIs */}
        <Text style={styles.sectionTitle}>Ce mois-ci</Text>
        <View style={styles.cardsGrid}>
          {[
            { label: "Chiffre d'affaires", value: `${data?.stats._sum.prixVente ?? 0} €` },
            { label: "Ventes", value: `${data?.stats._count ?? 0}` },
            { label: "Commissions", value: `${data?.totalCommissions?.toFixed(2) ?? 0} €` },
            { label: "Meilleure vente", value: `${data?.stats._max.prixVente ?? 0} €` },
            ...(isGerante && !isPro
              ? [{ label: "Créatrices", value: `${boutiqueStats?.nbCreatrices ?? 0}/${boutiqueStats?.maxCreatrices ?? 3}` }]
              : []),
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
            <Text style={styles.cardValue}>{especes?._sum?.prixVente ?? 0} €</Text>
          </AnimCard>
          <AnimCard index={7} style={styles.paiementCard}>
            <Text style={styles.cardLabel}>💳 Carte</Text>
            <Text style={styles.cardValue}>{carte?._sum?.prixVente ?? 0} €</Text>
          </AnimCard>
        </View>

        {/* Dernières ventes */}
        <Text style={styles.sectionTitle}>Dernières ventes</Text>
        {recentVentes?.map((vente: any, i: number) => (
          <AnimCard key={vente.id} index={i + 8} style={styles.venteRow}>
            <View>
              <Text style={styles.venteName}>{vente.nomArticle}</Text>
              <Text style={styles.venteMeta}>
                {vente.creatrice.nom} · {vente.modePaiement}
              </Text>
            </View>
            <Text style={styles.ventePrice}>{vente.prixVente} €</Text>
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
                  <Text style={styles.historiqueCA}>{item.ca} €</Text>
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
            <TouchableOpacity style={styles.upgradeBtn} activeOpacity={0.85}>
              <Text style={styles.upgradeTxt}>✨ Passer à PRO — 9€/mois</Text>
            </TouchableOpacity>
          </AnimCard>
        )}
      </View>
    </ScrollView>
  );
}
