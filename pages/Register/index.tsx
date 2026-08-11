import { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { styles } from "@/styles/pages/register.style";
import { Colors } from "@/constants/colors";
import { authService, useGoogleAuth, fetchGoogleUserInfo } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { AntDesign } from "@expo/vector-icons";

type Role = "GERANTE" | "CREATRICE" | "GERANTE_CREATRICE";
type Method = "google" | "email";

export default function RegisterScreen() {
  const params = useLocalSearchParams<{ email?: string; role?: string }>();

  //- "choice" = écran initial (Google / Email), "form" = formulaire à compléter
  const [step, setStep] = useState<"choice" | "form">("choice");
  const [method, setMethod] = useState<Method | null>(null);

  //- Token Google conservé le temps que l'utilisateur complète rôle + CGU —
  //- le compte n'est créé qu'à la soumission finale, jamais avant
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [loadingGoogleProfile, setLoadingGoogleProfile] = useState(false);

  const [role, setRole] = useState<Role | null>(
    params.role === "GERANTE" || params.role === "CREATRICE" || params.role === "GERANTE_CREATRICE"
      ? (params.role as Role)
      : null
  );
  const [email, setEmail] = useState(params.email ?? "");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedCGU, setAcceptedCGU] = useState(false);

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
  }, [step]);

  //- Après l'auth Google : récupère juste le profil (email/prénom/nom) pour
  //- pré-remplir le formulaire. Aucun compte n'est créé à cette étape.
  useEffect(() => {
    if (response?.type === "success") {
      const googleToken = response.authentication?.accessToken;
      if (!googleToken) return;
      setError("");
      setLoadingGoogleProfile(true);
      fetchGoogleUserInfo(googleToken)
        .then((profile) => {
          setGoogleAccessToken(googleToken);
          setEmail(profile.email);
          setPrenom(profile.prenom);
          setNom(profile.nom);
          setMethod("google");
          setStep("form");
        })
        .catch(() => setError("Impossible de récupérer votre profil Google."))
        .finally(() => setLoadingGoogleProfile(false));
    }
  }, [response]);

  const handleChooseEmail = () => {
    setMethod("email");
    setStep("form");
  };

  const handleBack = () => {
    setStep("choice");
    setMethod(null);
    setError("");
  };

  const handleSubmit = async () => {
    setError("");
    if (!role) {
      setError("Veuillez choisir votre type de compte.");
      return;
    }
    if (!acceptedCGU) {
      setError("Veuillez accepter les CGU et la politique de confidentialité.");
      return;
    }

    try {
      setLoading(true);

      if (method === "google") {
        if (!googleAccessToken) return;
        const { accessToken, refreshToken } = await authService.googleMobile(
          googleAccessToken,
          role,
          true,
        );
        setTokens(accessToken, refreshToken);
        const user = await authService.getProfile();
        setUser(user);
        router.replace("/(app)");
        return;
      }

      //- Méthode email
      if (!email || !password) {
        setError("Veuillez remplir tous les champs.");
        return;
      }
      if (password.length < 8) {
        setError("Le mot de passe doit faire au moins 8 caractères.");
        return;
      }
      await authService.register(email, password, nom, prenom, role, true);
      const { accessToken, refreshToken } = await authService.login(email, password);
      setTokens(accessToken, refreshToken);
      const user = await authService.getProfile();
      setUser(user);
      router.replace("/(app)");
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "Erreur lors de l'inscription.");
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

  const RoleSelector = () => (
    <>
      <Text style={styles.label}>Je suis...</Text>
      <View style={styles.roleRow}>
        {(
          [
            { key: "GERANTE", icon: "🏪", title: "Gérante", desc: "Je gère une boutique" },
            { key: "CREATRICE", icon: "🎨", title: "Créatrice", desc: "Je vends mes créations" },
          ] as const
        ).map((item) => {
          const selected = role === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.roleCard, selected && styles.roleCardSelected]}
              onPress={() => setRole(item.key)}
              activeOpacity={0.85}
            >
              <Text style={styles.roleIcon}>{item.icon}</Text>
              <Text style={[styles.roleTitle, selected && styles.roleTitleSelected]}>
                {item.title}
              </Text>
              <Text style={styles.roleDesc}>{item.desc}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity
        style={[styles.roleCardDuo, role === "GERANTE_CREATRICE" && styles.roleCardSelected]}
        onPress={() => setRole("GERANTE_CREATRICE")}
        activeOpacity={0.85}
      >
        <Text style={styles.roleIcon}>🏪🎨</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.roleTitle, role === "GERANTE_CREATRICE" && styles.roleTitleSelected]}>
            Gérante & Créatrice
          </Text>
          <Text style={styles.roleDesc}>
            Je gère ma boutique ET je vends mes propres créations
          </Text>
        </View>
      </TouchableOpacity>
    </>
  );

  const CguCheckbox = () => (
    <TouchableOpacity
      style={styles.cguRow}
      onPress={() => setAcceptedCGU((v) => !v)}
      activeOpacity={0.8}
    >
      <View style={[styles.checkbox, acceptedCGU && styles.checkboxChecked]}>
        {acceptedCGU && <AntDesign name="check" size={12} color="#fff" />}
      </View>
      <Text style={styles.cguText}>
        J'accepte les{" "}
        <Text style={styles.cguLink} onPress={() => router.push("/(auth)/legal")}>
          CGU et la politique de confidentialité
        </Text>
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {step === "choice" ? (
          <>
            <Animated.View style={slideUp(headerAnim)}>
              <Text style={styles.titre}>Inscription</Text>
              <Text style={styles.sousTitre}>
                Créez votre compte en quelques secondes.
              </Text>
            </Animated.View>

            <Animated.View style={[slideUp(formAnim), styles.choiceWrap]}>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={styles.btnGoogle}
                onPress={() => promptAsync()}
                disabled={!request || loadingGoogleProfile}
                activeOpacity={0.85}
              >
                {loadingGoogleProfile ? (
                  <ActivityIndicator color={Colors.primary} />
                ) : (
                  <>
                    <AntDesign name="google" size={18} color="#EA4335" />
                    <Text style={styles.btnGoogleText}>S'inscrire avec Google</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.choiceBtnEmail}
                onPress={handleChooseEmail}
                activeOpacity={0.85}
              >
                <AntDesign name="mail" size={18} color="#fff" />
                <Text style={styles.choiceBtnEmailText}>S'inscrire avec email</Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Déjà un compte ?</Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                  <Text style={styles.footerLink}>Se connecter</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </>
        ) : (
          <>
            <Animated.View style={slideUp(headerAnim)}>
              <TouchableOpacity style={styles.backRow} onPress={handleBack} activeOpacity={0.75}>
                <AntDesign name="arrow-left" size={16} color={Colors.primary} />
                <Text style={styles.backText}>Retour</Text>
              </TouchableOpacity>
              <Text style={styles.titre}>
                {method === "google" ? "Finaliser l'inscription" : "Inscription"}
              </Text>
              <Text style={styles.sousTitre}>
                {method === "google"
                  ? "Il ne reste que quelques infos à compléter."
                  : "Créez votre compte."}
              </Text>
            </Animated.View>

            <Animated.View style={slideUp(formAnim)}>
              {method === "google" && (
                <View style={styles.lockedRow}>
                  <Text style={styles.lockedText} numberOfLines={1}>{email}</Text>
                  <AntDesign name="lock" size={14} color={Colors.primary} />
                </View>
              )}

              <RoleSelector />

              {method === "email" && (
                <>
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
                </>
              )}

              <Text style={styles.label}>Prénom</Text>
              <TextInput
                style={styles.input}
                placeholder="Votre prénom"
                placeholderTextColor={Colors.textLight}
                autoCapitalize="words"
                value={prenom}
                onChangeText={setPrenom}
              />

              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={styles.input}
                placeholder="Votre nom"
                placeholderTextColor={Colors.textLight}
                autoCapitalize="words"
                value={nom}
                onChangeText={setNom}
              />

              {method === "email" && (
                <>
                  <Text style={styles.label}>Mot de passe</Text>
                  <TextInput
                    style={[styles.input, error ? styles.inputError : null]}
                    placeholder="••••••••  (8 caractères min)"
                    placeholderTextColor={Colors.textLight}
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </>
              )}

              <CguCheckbox />

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.btnPrimary, !acceptedCGU && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.btnPrimaryText}>Créer mon compte</Text>
                )}
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>Déjà un compte ?</Text>
                <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
                  <Text style={styles.footerLink}>Se connecter</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
