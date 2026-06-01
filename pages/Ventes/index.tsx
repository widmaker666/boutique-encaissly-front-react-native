import { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { venteService, creatriceService, articleService } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import type { Vente, Creatrice, Article, ModePaiement } from "@/types";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { styles, getAvatarColor } from "@/styles/pages/ventes.style";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ── AnimCard ──────────────────────────────────────────────────────────────────

function AnimCard({
  children,
  index,
  style,
}: {
  children: React.ReactNode;
  index: number;
  style?: object;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 320,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0],
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

// ── BadgePaiement ─────────────────────────────────────────────────────────────

function BadgePaiement({ mode }: { mode: ModePaiement }) {
  const isEspeces = mode === "ESPECES";
  return (
    <View
      style={[
        styles.badgePaiement,
        isEspeces ? styles.badgeEspeces : styles.badgeCarte,
      ]}
    >
      <Text
        style={[
          styles.badgeTxt,
          isEspeces ? styles.badgeTxtEspeces : styles.badgeTxtCarte,
        ]}
      >
        {isEspeces ? "ESPECES" : "CARTE"}
      </Text>
    </View>
  );
}

// ── BottomSheetCreation ───────────────────────────────────────────────────────

type Step = 1 | 2;

interface FormState {
  nomArticle: string;
  prixVente: string;
  modePaiement: ModePaiement;
  creatriceId: string;
  creatriceNom: string;
  articleId?: string;
}

function BottomSheetCreation({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>(1);
  const [selectedCreatriceId, setSelectedCreatriceId] = useState<string | null>(
    null
  );
  const [form, setForm] = useState<FormState>({
    nomArticle: "",
    prixVente: "",
    modePaiement: "ESPECES",
    creatriceId: "",
    creatriceNom: "",
    articleId: undefined,
  });

  const slideAnim = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start();
    } else {
      slideAnim.setValue(400);
      // reset on close
      setStep(1);
      setSelectedCreatriceId(null);
      setForm({
        nomArticle: "",
        prixVente: "",
        modePaiement: "ESPECES",
        creatriceId: "",
        creatriceNom: "",
        articleId: undefined,
      });
    }
  }, [visible]);

  const { data: creatrices, isLoading: loadingCreatrices } = useQuery({
    queryKey: ["creatrices"],
    queryFn: creatriceService.getAll,
    enabled: visible,
  });

  const { data: articles, isLoading: loadingArticles } = useQuery({
    queryKey: ["articles", selectedCreatriceId],
    queryFn: () => articleService.getAll(selectedCreatriceId!),
    enabled: !!selectedCreatriceId,
  });

  const mutation = useMutation({
    mutationFn: venteService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ventes"] });
      queryClient.invalidateQueries({ queryKey: ["articles", form.creatriceId] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      onClose();
    },
  });

  const handleSelectCreatrice = (c: Creatrice) => {
    setSelectedCreatriceId(c.id);
  };

  const handleSelectArticle = (a: Article) => {
    setForm((prev) => ({
      ...prev,
      nomArticle: a.nom,
      prixVente: a.prixIndicatif ? String(a.prixIndicatif) : "",
      articleId: a.id,
      creatriceId: selectedCreatriceId!,
      creatriceNom:
        creatrices?.find((c: Creatrice) => c.id === selectedCreatriceId)?.nom ??
        "",
    }));
    setStep(2);
  };

  const handleSubmit = () => {
    const prix = parseFloat(form.prixVente);
    if (!form.nomArticle.trim() || isNaN(prix) || prix <= 0 || !form.creatriceId)
      return;
    mutation.mutate({
      nomArticle: form.nomArticle.trim(),
      prixVente: prix,
      modePaiement: form.modePaiement,
      creatriceId: form.creatriceId,
      articleId: form.articleId,
    });
  };

  const canSubmit =
    form.nomArticle.trim().length > 0 &&
    parseFloat(form.prixVente) > 0 &&
    form.creatriceId.length > 0 &&
    !mutation.isPending;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.sheetHandle} />

          {/* En-tête sheet */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitre}>NOUVELLE VENTE</Text>
            <TouchableOpacity style={styles.sheetClose} onPress={onClose}>
              <Text style={styles.sheetCloseTxt}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.sheetScroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* ── ÉTAPE 1 : Sélection créatrice + article ── */}
            {step === 1 && (
              <>
                {/* Indicateur étape 1 */}
                <View style={styles.stepIndicator}>
                  <View style={[styles.stepBubble, styles.stepBubbleActive]}>
                    <Text style={styles.stepNum}>1</Text>
                  </View>
                  <Text style={[styles.stepLabel, styles.stepLabelActive]}>
                    CRÉATRICE ET ARTICLE
                  </Text>
                </View>

                {loadingCreatrices ? (
                  <ActivityIndicator color={Colors.primary} />
                ) : (
                  creatrices?.map((c: Creatrice, idx: number) => {
                    const isSelected = selectedCreatriceId === c.id;
                    return (
                      <View key={c.id}>
                        <TouchableOpacity
                          style={[
                            styles.creatriceRow,
                            isSelected && styles.creatriceRowSelected,
                          ]}
                          activeOpacity={0.75}
                          onPress={() => handleSelectCreatrice(c)}
                        >
                          <View
                            style={[
                              styles.creatriceAvatar,
                              { backgroundColor: getAvatarColor(idx) },
                            ]}
                          >
                            <Text style={styles.creatriceAvatarTxt}>
                              {c.nom.substring(0, 2).toUpperCase()}
                            </Text>
                          </View>
                          <Text style={styles.creatriceNom}>{c.nom}</Text>
                          <Text style={styles.creatriceArrow}>
                            {isSelected ? "▾" : "›"}
                          </Text>
                        </TouchableOpacity>

                        {/* Articles de la créatrice sélectionnée */}
                        {isSelected && (
                          <View style={styles.articlesSection}>
                            <Text style={styles.articlesSectionTitle}>
                              Articles de {c.nom}
                            </Text>
                            {loadingArticles ? (
                              <ActivityIndicator
                                color={Colors.primary}
                                size="small"
                              />
                            ) : articles && articles.length > 0 ? (
                              articles.map((a: Article) => (
                                <View key={a.id} style={styles.articleRow}>
                                  <Text
                                    style={styles.articleNom}
                                    numberOfLines={1}
                                  >
                                    {a.nom}
                                  </Text>
                                  {a.prixIndicatif != null && (
                                    <Text style={styles.articlePrix}>
                                      {a.prixIndicatif} €
                                    </Text>
                                  )}
                                  <TouchableOpacity
                                    style={styles.articleSelectBtn}
                                    activeOpacity={0.8}
                                    onPress={() => handleSelectArticle(a)}
                                  >
                                    <Text style={styles.articleSelectTxt}>
                                      Choisir
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              ))
                            ) : (
                              <Text style={styles.noArticleTxt}>
                                Aucun article pour cette créatrice
                              </Text>
                            )}

                            {/* Continuer sans article */}
                            <TouchableOpacity
                              style={[styles.submitBtn, { marginTop: 16 }]}
                              activeOpacity={0.85}
                              onPress={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  creatriceId: c.id,
                                  creatriceNom: c.nom,
                                  articleId: undefined,
                                }));
                                setStep(2);
                              }}
                            >
                              <Text style={styles.submitTxt}>
                                SAISIR MANUELLEMENT ›
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    );
                  })
                )}
              </>
            )}

            {/* ── ÉTAPE 2 : Formulaire vente ── */}
            {step === 2 && (
              <>
                {/* Retour */}
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => setStep(1)}
                >
                  <Text style={styles.backBtnTxt}>‹ Changer de créatrice</Text>
                </TouchableOpacity>

                {/* Indicateur étape 2 */}
                <View style={styles.stepIndicator}>
                  <View style={[styles.stepBubble, styles.stepBubbleActive]}>
                    <Text style={styles.stepNum}>2</Text>
                  </View>
                  <Text style={[styles.stepLabel, styles.stepLabelActive]}>
                    DÉTAILS DE LA VENTE
                  </Text>
                </View>

                {/* Banner créatrice sélectionnée */}
                {form.creatriceNom.length > 0 && (
                  <View style={styles.selectedCreatriceBanner}>
                    <Text style={{ fontSize: 16 }}>👤</Text>
                    <Text style={styles.selectedCreatriceBannerTxt}>
                      {form.creatriceNom}
                    </Text>
                  </View>
                )}

                {/* Nom article */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Nom de l'article</Text>
                  <TextInput
                    style={styles.formInput}
                    value={form.nomArticle}
                    onChangeText={(v) =>
                      setForm((prev) => ({ ...prev, nomArticle: v }))
                    }
                    placeholder="Ex : Boucles dorées"
                    placeholderTextColor={Colors.textLight}
                    returnKeyType="next"
                  />
                </View>

                {/* Prix */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Prix de vente (€)</Text>
                  <TextInput
                    style={styles.formInput}
                    value={form.prixVente}
                    onChangeText={(v) =>
                      setForm((prev) => ({ ...prev, prixVente: v }))
                    }
                    placeholder="0.00"
                    placeholderTextColor={Colors.textLight}
                    keyboardType="decimal-pad"
                    returnKeyType="done"
                  />
                </View>

                {/* Mode paiement */}
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Mode de paiement</Text>
                  <View style={styles.modePaiementRow}>
                    {(["ESPECES", "CARTE"] as ModePaiement[]).map((m) => (
                      <TouchableOpacity
                        key={m}
                        style={[
                          styles.modeChip,
                          form.modePaiement === m && styles.modeChipActive,
                        ]}
                        activeOpacity={0.8}
                        onPress={() =>
                          setForm((prev) => ({ ...prev, modePaiement: m }))
                        }
                      >
                        <Text
                          style={[
                            styles.modeChipTxt,
                            form.modePaiement === m && styles.modeChipTxtActive,
                          ]}
                        >
                          {m === "ESPECES" ? "ESPECES" : "CARTE"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Erreur mutation */}
                {mutation.isError && (
                  <Text
                    style={{
                      fontFamily: Fonts.family.nowLight,
                      fontSize: 12,
                      color: Colors.error,
                      marginBottom: 12,
                      textAlign: "center",
                    }}
                  >
                    Erreur lors de l'enregistrement. Réessaye.
                  </Text>
                )}

                {/* Submit */}
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    !canSubmit && styles.submitBtnDisabled,
                  ]}
                  activeOpacity={0.85}
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                >
                  {mutation.isPending ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitTxt}>ENREGISTRER LA VENTE</Text>
                  )}
                </TouchableOpacity>
              </>
            )}
          </ScrollView>

          {/* Safe area bottom */}
          <View style={{ height: insets.bottom }} />
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── VentesScreen ──────────────────────────────────────────────────────────────

