import { useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, Animated } from "react-native";
import { router } from "expo-router";
import { styles } from "@/styles/pages/home.style";

export default function HomeScreen() {
  const logoAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const btnsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(btnsAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const logoStyle = {
    opacity: logoAnim,
    transform: [
      {
        scale: logoAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.6, 1],
        }),
      },
    ],
  };

  const contentStyle = {
    opacity: contentAnim,
    transform: [
      {
        translateY: contentAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [24, 0],
        }),
      },
    ],
  };

  const btnsStyle = {
    opacity: btnsAnim,
    transform: [
      {
        translateY: btnsAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [16, 0],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoWrap, logoStyle]}>
        <Image source={require("@/assets/icon.png")} style={styles.logo} />
      </Animated.View>

      <Animated.View style={[{ alignItems: "center" }, contentStyle]}>
        <Text style={styles.titre}>ENCAISSLY</Text>
        <Text style={styles.pitch}>
          La caisse intelligente des boutiques de créateurs
        </Text>
        <Text style={styles.description}>
          Gérez vos ventes, suivez les commissions de chaque créatrice et
          gardez une vue claire sur votre boutique — depuis votre téléphone.
        </Text>
      </Animated.View>

      <Animated.View style={[{ width: "100%" }, btnsStyle]}>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => router.push("/(auth)/login")}
          activeOpacity={0.85}
        >
          <Text style={styles.btnPrimaryText}>Se connecter</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => router.push("/(auth)/register")}
          activeOpacity={0.85}
        >
          <Text style={styles.btnSecondaryText}>Créer un compte</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push("/(auth)/legal")} style={styles.legalLink} activeOpacity={0.7}>
          <Text style={styles.legalLinkText}>Mentions légales · CGU · Confidentialité</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
