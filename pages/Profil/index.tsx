import { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Animated,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "@/stores/auth.store";
import * as WebBrowser from "expo-web-browser";
import { authService, userService, stripeService } from "@/services/api";

// Passer à true quand Stripe live sera activé (SIRET en cours)
const PAIEMENT_ACTIF = false;
const CONTACT_EMAIL = "contact.encaissly@gmail.com";
const ecrireContact = () =>
  Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Encaissly — bug ou suggestion")}`).catch(() =>
    Alert.alert("Nous contacter", `Écris-nous à ${CONTACT_EMAIL}`),
  );
const alertPaiement = () => Alert.alert("Bientôt disponible", "Les abonnements ne sont pas encore disponibles : le site et l'application sont en phase de test. Ça arrive très bientôt !");
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { shadows } from "@/styles/utils/shadows.styles";
import { Radius } from "@/constants/spacing";
import { AntDesign } from "@expo/vector-icons";
import type { Boutique } from "@/types";

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
      delay: index * 70,
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View
      pointerEvents="box-none"
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

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <View style={s.infoRow}>
      <AntDesign name={icon as any} size={15} color={Colors.primary} style={s.infoIcon} />
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function EditField({
  label,
  value,
  onChangeText,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={s.editFieldRow}>
      <Text style={s.infoLabel}>{label}</Text>
      <TextInput
        style={s.editInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? label}
        placeholderTextColor={Colors.textLight}
        autoCapitalize="words"
        returnKeyType="done"
      />
    </View>
  );
}

const TABS = [
  { key: "profil", label: "Profil" },
  { key: "abonnement", label: "Abonnement" },
  { key: "aide", label: "Aide & légal" },
] as const;

