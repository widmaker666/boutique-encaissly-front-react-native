import { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
  useWindowDimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

const SLIDES = [
  {
    key: "1",
    emoji: "🏪",
    title: "Bienvenue sur Encaissly",
    body: "La caisse intelligente pensée pour les boutiques de créateurs. Gérez vos ventes, vos créatrices et vos stats en quelques taps.",
  },
  {
    key: "2",
    emoji: "💰",
    title: "Enregistrez vos ventes",
    body: "Ajoutez une vente en quelques secondes : article, prix, mode de paiement. Encaissly calcule automatiquement les commissions de chaque créatrice.",
  },
  {
    key: "3",
    emoji: "🎨",
    title: "Suivez chaque créatrice",
    body: "Invitez vos créatrices, suivez leurs ventes individuelles et consultez les stats par personne. Tout est transparent et en temps réel.",
  },
  {
    key: "4",
    emoji: "🚀",
    title: "Prêt(e) à démarrer ?",
    body: "Créez un compte Gérante pour gérer votre boutique, Créatrice pour vendre vos créations, ou DUO si vous faites les deux !",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const isLast = currentIndex === SLIDES.length - 1;

  const handleNext = () => {
    if (isLast) {
      finish();
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
    }
  };

  const finish = async () => {
    await AsyncStorage.setItem("hasSeenOnboarding", "true");
    router.replace("/(auth)/login");
  };

  return (
    <View style={[s.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <View style={[s.slide, { width }]}>
            <Text style={s.emoji}>{item.emoji}</Text>
            <Text style={s.title}>{item.title}</Text>
            <Text style={s.body}>{item.body}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={s.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[s.dot, i === currentIndex && s.dotActive]} />
        ))}
      </View>

      {/* Boutons */}
      <View style={s.btnRow}>
        {!isLast && (
          <TouchableOpacity style={s.skipBtn} onPress={finish} activeOpacity={0.7}>
            <Text style={s.skipTxt}>Passer</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[s.nextBtn, isLast && s.nextBtnFull]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={s.nextTxt}>{isLast ? "Commencer" : "Suivant"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
  },
  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    gap: 20,
  },
  emoji: {
    fontSize: 72,
    marginBottom: 8,
  },
  title: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800",
    fontSize: 28,
    color: Colors.text,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  body: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: 15,
    color: Colors.textLight,
    textAlign: "center",
    lineHeight: 24,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    width: 24,
    backgroundColor: Colors.text,
  },
  btnRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 28,
    width: "100%",
  },
  skipBtn: {
    flex: 1,
    minHeight: 52,
    justifyContent: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
  },
  skipTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: 15,
    color: Colors.text,
  },
  nextBtn: {
    flex: 2,
    minHeight: 52,
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: Colors.text,
    alignItems: "center",
  },
  nextBtnFull: {
    flex: 1,
  },
  nextTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 15,
    color: "#fff",
  },
});