type FilterMode = "TOUT" | "ESPECES" | "CARTE";

export default function VentesScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const [filter, setFilter] = useState<FilterMode>("TOUT");
  const [sheetVisible, setSheetVisible] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const queryFilters =
    filter === "TOUT" ? {} : { modePaiement: filter };

  const { data: ventes, isLoading } = useQuery<Vente[]>({
    queryKey: ["ventes", filter],
    queryFn: () => venteService.getAll(queryFilters),
  });

  const count = ventes?.length ?? 0;

  const isGerante = user?.role === "GERANTE";

  return (
    <View style={styles.container}>
      {/* Header animé */}
      <Animated.View
        style={[
          styles.header,
          { paddingTop: insets.top + 16 },
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-16, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View>
          <Text style={styles.titre}>VENTES</Text>
          <Text style={styles.headerSub}>
            {count} vente{count > 1 ? "s" : ""} · {user?.plan ?? "FREE"}
          </Text>
        </View>
        {isGerante && (
          <TouchableOpacity
            style={styles.addBtn}
            activeOpacity={0.8}
            onPress={() => setSheetVisible(true)}
          >
            <Text style={styles.addBtnTxt}>+</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Filtres chips */}
      <View style={styles.filtersWrapper}>
        {(["TOUT", "ESPECES", "CARTE"] as FilterMode[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filter === f && styles.chipActive]}
            activeOpacity={0.8}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[styles.chipTxt, filter === f && styles.chipTxtActive]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Liste */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {ventes && ventes.length > 0 ? (
            ventes.map((v: Vente, index: number) => (
              <AnimCard key={v.id} index={index} style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={styles.cardLeft}>
                    <Text style={styles.cardNomArticle} numberOfLines={2}>
                      {v.nomArticle}
                    </Text>
                    {v.creatrice?.nom && (
                      <Text style={styles.cardCreatrice} numberOfLines={1}>
                        {v.creatrice.nom}
                      </Text>
                    )}
                  </View>
                  <View style={styles.cardRight}>
                    <Text style={styles.cardPrix}>{v.prixVente} €</Text>
                    <BadgePaiement mode={v.modePaiement} />
                  </View>
                </View>
                <Text style={styles.cardDate}>{formatDate(v.createdAt)}</Text>
              </AnimCard>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🧾</Text>
              <Text style={styles.emptyTxt}>Aucune vente</Text>
              <Text style={styles.emptySub}>
                {filter !== "TOUT"
                  ? `Aucune vente en ${filter}`
                  : isGerante
                  ? "Appuie sur + pour enregistrer la première vente"
                  : "Aucune vente enregistrée pour le moment"}
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Bottom sheet création */}
      <BottomSheetCreation
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
      />
    </View>
  );
}
