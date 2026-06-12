import { useRef, useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { creatriceService, boutiqueService } from "@/services/api";
import { modalStyles as s } from "@/styles/components/modalCreation.style";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { StyleSheet } from "react-native";

interface BoutiqueItem {
  id: string;
  nom: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  creatriceId: string;
}

export default function ModalInviter({ visible, onClose, creatriceId }: Props) {
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [selectedBoutiqueId, setSelectedBoutiqueId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data: boutiques, isLoading: loadingBoutiques } = useQuery<BoutiqueItem[]>({
    queryKey: ["boutiques-avec-stats"],
    queryFn: boutiqueService.getAvecStats,
    enabled: visible,
  });

  // Boutique résolue : sélection manuelle OU auto si 1 seule boutique disponible
  const effectiveBoutiqueId = selectedBoutiqueId ?? (boutiques?.length === 1 ? boutiques[0].id : null);

  useEffect(() => {
    if (visible) {
      setEmail("");
      setErrorMsg(null);
      setSuccessMsg(null);
      setSelectedBoutiqueId(null);
      Animated.spring(slideAnim, {
        toValue: 1,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      creatriceService.invite(creatriceId, email.trim(), effectiveBoutiqueId!),
    onSuccess: () => {
      setSuccessMsg("Invitation envoyée ✓");
      setTimeout(() => {
        onClose();
      }, 1400);
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Erreur lors de l'invitation";
      setErrorMsg(typeof msg === "string" ? msg : JSON.stringify(msg));
    },
  });

  const handleInvite = () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim()) {
      setErrorMsg("L'email est obligatoire.");
      return;
    }
    if (!effectiveBoutiqueId) {
      setErrorMsg("Sélectionnez une boutique.");
      return;
    }
    mutate();
  };

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0],
  });

  const canSubmit = email.trim().length > 0 && !!effectiveBoutiqueId && !isPending;
  const showBoutiquePicker = boutiques && boutiques.length > 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={s.overlay}>
            <TouchableWithoutFeedback onPress={() => {}}>
              <Animated.View style={[s.sheet, { transform: [{ translateY }] }]}>
                <View style={s.handle} />

                <View style={s.headerRow}>
                  <Text style={s.titre}>INVITER</Text>
                  <TouchableOpacity
                    style={s.closeBtn}
                    onPress={handleClose}
                    activeOpacity={0.7}
                  >
                    <Text style={s.closeBtnTxt}>×</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <Text style={s.label}>
                    EMAIL DE LA PERSONNE <Text style={s.labelRequired}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      s.input,
                      focused && s.inputFocused,
                      errorMsg && !email.trim() && s.inputError,
                    ]}
                    placeholder="marie@example.com"
                    placeholderTextColor="#b0b0b0"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleInvite}
                  />

                  {/* Boutique — chargement */}
                  {loadingBoutiques && (
                    <ActivityIndicator color={Colors.primary} style={localStyles.loader} />
                  )}

                  {/* Pas de boutique → message bloquant */}
                  {!loadingBoutiques && boutiques?.length === 0 && (
                    <View style={localStyles.noBoutiqueBox}>
                      <Text style={localStyles.noBoutiqueTxt}>
                        Vous n'avez pas encore de boutique.{"\n"}Créez-en une depuis le Dashboard avant d'inviter.
                      </Text>
                    </View>
                  )}

                  {/* 1 seule boutique → auto-sélectionnée, affichée en lecture seule */}
                  {!loadingBoutiques && boutiques?.length === 1 && (
                    <View style={localStyles.autoBoutiqueBox}>
                      <Text style={localStyles.autoBoutiqueLabel}>BOUTIQUE</Text>
                      <Text style={localStyles.autoBoutiqueName}>{boutiques[0].nom}</Text>
                    </View>
                  )}

                  {/* Plusieurs boutiques → picker */}
                  {showBoutiquePicker && (
                    <>
                      <Text style={[s.label, localStyles.labelBoutique]}>
                        BOUTIQUE <Text style={s.labelRequired}>*</Text>
                      </Text>
                      {boutiques.map((b) => (
                        <TouchableOpacity
                          key={b.id}
                          style={[
                            localStyles.boutiqueRow,
                            selectedBoutiqueId === b.id && localStyles.boutiqueRowSelected,
                          ]}
                          activeOpacity={0.75}
                          onPress={() => setSelectedBoutiqueId(b.id)}
                        >
                          <View
                            style={[
                              localStyles.radio,
                              selectedBoutiqueId === b.id && localStyles.radioSelected,
                            ]}
                          />
                          <Text
                            style={[
                              localStyles.boutiqueName,
                              selectedBoutiqueId === b.id && localStyles.boutiqueNameSelected,
                            ]}
                          >
                            {b.nom}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </>
                  )}

                  {successMsg && (
                    <View style={localStyles.successBox}>
                      <Text style={localStyles.successTxt}>{successMsg}</Text>
                    </View>
                  )}

                  {errorMsg && (
                    <View style={s.errorBox}>
                      <Text style={s.errorTxt}>{errorMsg}</Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[s.ctaBtn, !canSubmit && s.ctaBtnDisabled]}
                    onPress={handleInvite}
                    activeOpacity={0.85}
                    disabled={!canSubmit}
                  >
                    <Text style={s.ctaTxt}>
                      {isPending ? "ENVOI..." : "ENVOYER L'INVITATION"}
                    </Text>
                  </TouchableOpacity>
                </ScrollView>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const localStyles = StyleSheet.create({
  loader: {
    marginTop: 20,
  },
  labelBoutique: {
    marginTop: 20,
  },
  boutiqueRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    marginBottom: 8,
  },
  boutiqueRowSelected: {
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.primary + "08",
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.border,
    marginRight: 12,
  },
  radioSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  boutiqueName: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
  },
  boutiqueNameSelected: {
    color: Colors.primaryDark,
    fontFamily: Fonts.family.nowMedium,
  },
  noBoutiqueBox: {
    backgroundColor: "#fff3cd",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#ffc10740",
  },
  noBoutiqueTxt: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.xs,
    color: "#856404",
    lineHeight: 18,
    textAlign: "center",
  },
  autoBoutiqueBox: {
    backgroundColor: Colors.primary + "0d",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.primary + "30",
  },
  autoBoutiqueLabel: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: 10,
    color: Colors.primary,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  autoBoutiqueName: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },
  successBox: {
    backgroundColor: "#16a34a15",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#16a34a40",
  },
  successTxt: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.xs,
    color: "#16a34a",
  },
});
