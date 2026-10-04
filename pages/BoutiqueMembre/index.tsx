import { useRef, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Animated, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import { boutiqueService } from "@/services/api";
import type { Boutique } from "@/types";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Radius } from "@/constants/spacing";
import { shadows } from "@/styles/utils/shadows.styles";

function AnimRow({ children, index }: { children: React.ReactNode; index: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 320, delay: index * 60, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.View
      style={{
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }],
      }}
    >
      {children}
    </Animated.View>
  );
}

//- Onglet visible uniquement pour une créatrice membre d'au moins une
//- boutique (voir app/(app)/_layout.tsx) — liste les boutiques où elle
//- vend, chacune ouvre ses propres ventes dans cette boutique.
export default function BoutiqueMembreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data: boutiques, isLoading } = useQuery<Boutique[]>({
    queryKey: ["mes-boutiques"],
    queryFn: () => boutiqueService.getMesBoutiques(),
  });

  const count = boutiques?.length ?? 0;

  return (
    <View style={s.container}>
      <View style={[s.header, { paddingTop: insets.top + 16 }]}>
        <Text style={s.titre}>Boutiques</Text>
        <Text style={s.sousTitre}>
          {count} boutique{count > 1 ? "s" : ""}
        </Text>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {!isLoading && count === 0 && (
          <View style={s.emptyContainer}>
            <Text style={s.emptyIcon}>🏪</Text>
            <Text style={s.emptyTxt}>Aucune boutique</Text>
          </View>
        )}

        {(boutiques ?? []).map((boutique, i) => (
          <AnimRow key={boutique.id} index={i}>
            <TouchableOpacity
              style={s.card}
              activeOpacity={0.75}
              onPress={() =>
                router.push(`/(app)/mes-ventes-boutique/${boutique.id}?nom=${encodeURIComponent(boutique.nom)}`)
              }
            >
              <View style={s.cardIconWrap}>
                <AntDesign name="shop" size={18} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.cardNom} numberOfLines={1}>{boutique.nom}</Text>
                <Text style={s.cardSub}>Voir mes ventes ici</Text>
              </View>
              <AntDesign name="right" size={14} color={Colors.textLight} />
            </TouchableOpacity>
          </AnimRow>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  // Header crème — même DA que le web
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  titre: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800",
    fontSize: 30,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  sousTitre: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: 13,
    color: Colors.textLight,
    marginTop: 4,
  },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 12,
    gap: 12,
    ...shadows.sm,
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryTint,
    alignItems: "center",
    justifyContent: "center",
  },
  cardNom: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 15,
    color: Colors.text,
  },
  cardSub: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyTxt: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: 14,
    color: Colors.textLight,
  },
});
