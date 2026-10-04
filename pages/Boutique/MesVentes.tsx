import { useRef, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Animated, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import { venteService } from "@/services/api";
import type { Vente } from "@/types";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Radius, Spacing } from "@/constants/spacing";
import { styles as venteStyles } from "@/styles/pages/ventes.style";
import ListRow from "@/components/List/ListRow";
import Badge from "@/components/Badge/Badge";
import { Notice } from "@/components/Notice/Notice";

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

function AnimCard({ children, index }: { children: React.ReactNode; index: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 320, delay: index * 50, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View style={{ opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
      {children}
    </Animated.View>
  );
}

//- Vue en lecture seule : les ventes QUE la créatrice a faites dans une
//- boutique où elle est membre. Pas de bouton d'ajout — c'est la gérante qui
//- enregistre les ventes en boutique, pas la créatrice elle-même.
export default function MesVentesBoutiqueScreen() {
  const { id, nom } = useLocalSearchParams<{ id: string; nom: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const boutiqueName = nom ? decodeURIComponent(nom) : "Boutique";

  const { data: res, isLoading } = useQuery({
    // take élevé : vue bornée à une seule boutique, pas de pagination ici —
    // la limite par défaut (20) côté backend serait une perte de données
    // silencieuse pour cette vue perso.
    queryKey: ["mes-ventes-boutique", id],
    queryFn: () => venteService.getAll({ boutiqueId: id, take: 200 }),
    enabled: !!id,
  });
  const ventes: Vente[] = res?.data ?? [];

  const count = ventes.length;
  const ca = ventes.reduce((acc, v) => acc + v.prixVente, 0);

  return (
    <View style={[s.container, { paddingTop: insets.top + 12 }]}>
      <View style={s.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={s.backBtn}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Retour"
        >
          <AntDesign name="arrow-left" size={20} color={Colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle} numberOfLines={1}>{boutiqueName}</Text>
          <Text style={s.headerSub}>
            {count} vente{count > 1 ? "s" : ""} · {ca.toFixed(2)} €
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={s.loadingContainer}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={venteStyles.list} showsVerticalScrollIndicator={false}>
          {count > 0 ? (
            ventes.map((v, index) => (
              <AnimCard key={v.id} index={index}>
                <ListRow
                  left={
                    <>
                      <Text style={venteStyles.cardNomArticle} numberOfLines={2}>
                        {v.nomArticle}
                        {(v.quantite ?? 1) > 1 ? `  × ${v.quantite}` : ""}
                      </Text>
                      <Text style={venteStyles.cardMeta}>{formatDate(v.createdAt)}</Text>
                    </>
                  }
                  right={
                    <>
                      <Text style={venteStyles.cardPrix}>{v.prixVente.toFixed(2)} €</Text>
                      <Badge color={v.modePaiement === "CARTE" ? "info" : "warning"}>{v.modePaiement}</Badge>
                    </>
                  }
                />
              </AnimCard>
            ))
          ) : (
            <Notice>Aucune vente ici pour l'instant — tes ventes enregistrées dans cette boutique apparaîtront ici.</Notice>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800",
    fontSize: 24,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  headerSub: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
});
