import { useRef, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Animated, ActivityIndicator, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import { venteService } from "@/services/api";
import type { Vente, ModePaiement } from "@/types";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { styles as venteStyles } from "@/styles/pages/ventes.style";

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function BadgePaiement({ mode }: { mode: ModePaiement }) {
  const isEspeces = mode === "ESPECES";
  return (
    <View style={[venteStyles.badgePaiement, isEspeces ? venteStyles.badgeEspeces : venteStyles.badgeCarte]}>
      <Text style={[venteStyles.badgeTxt, isEspeces ? venteStyles.badgeTxtEspeces : venteStyles.badgeTxtCarte]}>
        {isEspeces ? "ESPECES" : "CARTE"}
      </Text>
    </View>
  );
}

function AnimCard({ children, index }: { children: React.ReactNode; index: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 320, delay: index * 50, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View
      style={[
        venteStyles.card,
        { opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] },
      ]}
    >
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

  const { data: ventes, isLoading } = useQuery<Vente[]>({
    queryKey: ["mes-ventes-boutique", id],
    queryFn: () => venteService.getAll({ boutiqueId: id }),
    enabled: !!id,
  });

  const count = ventes?.length ?? 0;
  const ca = (ventes ?? []).reduce((acc, v) => acc + v.prixVente, 0);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <AntDesign name="arrow-left" size={22} color="#fff" />
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
            ventes!.map((v, index) => (
              <AnimCard key={v.id} index={index}>
                <View style={venteStyles.cardRow}>
                  <View style={venteStyles.cardLeft}>
                    <Text style={venteStyles.cardNomArticle} numberOfLines={2}>
                      {v.nomArticle}
                      {(v.quantite ?? 1) > 1 ? `  × ${v.quantite}` : ""}
                    </Text>
                  </View>
                  <View style={venteStyles.cardRight}>
                    <Text style={venteStyles.cardPrix}>{v.prixVente.toFixed(2)} €</Text>
                    <BadgePaiement mode={v.modePaiement} />
                  </View>
                </View>
                <Text style={venteStyles.cardDate}>{formatDate(v.createdAt)}</Text>
              </AnimCard>
            ))
          ) : (
            <View style={venteStyles.emptyContainer}>
              <Text style={venteStyles.emptyIcon}>🧾</Text>
              <Text style={venteStyles.emptyTxt}>Aucune vente ici pour l'instant</Text>
              <Text style={venteStyles.emptySub}>
                Tes ventes enregistrées dans cette boutique apparaîtront ici.
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontFamily: Fonts.family.norwester,
    fontSize: 18,
    color: "#fff",
    letterSpacing: 0.5,
  },
  headerSub: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
    marginTop: 2,
  },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
});
