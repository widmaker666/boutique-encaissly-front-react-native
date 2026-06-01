import { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native";
import { router } from "expo-router";
import { styles } from "@/styles/pages/login.style";
import { Colors } from "@/constants/colors";
import { authService, useGoogleAuth } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { AntDesign } from "@expo/vector-icons";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { setTokens, setUser } = useAuthStore();
  const { request, response, promptAsync } = useGoogleAuth();

  const headerAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(120, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  //- Récupère le token Google et l'envoie au backend
  useEffect(() => {
    if (response?.type === "success") {
      const googleToken = response.authentication?.accessToken;
      if (!googleToken) return;
      setLoading(true);
      authService
        .googleMobile(googleToken)
        .then(async ({ accessToken, refreshToken }) => {
          setTokens(accessToken, refreshToken);
          const user = await authService.getProfile();
          setUser(user);
          router.replace("/(app)");
        })
        .catch(() => setError("Connexion Google échouée."))
        .finally(() => setLoading(false));
    }
  }, [response]);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Veuillez remplir tous les champs.");
      return;
    }
    try {
      setLoading(true);
      const { accessToken, refreshToken } = await authService.login(
        email,
        password,
      );
      setTokens(accessToken, refreshToken);
      const user = await authService.getProfile();
      setUser(user);
      router.replace("/(app)");
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Identifiants incorrects.");
    } finally {
      setLoading(false);
    }
  };

  const slideUp = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [
      {
        translateY: anim.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Animated.View style={slideUp(headerAnim)}>
        <Text style={styles.titre}>Connexion</Text>
        <Text style={styles.sousTitre}>
          Bienvenue — connectez-vous à votre boutique.
        </Text>
      </Animated.View>

      <Animated.View style={slideUp(formAnim)}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          placeholder="votre@email.com"
          placeholderTextColor={Colors.textLight}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Mot de passe</Text>
        <TextInput
          style={[styles.input, error ? styles.inputError : null]}
          placeholder="••••••••"
          placeholderTextColor={Colors.textLight}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.btnPrimaryText}>Se connecter</Text>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.btnGoogle}
          onPress={() => promptAsync()}
          disabled={!request || loading}
          activeOpacity={0.85}
        >
          <AntDesign name="google" size={18} color="#EA4335" />
          <Text style={styles.btnGoogleText}>Continuer avec Google</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Pas encore de compte ?</Text>
          <TouchableOpacity onPress={() => router.replace("/(auth)/register")}>
            <Text style={styles.footerLink}>Créer un compte</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}
