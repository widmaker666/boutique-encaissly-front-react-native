import { View, Text, ScrollView } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { statsService, venteService } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { styles } from "@/styles/pages/dashboard.style";
import { typo } from "@/styles/utils/typography.styles";

export default function DashboardScreen() {
  const user = useAuthStore((state) => state.user);

  const { data, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: statsService.getGlobal,
  });

  const { data: recentVentes } = useQuery({
    queryKey: ["ventes-recent"],
    queryFn: venteService.getRecent,
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
          <Text style={[typo.light, styles.cardLabel]}>Vente max</Text>
          <Text style={[typo.bold, styles.cardValue]}>
            {data?.stats._max.prixVente ?? 0} €
          </Text>
        </View>
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
    </ScrollView>
  );
}