export default function ProfilScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const setUser = useAuthStore((state) => state.setUser);

  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("profil");
  const [notifEmail, setNotifEmail] = useState(user?.notificationsEmail ?? false);
  const [isEditing, setIsEditing] = useState(false);
  const [editPrenom, setEditPrenom] = useState(user?.prenom ?? "");
  const [editNom, setEditNom] = useState(user?.nom ?? "");
  const [showCreateBoutique, setShowCreateBoutique] = useState(false);
  const [boutiqueNom, setBoutiqueNom] = useState("");
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");

  //- Rafraîchit le profil à chaque ouverture de l'onglet pour refléter les changements de plan Stripe
  useQuery({
    queryKey: ["profil-sync"],
    queryFn: async () => {
      const updatedUser = await authService.getProfile();
      setUser(updatedUser);
      return updatedUser;
    },
    refetchOnMount: true,
    staleTime: 0,
  });

  const isPro = user?.plan === "PRO";
  const isDuo = user?.role === "GERANTE_CREATRICE";
  const isPlanDuo = user?.plan === "DUO";
  const duoMode = useAuthStore((s) => s.duoMode);
  const isGerante = user?.role === "GERANTE" || (isDuo && duoMode === "GERANTE");

  const headerAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, []);

  //- DUO débloque les mêmes fonctionnalités que PRO (plan payant à part
  //- entière) — isPro reste volontairement "PRO uniquement" plus bas pour
  //- l'affichage du badge/CTA, donc on ajoute isPlanDuo ici explicitement

  const { mutate: saveProfile, isPending: isSaving } = useMutation({
    mutationFn: () => userService.updateProfile({ nom: editNom || undefined, prenom: editPrenom || undefined }),
    onSuccess: (data) => {
      if (user) setUser({ ...user, nom: data.nom, prenom: data.prenom });
      //- Invalide les caches ventes et créatrices pour que le nouveau nom
      //- s'affiche immédiatement dans les listes (Creatrice.nom est synced côté back)
      queryClient.invalidateQueries({ queryKey: ["ventes"] });
      queryClient.invalidateQueries({ queryKey: ["ventes-recent"] });
      queryClient.invalidateQueries({ queryKey: ["creatrices"] });
      queryClient.invalidateQueries({ queryKey: ["creatrice"] });
      setIsEditing(false);
    },
  });

  const { mutate: uploadAvatar, isPending: isUploadingAvatar } = useMutation({
    mutationFn: (img: { uri: string; mimeType: string }) =>
      userService.uploadAvatar(img.uri, img.mimeType),
    onSuccess: (data) => {
      if (user) setUser({ ...user, avatar: data.avatar });
    },
    onError: () => {
      Alert.alert("Erreur", "Impossible de mettre à jour l'avatar.");
    },
  });

  const { mutate: toggleNotif, isPending: isTogglingNotif } = useMutation({
    mutationFn: (enabled: boolean) => userService.updateNotifications(enabled),
    onSuccess: (_data, enabled) => {
      if (user) setUser({ ...user, notificationsEmail: enabled });
    },
    onError: () => {
      setNotifEmail((prev) => !prev);
    },
  });

  const { mutate: cancelPlan, isPending: isCancelling } = useMutation({
    mutationFn: () => stripeService.cancelSubscription(),
    onSuccess: async ({ endsAt }) => {
      Alert.alert("Résiliation enregistrée", endsAt ? `Résiliation enregistrée : ton abonnement reste actif jusqu'au ${new Date(endsAt).toLocaleDateString("fr-FR")}, puis tu repasseras en plan FREE.` : "Résiliation enregistrée : ton abonnement reste actif jusqu'à la fin de la période payée.");
      const updatedUser = await authService.getProfile();
      setUser(updatedUser);
    },
    onError: () => {
      Alert.alert("Erreur", "Impossible de résilier l'abonnement. Veuillez réessayer.");
    },
  });

  const { mutate: upgradePro, isPending: isUpgradingPro } = useMutation({
    mutationFn: async () => {
      const priceId = billingPeriod === "annual"
        ? (process.env.EXPO_PUBLIC_STRIPE_PRICE_PRO_ANNUAL ?? "")
        : (process.env.EXPO_PUBLIC_STRIPE_PRICE_PRO_MONTHLY ?? "");
      const { url } = await stripeService.createCheckoutSession(priceId);
      await WebBrowser.openBrowserAsync(url);
    },
    onSuccess: async () => {
      await new Promise((r) => setTimeout(r, 2000));
      const updatedUser = await authService.getProfile();
      setUser(updatedUser);
    },
    onError: () => {
      Alert.alert("Erreur", "Impossible d'ouvrir la page de paiement.");
    },
  });

  const { mutate: upgradeDuo, isPending: isUpgradingDuo } = useMutation({
    mutationFn: async () => {
      // Si pas encore GERANTE_CREATRICE, on upgrade le role d'abord
      if (user?.role !== "GERANTE_CREATRICE") {
        const updatedUser = await stripeService.upgradeDuo();
        setUser(updatedUser);
      }
      const priceId = billingPeriod === "annual"
        ? (process.env.EXPO_PUBLIC_STRIPE_PRICE_DUO_ANNUAL ?? "")
        : (process.env.EXPO_PUBLIC_STRIPE_PRICE_DUO_MONTHLY ?? "");
      const { url } = await stripeService.createCheckoutSession(priceId);
      await WebBrowser.openBrowserAsync(url);
    },
    onSuccess: async () => {
      await new Promise((r) => setTimeout(r, 2000));
      const updatedUser = await authService.getProfile();
      setUser(updatedUser);
    },
    onError: () => {
      Alert.alert("Erreur", "Impossible d'ouvrir la page de paiement DUO.");
    },
  });

  const handleToggleNotif = (val: boolean) => {
    setNotifEmail(val);
    toggleNotif(val);
  };

  const handleCancelEdit = () => {
    setEditPrenom(user?.prenom ?? "");
    setEditNom(user?.nom ?? "");
    setIsEditing(false);
  };

  const handleResilier = () => {
    Alert.alert(
      "Résilier l'abonnement",
      "Votre abonnement restera actif jusqu'à la fin de la période déjà payée (pas de remboursement au prorata), puis vous repasserez en plan FREE. Continuer ?",
      [
        { text: "Annuler", style: "cancel" },
        { text: "Résilier", style: "destructive", onPress: () => cancelPlan() },
      ],
    );
  };

  const { mutate: deleteAccount, isPending: isDeletingAccount } = useMutation({
    mutationFn: () => userService.deleteAccount(),
    onSuccess: () => {
      logout();
      router.replace("/(auth)/login");
    },
    onError: () => {
      Alert.alert("Erreur", "Impossible de supprimer le compte. Réessayez plus tard.");
    },
  });

  const handleDeleteAccount = () => {
    Alert.alert(
      "Supprimer mon compte",
      isGerante
        ? "Cette action est irréversible. Vos boutiques, créatrices, ventes et statistiques seront définitivement supprimées."
        : "Cette action est irréversible. Votre compte et vos informations personnelles seront définitivement supprimés.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Continuer",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Dernière confirmation",
              "Voulez-vous vraiment supprimer définitivement votre compte Encaissly ?",
              [
                { text: "Annuler", style: "cancel" },
                {
                  text: "Oui, supprimer",
                  style: "destructive",
                  onPress: () => deleteAccount(),
                },
              ],
            );
          },
        },
      ],
    );
  };

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Voulez-vous vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Se déconnecter",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission refusée",
        "Autorisez l'accès à la galerie dans les paramètres de l'app.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      uploadAvatar({ uri: asset.uri, mimeType: asset.mimeType ?? "image/jpeg" });
    }
  };

  const initiales =
    [user?.prenom?.[0], user?.nom?.[0]].filter(Boolean).join("").toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    "?";

  const displayName =
    [user?.prenom, user?.nom].filter(Boolean).join(" ") || "Mon compte";

  // Décale les indices d'animation si CREATRICE a une section boutique
  const cardIdx = (n: number) => (isGerante ? n : n + 1);

  const cgvHint = (
    <TouchableOpacity onPress={() => router.push("/(auth)/legal")} activeOpacity={0.7} style={{ marginTop: 8 }}>
      <Text style={s.cgvHint}>
        Sans engagement, résiliable à tout moment. En vous abonnant, vous acceptez les <Text style={s.cgvLink}>CGV</Text>.
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Header ── */}
      <Animated.View
        style={[
          s.header,
          { paddingTop: 20 },
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
        <TouchableOpacity
          onPress={handlePickAvatar}
          activeOpacity={0.85}
          style={s.avatarWrap}
          disabled={isUploadingAvatar}
        >
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={s.avatarImg} />
          ) : (
            <View style={s.avatarPlaceholder}>
              <Text style={s.avatarTxt}>{initiales}</Text>
            </View>
          )}
          <View style={s.cameraBtn}>
            {isUploadingAvatar ? (
              <Text style={{ color: "#fff", fontSize: 8 }}>...</Text>
            ) : (
              <AntDesign name="camera" size={11} color="#fff" />
            )}
          </View>
        </TouchableOpacity>

        <Text style={s.name}>{displayName}</Text>
        <Text style={s.emailTxt}>{user?.email}</Text>
        <View style={s.badgeRow}>
          <View style={[s.badge, { backgroundColor: Colors.primary }]}>
            <Text style={s.badgeTxt}>{isGerante ? "Gérante" : "Créatrice"}</Text>
          </View>
          {isPlanDuo ? (
            <View style={[s.badge, { backgroundColor: Colors.duo }]}>
              <Text style={s.badgeTxt}>DUO</Text>
            </View>
          ) : (
            <View style={[s.badge, { backgroundColor: isPro ? Colors.successSolid : Colors.neutralSolid }]}>
              <Text style={s.badgeTxt}>{isPro ? "✨ PRO" : "FREE"}</Text>
            </View>
          )}
        </View>
      </Animated.View>

      <View style={s.body}>

        {/* ── Sous-onglets du compte ── */}
        <View style={s.tabs} accessibilityRole="tablist">
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[s.tab, tab === t.key && s.tabActive]}
              onPress={() => setTab(t.key)}
              activeOpacity={0.8}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === t.key }}
            >
              <Text style={[s.tabTxt, tab === t.key && s.tabTxtActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {tab === "profil" && (
          <>
        {/* ── Mon compte ── */}
        <Text style={s.sectionTitle}>Mon compte</Text>

        <AnimCard index={cardIdx(0)} style={s.card}>
          <InfoRow icon="mail" label="Email" value={user?.email ?? "—"} />
          <View style={s.divider} />

          {isEditing ? (
            <>
              <EditField
                label="Prénom"
                value={editPrenom}
                onChangeText={setEditPrenom}
                placeholder="Votre prénom"
              />
              <View style={s.divider} />
              <EditField
                label="Nom"
                value={editNom}
                onChangeText={setEditNom}
                placeholder="Votre nom"
              />
              <View style={s.divider} />
              <View style={s.editActions}>
                <TouchableOpacity style={s.cancelBtn} onPress={handleCancelEdit} activeOpacity={0.75}>
                  <Text style={s.cancelBtnTxt}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.saveBtn, isSaving && { opacity: 0.6 }]}
                  onPress={() => saveProfile()}
                  disabled={isSaving}
                  activeOpacity={0.85}
                >
                  <Text style={s.saveBtnTxt}>{isSaving ? "..." : "Enregistrer"}</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <InfoRow icon="user" label="Prénom" value={user?.prenom || "—"} />
              <View style={s.divider} />
              <InfoRow icon="idcard" label="Nom" value={user?.nom || "—"} />
              <View style={s.divider} />
              <InfoRow
                icon="calendar"
                label="Depuis"
                value={
                  user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("fr-FR", {
                        month: "long",
                        year: "numeric",
                      })
                    : "—"
                }
              />
              <View style={s.divider} />
              <TouchableOpacity style={s.editBtn} onPress={() => setIsEditing(true)} activeOpacity={0.75}>
                <AntDesign name="edit" size={14} color={Colors.text} style={{ marginRight: 6 }} />
                <Text style={s.editBtnTxt}>Modifier le nom / prénom</Text>
              </TouchableOpacity>
            </>
          )}
        </AnimCard>

        {/* ── Préférences ── */}
        <Text style={s.sectionTitle}>Préférences</Text>

        <AnimCard index={cardIdx(1)} style={s.card}>
          <View style={s.switchRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={s.switchLabel}>Notifications email</Text>
              <Text style={s.switchDesc}>Recevez un email à chaque vente enregistrée</Text>
            </View>
            <Switch
              value={notifEmail}
              onValueChange={handleToggleNotif}
              disabled={isTogglingNotif}
              trackColor={{ false: Colors.borderStrong, true: Colors.primaryLight }}
              thumbColor={notifEmail ? Colors.primary : "#f4f3f4"}
              ios_backgroundColor={Colors.borderStrong}
            />
          </View>
        </AnimCard>

          </>
        )}

        {tab === "abonnement" && (
          <>
        {/* ── Abonnement ── */}
        <Text style={s.sectionTitle}>Abonnement</Text>

        <AnimCard index={cardIdx(2)} style={s.card}>
          {isPlanDuo ? (
            <View style={s.proBlock}>
              <View style={s.proHeader}>
                <Text style={[s.proTitle, { color: Colors.duo }]}>DUO</Text>
                <View style={[s.proActiveBadge, { backgroundColor: Colors.duoTint }]}>
                  <Text style={[s.proActiveTxt, { color: Colors.duo }]}>Actif</Text>
                </View>
              </View>
              <Text style={s.proDesc}>
                Boutique + Créatrice · Multi-boutiques · Stats avancées · Historique complet
              </Text>
              <View style={s.divider} />
              <TouchableOpacity
                style={s.resilierBtn}
                onPress={handleResilier}
                disabled={isCancelling}
                activeOpacity={0.75}
              >
                <Text style={s.resilierTxt}>
                  {isCancelling ? "Résiliation en cours..." : "Résilier l'abonnement"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : isPro ? (
            <View style={s.proBlock}>
              <View style={s.proHeader}>
                <Text style={s.proTitle}>✨ Plan PRO</Text>
                <View style={s.proActiveBadge}>
                  <Text style={s.proActiveTxt}>Actif</Text>
                </View>
              </View>
              <Text style={s.proDesc}>
                Multi-boutiques · Stats avancées · Historique complet · Exports illimités sans filigrane
              </Text>
              <View style={s.divider} />
              <TouchableOpacity
                style={s.resilierBtn}
                onPress={handleResilier}
                disabled={isCancelling}
                activeOpacity={0.75}
              >
                <Text style={s.resilierTxt}>
                  {isCancelling ? "Résiliation en cours..." : "Résilier l'abonnement"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : isDuo ? (
            /* GERANTE_CREATRICE FREE → upgrade DUO uniquement */
            <View style={s.freeBlock}>
              <Text style={s.freeTitle}>Plan FREE</Text>
              <Text style={s.freeDesc}>
                Accédez aux fonctionnalités Gérante ET Créatrice avec un seul abonnement DUO.
              </Text>
              <View style={s.divider} />
              <Text style={s.upgradeLabel}>Débloquez tout avec DUO</Text>
              <View style={s.upgradeFeatures}>
                {[
                  "Gérante + Créatrice sur un seul compte",
                  "Multi-boutiques · Stats avancées",
                  "Historique complet · Exports illimités",
                ].map((f) => (
                  <View key={f} style={s.featureRow}>
                    <AntDesign name="check-circle" size={13} color={Colors.duo} style={{ marginRight: 6 }} />
                    <Text style={s.featureTxt}>{f}</Text>
                  </View>
                ))}
              </View>
              <View style={s.periodToggle}>
                <TouchableOpacity
                  style={[s.periodBtn, billingPeriod === "monthly" && s.periodBtnActive]}
                  onPress={() => setBillingPeriod("monthly")}
                  activeOpacity={0.8}
                >
                  <Text style={[s.periodTxt, billingPeriod === "monthly" && s.periodTxtActive]}>
                    Mensuel · 15€
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.periodBtn, billingPeriod === "annual" && s.periodBtnActive]}
                  onPress={() => setBillingPeriod("annual")}
                  activeOpacity={0.8}
                >
                  <Text style={[s.periodTxt, billingPeriod === "annual" && s.periodTxtActive]}>
                    Annuel · 129€ 🏷️
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[s.duoBtn, isUpgradingDuo && { opacity: 0.6 }]}
                onPress={() => (PAIEMENT_ACTIF ? upgradeDuo() : alertPaiement())}
                disabled={isUpgradingDuo}
                activeOpacity={0.85}
              >
                <Text style={s.duoBtnTxt}>
                  {isUpgradingDuo ? "Ouverture..." : billingPeriod === "annual" ? "Passer en DUO — 129€/an" : "Passer en DUO — 15€/mois"}
                </Text>
              </TouchableOpacity>
              {cgvHint}
            </View>
          ) : (
            /* GERANTE ou CREATRICE FREE → upgrade PRO uniquement */
            <View style={s.freeBlock}>
              <Text style={s.freeTitle}>Plan FREE</Text>
              <Text style={s.freeDesc}>
                1 boutique · 3 créatrices max · Historique 1 mois · Export PDF avec filigrane
              </Text>
              <View style={s.divider} />
              <Text style={s.upgradeLabel}>Débloquez tout avec PRO</Text>
              <View style={s.upgradeFeatures}>
                {[
                  "Multi-boutiques",
                  "Historique complet (3 mois+)",
                  "Stats avancées par créatrice",
                  "CSV & Excel sans limite",
                  "PDF sans filigrane",
                ].map((f) => (
                  <View key={f} style={s.featureRow}>
                    <AntDesign name="check-circle" size={13} color={Colors.successSolid} style={{ marginRight: 6 }} />
                    <Text style={s.featureTxt}>{f}</Text>
                  </View>
                ))}
              </View>
              <View style={s.periodToggle}>
                <TouchableOpacity
                  style={[s.periodBtn, billingPeriod === "monthly" && s.periodBtnActive]}
                  onPress={() => setBillingPeriod("monthly")}
                  activeOpacity={0.8}
                >
                  <Text style={[s.periodTxt, billingPeriod === "monthly" && s.periodTxtActive]}>
                    Mensuel · 9€
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.periodBtn, billingPeriod === "annual" && s.periodBtnActive]}
                  onPress={() => setBillingPeriod("annual")}
                  activeOpacity={0.8}
                >
                  <Text style={[s.periodTxt, billingPeriod === "annual" && s.periodTxtActive]}>
                    Annuel · 79€ 🏷️
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity
                style={[s.upgradeBtn, isUpgradingPro && { opacity: 0.6 }]}
                onPress={() => (PAIEMENT_ACTIF ? upgradePro() : alertPaiement())}
                disabled={isUpgradingPro}
                activeOpacity={0.85}
              >
                <AntDesign name="star" size={14} color="#fff" style={{ marginRight: 6 }} />
                <Text style={s.upgradeBtnTxt}>
                  {isUpgradingPro ? "Ouverture..." : billingPeriod === "annual" ? "Passer à PRO — 79€/an" : "Passer à PRO — 9€/mois"}
                </Text>
              </TouchableOpacity>
              {cgvHint}
            </View>
          )}
        </AnimCard>

          </>
        )}

        {tab === "aide" && (
          <>
        {/* ── Contact (phase de test) ── */}
        <Text style={s.sectionTitle}>Un bug ? Une idée ?</Text>
        <AnimCard index={cardIdx(4)} style={s.card}>
          <TouchableOpacity style={s.createBoutiqueBtn} onPress={ecrireContact} activeOpacity={0.75}>
            <AntDesign name="mail" size={14} color={Colors.primary} style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={s.createBoutiqueTxt}>Nous écrire</Text>
              <Text style={s.createBoutiqueDesc}>
                Encaissly est en phase de test : signale un bug ou propose une amélioration, chaque message est lu.
              </Text>
              <Text style={s.createBoutiqueDesc} selectable>{CONTACT_EMAIL}</Text>
            </View>
            <AntDesign name="right" size={12} color={Colors.textLight} />
          </TouchableOpacity>
        </AnimCard>

        {/* ── Aide ── */}
        <Text style={s.sectionTitle}>Aide</Text>
        <AnimCard index={cardIdx(4)} style={s.card}>
          <TouchableOpacity
            style={s.createBoutiqueBtn}
            onPress={() => router.push("/(app)/aide")}
            activeOpacity={0.75}
          >
            <AntDesign name="question-circle" size={14} color={Colors.primary} style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={s.createBoutiqueTxt}>Guide complet</Text>
              <Text style={s.createBoutiqueDesc}>
                Comment faire chaque action importante dans l'app
              </Text>
            </View>
            <AntDesign name="right" size={12} color={Colors.textLight} />
          </TouchableOpacity>
          <View style={s.divider} />
          <TouchableOpacity
            style={s.legalLink}
            onPress={() => router.push("/(auth)/legal")}
            activeOpacity={0.75}
          >
            <AntDesign name="file" size={13} color={Colors.primary} style={{ marginRight: 6 }} />
            <Text style={s.legalLinkTxt}>Informations légales (CGU, CGV, confidentialité)</Text>
          </TouchableOpacity>
        </AnimCard>

          </>
        )}

        {tab === "profil" && (
          <>
        {/* ── Déconnexion ── */}
        <AnimCard index={cardIdx(5)} style={{ marginTop: 8 }}>
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout} activeOpacity={0.85}>
            <AntDesign name="logout" size={16} color={Colors.error} style={{ marginRight: 8 }} />
            <Text style={s.logoutTxt}>Se déconnecter</Text>
          </TouchableOpacity>
        </AnimCard>

        {/* ── Zone de danger ── */}
        <AnimCard index={cardIdx(6)} style={{ marginTop: 10 }}>
          <TouchableOpacity
            style={s.deleteAccountBtn}
            onPress={handleDeleteAccount}
            disabled={isDeletingAccount}
            activeOpacity={0.75}
          >
            <Text style={s.deleteAccountTxt}>
              {isDeletingAccount ? "Suppression en cours..." : "Supprimer mon compte"}
            </Text>
          </TouchableOpacity>
        </AnimCard>

          </>
        )}

        <Text style={s.footer}>
          Encaissly · La caisse intelligente des boutiques de créateurs
        </Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 3,
    marginTop: 16,
    marginBottom: 4,
  },
  tab: { flex: 1, minHeight: 38, alignItems: "center", justifyContent: "center", borderRadius: Radius.pill },
  tabActive: { backgroundColor: Colors.primary },
  tabTxt: { fontFamily: Fonts.family.nowMedium, fontSize: 12.5, color: Colors.textLight },
  tabTxtActive: { fontFamily: Fonts.family.nowBold, color: "#fff" },

  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 56,
  },

  // Header crème centré — même DA que le web
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    alignItems: "center",
  },
  avatarWrap: {
    width: 80,
    height: 80,
    marginBottom: 12,
    position: "relative",
  },
  avatarImg: {
    width: 80,
    height: 80,
    borderRadius: Radius.lg,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800",
    fontSize: 30,
    color: "#fff",
  },
  cameraBtn: {
    position: "absolute",
    bottom: -4,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.text,
    borderWidth: 2,
    borderColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800",
    fontSize: 26,
    color: Colors.text,
    letterSpacing: -0.3,
    marginBottom: 2,
  },
  emailTxt: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 11,
    color: "#fff",
  },

  // Body
  body: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800",
    fontSize: Fonts.sizes.lg,
    color: Colors.text,
    letterSpacing: -0.3,
    marginBottom: 10,
    marginTop: 8,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 16,
    ...shadows.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  emptyTxt: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: 13,
    color: Colors.textLight,
    textAlign: "center",
    paddingVertical: 4,
  },
  createBoutiqueBtn: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 44,
    paddingVertical: 4,
  },
  createBoutiqueTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 2,
  },
  createBoutiqueDesc: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: 12,
    color: Colors.textLight,
    lineHeight: 16,
  },
  createBoutiqueLabel: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 6,
  },

  // Info rows (lecture)
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 28,
  },
  infoIcon: {
    marginRight: 10,
    width: 20,
  },
  infoLabel: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: 13,
    color: Colors.textLight,
    width: 72,
  },
  infoValue: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: 14,
    color: Colors.text,
    flex: 1,
    textAlign: "right",
  },

  // Mode édition
  editFieldRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  editInput: {
    flex: 1,
    fontFamily: Fonts.family.nowRegular,
    fontSize: 14,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 10,
    textAlign: "right",
  },
  editActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  // = Button secondary / primary
  cancelBtn: {
    flex: 1,
    minHeight: 44,
    justifyContent: "center",
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
  },
  cancelBtnTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: 14,
    color: Colors.text,
  },
  saveBtn: {
    flex: 1,
    minHeight: 44,
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: Colors.text,
    alignItems: "center",
  },
  saveBtnTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 14,
    color: "#fff",
  },
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  editBtnTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: 14,
    color: Colors.text,
  },

  // Switch
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  switchLabel: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 2,
  },
  switchDesc: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: 12,
    color: Colors.textLight,
  },

  cgvHint: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: 11,
    color: Colors.textLight,
    textAlign: "center",
  },
  cgvLink: { color: Colors.primary, textDecorationLine: "underline" },
  // PRO block
  proBlock: {
    gap: 8,
  },
  proHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  proTitle: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 16,
    color: Colors.primary,
  },
  proActiveBadge: {
    backgroundColor: Colors.successTint,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  proActiveTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 11,
    color: Colors.successDark,
  },
  proDesc: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 19,
  },
  resilierBtn: {
    minHeight: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  resilierTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: 14,
    color: Colors.error,
  },

  // FREE block
  freeBlock: {
    gap: 4,
  },
  freeTitle: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 15,
    color: Colors.text,
  },
  freeDesc: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: 4,
  },
  upgradeLabel: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 13,
    color: Colors.primary,
    marginTop: 4,
    marginBottom: 8,
  },
  upgradeFeatures: {
    gap: 5,
    marginBottom: 14,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureTxt: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: 13,
    color: Colors.text,
  },
  // Bascule mensuel/annuel — accent violet volontaire (moment d'upsell, comme le web)
  periodToggle: {
    flexDirection: "row",
    backgroundColor: Colors.primaryTint,
    borderRadius: Radius.md,
    padding: 3,
    marginBottom: 12,
  },
  periodBtn: {
    flex: 1,
    minHeight: 36,
    justifyContent: "center",
    borderRadius: Radius.sm,
    alignItems: "center",
  },
  periodBtnActive: {
    backgroundColor: Colors.primary,
  },
  periodTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: 12,
    color: Colors.textLight,
  },
  periodTxtActive: {
    color: "#fff",
  },

  upgradeBtn: {
    backgroundColor: Colors.text,
    borderRadius: Radius.md,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  upgradeBtnTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 15,
    color: "#fff",
  },

  // DUO block — garde son orange d'identité (comme le web)
  duoCard: {
    backgroundColor: Colors.warningTint,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: Colors.duo,
  },
  duoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 6,
  },
  duoTitle: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 16,
    color: Colors.duo,
  },
  duoDesc: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 19,
    marginBottom: 14,
  },
  duoBtn: {
    backgroundColor: Colors.duo,
    borderRadius: Radius.md,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  duoBtnTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 15,
    color: "#fff",
  },

  // Aide
  legalLink: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 40,
  },
  legalLinkTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: 14,
    color: Colors.primary,
    textDecorationLine: "underline",
  },

  // Logout (= Button dangerOutline pleine largeur)
  logoutBtn: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logoutTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 15,
    color: Colors.error,
  },

  // Suppression de compte — délibérément discret, pas un bouton principal
  deleteAccountBtn: {
    minHeight: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteAccountTxt: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: 12,
    color: Colors.textLight,
    textDecorationLine: "underline",
  },

  // Footer
  footer: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: 11,
    color: Colors.textLight,
    textAlign: "center",
    marginTop: 24,
    opacity: 0.8,
  },
});
