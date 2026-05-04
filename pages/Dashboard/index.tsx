import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { boutiqueService, statsService, venteService } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { styles } from "@/styles/pages/dashboard.style";
import { typo } from "@/styles/utils/typography.styles";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";

export default function DashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const isGerante = user?.role === "GERANTE";
  const isPro = user?.plan === "PRO";

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

  if (isLoading)
    return (
      <View style={styles.container}>
        <Text style={typo.regular}>Chargement...</Text>
      </View>
    );

  //- Récupère les montants espèces et carte depuis le tableau paiement
  const especes = data?.paiement?.find(
    (p: any) => p.modePaiement === "ESPECES",
  );
  const carte = data?.paiement?.find((p: any) => p.modePaiement === "CARTE");

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[typo.light, styles.greeting]}>Bonjour 👋</Text>
        <Text style={[typo.title, styles.name]}>
          {user?.prenom && user?.nom
            ? `${user.prenom} ${user.nom}`
            : user?.email}
        </Text>
        <View style={styles.badgeWrap}>
          <Text style={styles.badge}>
            {user?.role} · {user?.plan}
          </Text>
        </View>
      </View>

      {/* Badge mois en cours — FREE uniquement */}
      {!isPro && (
        <View style={styles.moisBadge}>
          <Text style={styles.moisTxt}>
            📅{" "}
            {new Date().toLocaleDateString("fr-FR", {
              month: "long",
              year: "numeric",
            })}{" "}
            — mois en cours uniquement
          </Text>
        </View>
      )}

      {/* Info boutique — GERANTE uniquement */}
      {isGerante && (
        <View style={styles.infoBox}>
          <Text style={styles.infoTxt}>
            🏪{" "}
            {isPro
              ? "Multi-boutiques · Stats avancées · Historique complet"
              : "1 boutique · 3 créatrices max"}
          </Text>
        </View>
      )}

      {isGerante && !isPro && (
        <View style={styles.lockedBox}>
          <Text style={styles.lockedTxt}>
            🏪 Gérez plusieurs boutiques en PRO
          </Text>
          <Text style={styles.lockedDesc}>
            Créez plusieurs boutiques et consultez les stats de chacune
            séparément.
          </Text>
          <TouchableOpacity style={styles.upgradeBtn}>
            <Text style={styles.upgradeTxt}>✨ Passer à PRO — 9€/mois</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Boutiques — GERANTE PRO uniquement */}
      {isGerante && isPro && boutiques && (
        <>
          <Text style={[typo.medium, styles.sectionTitle]}>Mes boutiques</Text>
          {boutiques.map((boutique: any) => (
            <TouchableOpacity
              key={boutique.id}
              style={styles.boutiqueRow}
              onPress={() => router.push(`/(app)/boutique/${boutique.id}`)}
            >
              <View>
                <Text style={[typo.medium, styles.boutiqueName]}>
                  {boutique.nom}
                </Text>
                <Text style={[typo.light, styles.boutiqueMeta]}>
                  {boutique.nbCreatrices} créatrices · {boutique.nbVentes}{" "}
                  ventes : {boutique.ca} €
                </Text>
              </View>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <View
                    style={{ justifyContent: "center", alignItems: "center" }}
                  >
                    <Text style={{ color: Colors.primary, fontSize: 22 }}>
                      ›
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Section cards */}
      <Text style={[typo.medium, styles.sectionTitle]}>Ce mois-ci</Text>
      <View style={styles.cardsGrid}>
        <View style={styles.card}>
          <Text style={[typo.light, styles.cardLabel]}>Chiffre d'affaires</Text>
          <Text style={[typo.bold, styles.cardValue]}>
            {data?.stats._sum.prixVente ?? 0} €
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={[typo.light, styles.cardLabel]}>Ventes</Text>
          <Text style={[typo.bold, styles.cardValue]}>
            {data?.stats._count ?? 0}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={[typo.light, styles.cardLabel]}>Commissions</Text>
          <Text style={[typo.bold, styles.cardValue]}>
            {data?.totalCommissions?.toFixed(2) ?? 0} €
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={[typo.light, styles.cardLabel]}>
            Meilleur vente du mois
          </Text>
          <Text style={[typo.bold, styles.cardValue]}>
            {data?.stats._max.prixVente ?? 0} €
          </Text>
        </View>

        {/* Card créatrices — GERANTE FREE uniquement */}
        {isGerante && !isPro && (
          <View style={styles.card}>
            <Text style={[typo.light, styles.cardLabel]}>Créatrices</Text>
            <Text style={[typo.bold, styles.cardValue]}>
              {boutiqueStats?.nbCreatrices ?? 0}/
              {boutiqueStats?.maxCreatrices ?? 3}
            </Text>
          </View>
        )}
      </View>

      {/* Répartition paiements */}
      <Text style={[typo.medium, styles.sectionTitle]}>
        Répartition paiements
      </Text>
      <View style={styles.paiementRow}>
        <View style={styles.paiementCard}>
          <Text style={[typo.light, styles.cardLabel]}>Espèces</Text>
          <Text style={[typo.bold, styles.cardValue]}>
            {especes?._sum?.prixVente ?? 0} €
          </Text>
        </View>
        <View style={styles.paiementCard}>
          <Text style={[typo.light, styles.cardLabel]}>Carte</Text>
          <Text style={[typo.bold, styles.cardValue]}>
            {carte?._sum?.prixVente ?? 0} €
          </Text>
        </View>
      </View>

      {/* Dernières ventes */}
      <Text style={[typo.medium, styles.sectionTitle]}>Dernières ventes</Text>
      {recentVentes?.map((vente: any) => (
        <View key={vente.id} style={styles.venteRow}>
          <View>
            <Text style={[typo.medium, styles.venteName]}>
              {vente.nomArticle}
            </Text>
            <Text style={[typo.light, styles.venteMeta]}>
              {vente.creatrice.nom} · {vente.modePaiement}
            </Text>
          </View>
          <Text style={[typo.bold, styles.ventePrice]}>
            {vente.prixVente} €
          </Text>
        </View>
      ))}

      {/* Historique 3 mois — PRO uniquement */}
      {isPro && historique && (
        <>
<Text style={[typo.medium, styles.sectionTitle, { marginTop: 16 }]}>Historique</Text>          {historique.map((item: any) => (
            <View key={item.mois} style={styles.historiqueRow}>
              <Text style={[typo.regular, styles.historiqueMois]}>
                {item.mois}
              </Text>
              <View style={styles.historiqueRight}>
                <Text style={[typo.bold, styles.historiqueCA]}>
                  {item.ca} €
                </Text>
                <Text style={[typo.light, styles.historiqueNb]}>
                  {item.nbVentes} ventes
                </Text>
              </View>
            </View>
          ))}
        </>
      )}

      {/* Historique complet pro */}
      {!isPro && (
        <View style={styles.lockedBox}>
          <Text style={styles.lockedTxt}>
            🔒 Historique complet disponible en PRO
          </Text>
          <Text style={styles.lockedDesc}>
            Accédez à tout votre historique de ventes, sans limite de période.
          </Text>
          <TouchableOpacity style={styles.upgradeBtn}>
            <Text style={styles.upgradeTxt}>✨ Passer à PRO — 9€/mois</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
