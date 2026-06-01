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
} from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { creatriceService } from "@/services/api";
import { modalStyles as s } from "@/styles/components/modalCreation.style";

interface Props {
  visible: boolean;
  onClose: () => void;
}

interface FormState {
  nom: string;
  email: string;
  telephone: string;
  tauxDeCommission: string;
}

const INITIAL_FORM: FormState = {
  nom: "",
  email: "",
  telephone: "",
  tauxDeCommission: "",
};

export default function ModalCreation({ visible, onClose }: Props) {
  const queryClient = useQueryClient();
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [focused, setFocused] = useState<keyof FormState | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  //- Slide-up à l'ouverture, slide-down à la fermeture
  useEffect(() => {
    if (visible) {
      setForm(INITIAL_FORM);
      setErrorMsg(null);
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
    mutationFn: creatriceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["creatrices"] });
      onClose();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Erreur lors de la création";
      setErrorMsg(typeof msg === "string" ? msg : JSON.stringify(msg));
    },
  });

  const handleCreate = () => {
    setErrorMsg(null);

    if (!form.nom.trim()) {
      setErrorMsg("Le nom est obligatoire.");
      return;
    }
    const taux = parseFloat(form.tauxDeCommission.replace(",", "."));
    if (isNaN(taux) || taux < 0 || taux > 100) {
      setErrorMsg("Taux de commission invalide (0–100).");
      return;
    }

    mutate({
      nom: form.nom.trim(),
      email: form.email.trim() || undefined,
      telephone: form.telephone.trim() || undefined,
      tauxDeCommission: taux,
    });
  };

  const handleClose = () => {
    if (isPending) return;
    onClose();
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0],
  });

  const canSubmit = form.nom.trim().length > 0 && form.tauxDeCommission.trim().length > 0 && !isPending;

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
        {/* Fond semi-transparent — tap ferme */}
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={s.overlay}>
            {/* Sheet animée — stoppe la propagation du tap */}
            <TouchableWithoutFeedback onPress={() => {}}>
              <Animated.View style={[s.sheet, { transform: [{ translateY }] }]}>
                {/* Handle bar */}
                <View style={s.handle} />

                {/* Header */}
                <View style={s.headerRow}>
                  <Text style={s.titre}>NOUVELLE CRÉATRICE</Text>
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
                  {/* NOM * */}
                  <Text style={s.label}>
                    NOM <Text style={s.labelRequired}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      s.input,
                      focused === "nom" && s.inputFocused,
                      errorMsg && !form.nom.trim() && s.inputError,
                    ]}
                    placeholder="Marie Dupont"
                    placeholderTextColor="#b0b0b0"
                    value={form.nom}
                    onChangeText={(v) => setForm((f) => ({ ...f, nom: v }))}
                    onFocus={() => setFocused("nom")}
                    onBlur={() => setFocused(null)}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />

                  {/* EMAIL */}
                  <Text style={s.label}>EMAIL</Text>
                  <TextInput
                    style={[s.input, focused === "email" && s.inputFocused]}
                    placeholder="marie@example.com"
                    placeholderTextColor="#b0b0b0"
                    value={form.email}
                    onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                  />

                  {/* TÉLÉPHONE */}
                  <Text style={s.label}>TÉLÉPHONE</Text>
                  <TextInput
                    style={[s.input, focused === "telephone" && s.inputFocused]}
                    placeholder="06 12 34 56 78"
                    placeholderTextColor="#b0b0b0"
                    value={form.telephone}
                    onChangeText={(v) =>
                      setForm((f) => ({ ...f, telephone: v }))
                    }
                    onFocus={() => setFocused("telephone")}
                    onBlur={() => setFocused(null)}
                    keyboardType="phone-pad"
                    returnKeyType="next"
                  />

                  {/* TAUX DE COMMISSION * */}
                  <Text style={s.label}>
                    TAUX DE COMMISSION (%) <Text style={s.labelRequired}>*</Text>
                  </Text>
                  <TextInput
                    style={[
                      s.input,
                      focused === "tauxDeCommission" && s.inputFocused,
                      errorMsg &&
                        !form.tauxDeCommission.trim() &&
                        s.inputError,
                    ]}
                    placeholder="15"
                    placeholderTextColor="#b0b0b0"
                    value={form.tauxDeCommission}
                    onChangeText={(v) =>
                      setForm((f) => ({ ...f, tauxDeCommission: v }))
                    }
                    onFocus={() => setFocused("tauxDeCommission")}
                    onBlur={() => setFocused(null)}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                    onSubmitEditing={handleCreate}
                  />

                  {/* Error */}
                  {errorMsg && (
                    <View style={s.errorBox}>
                      <Text style={s.errorTxt}>{errorMsg}</Text>
                    </View>
                  )}

                  {/* CTA */}
                  <TouchableOpacity
                    style={[s.ctaBtn, !canSubmit && s.ctaBtnDisabled]}
                    onPress={handleCreate}
                    activeOpacity={0.85}
                    disabled={!canSubmit}
                  >
                    <Text style={s.ctaTxt}>
                      {isPending ? "CRÉATION..." : "CRÉER LA CRÉATRICE"}
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
