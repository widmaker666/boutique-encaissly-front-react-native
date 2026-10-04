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
  Alert,
} from "react-native";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { venteService, creatriceService, articleService } from "@/services/api";
import { DuoModeToggle } from "@/components/DuoModeToggle";
import { useAuthStore } from "@/stores/auth.store";
import type { Vente, Creatrice, Article, ModePaiement } from "@/types";
import { Colors } from "@/constants/colors";
import { styles, getAvatarColor } from "@/styles/pages/ventes.style";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import Chip from "@/components/Chip/Chip";
import Button from "@/components/Buttons/Button";
import Badge from "@/components/Badge/Badge";
import ListRow from "@/components/List/ListRow";
import { Notice } from "@/components/Notice/Notice";

// ── Helpers ──────────────────────────────────────────────────────────────────

function round2(n: number | null | undefined): string {
  return (Math.round((n ?? 0) * 100) / 100).toFixed(2);
}

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

// ── BottomSheetCreation ───────────────────────────────────────────────────────

type Step = 1 | 2 | 3;

interface ArticleSelection {
  article: Article | null;
  nomManuel?: string;
  prixManuel?: number;
  quantite: number;
}

interface SelectedCreatrice {
  id: string;
  nom: string;
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
  const user = useAuthStore((state) => state.user);
  const isDuo = user?.role === "GERANTE_CREATRICE";
  const duoMode = useAuthStore((state) => state.duoMode);
  const isGerante = user?.role === "GERANTE" || (isDuo && duoMode === "GERANTE");
  const activeEvenementId = useAuthStore((state) => state.activeEvenementId);
  const [step, setStep] = useState<Step>(1);
  const [creatrice, setCreatrice] = useState<SelectedCreatrice | null>(null);
  const [selections, setSelections] = useState<ArticleSelection[]>([]);
  const [modePaiement, setModePaiement] = useState<ModePaiement>("ESPECES");
  const [sansCommission, setSansCommission] = useState(false);
  const [showManuelForm, setShowManuelForm] = useState(false);
  const [manuelNom, setManuelNom] = useState("");
  const [manuelPrix, setManuelPrix] = useState("");

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
      setStep(1);
      setCreatrice(null);
      setSelections([]);
      setModePaiement("ESPECES");
      setSansCommission(false);
      setShowManuelForm(false);
      setManuelNom("");
      setManuelPrix("");
    }
  }, [visible]);

  const { data: creatrices, isLoading: loadingCreatrices } = useQuery({
    queryKey: ["creatrices"],
    queryFn: creatriceService.getAll,
    enabled: visible,
  });

  //- Auto-sélection pour CREATRICE avec une seule fiche — saute directement aux articles
  useEffect(() => {
    if (!isGerante && creatrices?.length === 1 && step === 1 && !creatrice) {
      const c = creatrices[0];
      setCreatrice({ id: c.id, nom: c.nom });
      setStep(2);
    }
  }, [creatrices]);

  const { data: articles, isLoading: loadingArticles } = useQuery({
    queryKey: ["articles", activeEvenementId ?? creatrice?.id],
    queryFn: () =>
      activeEvenementId
        ? articleService.getAll({ evenementId: activeEvenementId })
        : articleService.getAll({ creatriceId: creatrice!.id }),
    enabled: !!creatrice?.id && step === 2,
  });

  const articlesFiltered: Article[] = articles ?? [];

  // ── Helpers sélection ────────────────────────────────────────────────────────

  const toggleArticle = (article: Article) => {
    setSelections((prev) => {
      const exists = prev.find((s) => s.article?.id === article.id);
      if (exists) {
        return prev.filter((s) => s.article?.id !== article.id);
      }
      return [...prev, { article, quantite: 1 }];
    });
  };

  const setQty = (articleId: string, delta: number) => {
    setSelections((prev) =>
      prev.map((s) => {
        if (s.article?.id !== articleId) return s;
        const next = Math.max(1, s.quantite + delta);
        return { ...s, quantite: next };
      })
    );
  };

  const setQtyManuel = (idx: number, delta: number) => {
    setSelections((prev) =>
      prev.map((s, i) => {
        if (i !== idx) return s;
        const next = Math.max(1, s.quantite + delta);
        return { ...s, quantite: next };
      })
    );
  };

  const isSelected = (articleId: string) =>
    selections.some((s) => s.article?.id === articleId);

  const getQty = (articleId: string) =>
    selections.find((s) => s.article?.id === articleId)?.quantite ?? 1;

  const addManuelArticle = () => {
    const nom = manuelNom.trim();
    const prix = parseFloat(manuelPrix.replace(",", "."));
    if (!nom || isNaN(prix) || prix <= 0) return;
    setSelections((prev) => [
      ...prev,
      { article: null, nomManuel: nom, prixManuel: prix, quantite: 1 },
    ]);
    setManuelNom("");
    setManuelPrix("");
    setShowManuelForm(false);
  };

  const removeManuel = (idx: number) => {
    setSelections((prev) => prev.filter((_, i) => i !== idx));
  };

  const totalGeneral = selections.reduce((acc, s) => {
    const prix = s.article != null
      ? (s.article.prixIndicatif ?? 0)
      : (s.prixManuel ?? 0);
    return acc + prix * s.quantite;
  }, 0);

  const [submitError, setSubmitError] = useState(false);
  const [submitPending, setSubmitPending] = useState(false);

  const handleSubmitSafe = async () => {
    if (!creatrice || selections.length === 0 || submitPending) return;
    setSubmitError(false);
    setSubmitPending(true);
    try {
      const evenementId = activeEvenementId ?? undefined;
      await Promise.all(
        selections.map((s) => {
          if (s.article != null) {
            return venteService.create({
              nomArticle: s.article.nom,
              prixVente: (s.article.prixIndicatif ?? 0) * s.quantite,
              modePaiement,
              creatriceId: creatrice.id,
              articleId: s.article.id,
              quantite: s.quantite,
              evenementId,
              sansCommission,
            });
          }
          return venteService.create({
            nomArticle: s.nomManuel ?? "Article",
            prixVente: (s.prixManuel ?? 0) * s.quantite,
            modePaiement,
            creatriceId: creatrice.id,
            quantite: s.quantite,
            evenementId,
            sansCommission,
          });
        })
      );
      queryClient.invalidateQueries({ queryKey: ["ventes"] });
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["articles-event"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["stats-global"] });
      queryClient.invalidateQueries({ queryKey: ["stats-top-articles"] });
      queryClient.invalidateQueries({ queryKey: ["stats-historique"] });
      queryClient.invalidateQueries({ queryKey: ["stats-par-creatrice"] });
      queryClient.invalidateQueries({ queryKey: ["ventes-recent"] });
      onClose();
    } catch {
      setSubmitError(true);
    } finally {
      setSubmitPending(false);
    }
  };

  const stepLabel: Record<Step, string> = {
    1: "CRÉATRICE",
    2: "ARTICLES",
    3: "RÉCAPITULATIF",
  };

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
            {/* ── Indicateur d'étape ── */}
            <View style={styles.stepIndicator}>
              <View style={[styles.stepBubble, styles.stepBubbleActive]}>
                <Text style={styles.stepNum}>{step}</Text>
              </View>
              <Text style={[styles.stepLabel, styles.stepLabelActive]}>
                {stepLabel[step]}
              </Text>
            </View>

            {/* ── ÉTAPE 1 : Sélection créatrice ── */}
            {step === 1 && (
              <>
                {loadingCreatrices ? (
                  <ActivityIndicator color={Colors.primary} />
                ) : !creatrices?.length ? (
                  <Text style={styles.noArticleTxt}>
                    Aucune fiche créatrice. Crée ta boutique dans l'onglet Profil pour pouvoir vendre.
                  </Text>
                ) : (
                  creatrices?.map((c: Creatrice, idx: number) => {
                    const isActive = creatrice?.id === c.id;
                    return (
                      <TouchableOpacity
                        key={c.id}
                        style={[
                          styles.creatriceRow,
                          isActive && styles.creatriceRowSelected,
                        ]}
                        activeOpacity={0.75}
                        onPress={() => {
                          setCreatrice({ id: c.id, nom: c.nom });
                          setSelections([]);
                          setStep(2);
                        }}
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
                        <Text style={styles.creatriceArrow}>›</Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </>
            )}

            {/* ── ÉTAPE 2 : Multi-sélection articles ── */}
            {step === 2 && (
              <>
                {(isGerante || (creatrices?.length ?? 0) > 1) && (
                  <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => setStep(1)}
                  >
                    <Text style={styles.backBtnTxt}>‹ Changer de créatrice</Text>
                  </TouchableOpacity>
                )}

                {creatrice && (
                  <View style={styles.selectedCreatriceBanner}>
                    <Text style={styles.selectedCreatriceBannerTxt}>
                      {creatrice.nom}
                    </Text>
                  </View>
                )}

                {loadingArticles ? (
                  <ActivityIndicator color={Colors.primary} />
                ) : articlesFiltered.length > 0 ? (
                  articlesFiltered.map((a: Article) => {
                    const selected = isSelected(a.id);
                    const qty = getQty(a.id);
                    return (
                      <TouchableOpacity
                        key={a.id}
                        activeOpacity={0.85}
                        style={[
                          styles.articleRow,
                          selected && styles.articleRowSelected,
                        ]}
                        onPress={() => toggleArticle(a)}
                      >
                        <View style={styles.articleRowTop}>
                          <View
                            style={[
                              styles.checkbox,
                              selected && styles.checkboxChecked,
                            ]}
                          >
                            {selected && (
                              <Text style={styles.checkboxTick}>✓</Text>
                            )}
                          </View>
                          <Text
                            style={styles.articleNom}
                            numberOfLines={1}
                          >
                            {a.nom}
                          </Text>
                          {a.prixIndicatif != null && (
                            <Text style={styles.articlePrix}>
                              {round2(a.prixIndicatif)} €
                            </Text>
                          )}
                        </View>
                        {a.quantite != null && (
                          <Text style={styles.articleStock}>
                            Stock : {a.quantite}
                          </Text>
                        )}
                        {selected && (
                          <View style={styles.qtyRow}>
                            <TouchableOpacity
                              style={styles.qtyBtn}
                              onPress={(e) => {
                                e.stopPropagation?.();
                                setQty(a.id, -1);
                              }}
                            >
                              <Text style={styles.qtyBtnTxt}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.qtyValue}>{qty}</Text>
                            <TouchableOpacity
                              style={styles.qtyBtn}
                              onPress={(e) => {
                                e.stopPropagation?.();
                                setQty(a.id, +1);
                              }}
                            >
                              <Text style={styles.qtyBtnTxt}>+</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })
                ) : (
                  <View style={{ alignItems: "center", paddingVertical: 16 }}>
                    <Text style={styles.noArticleTxt}>
                      {activeEvenementId
                        ? "Aucun article configuré pour cet événement"
                        : "Aucun article pour cette créatrice"}
                    </Text>
                    <Text style={[styles.noArticleTxt, { marginTop: 4, color: Colors.primary }]}>
                      Tu peux quand même vendre via "Article non répertorié" ↓
                    </Text>
                  </View>
                )}

                {/* Bouton article non répertorié */}
                {!showManuelForm && (
                  <TouchableOpacity
                    style={styles.addManuelBtn}
                    activeOpacity={0.75}
                    onPress={() => setShowManuelForm(true)}
                  >
                    <Text style={styles.addManuelBtnTxt}>
                      ＋ Article non répertorié
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Formulaire inline article manuel */}
                {showManuelForm && (
                  <View style={styles.manuelForm}>
                    <TextInput
                      style={styles.manuelFormInput}
                      placeholder="Nom de l'article"
                      placeholderTextColor="#aaa"
                      value={manuelNom}
                      onChangeText={setManuelNom}
                    />
                    <View style={styles.manuelFormRow}>
                      <TextInput
                        style={styles.manuelFormInput}
                        placeholder="Prix (€)"
                        placeholderTextColor="#aaa"
                        value={manuelPrix}
                        onChangeText={setManuelPrix}
                        keyboardType="decimal-pad"
                      />
                      <TouchableOpacity
                        style={styles.manuelFormBtn}
                        activeOpacity={0.85}
                        onPress={addManuelArticle}
                      >
                        <Text style={styles.manuelFormBtnTxt}>Ajouter</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    selections.length === 0 && styles.submitBtnDisabled,
                    { marginTop: 20 },
                  ]}
                  activeOpacity={0.85}
                  disabled={selections.length === 0}
                  onPress={() => setStep(3)}
                >
                  <Text style={styles.submitTxt}>
                    SUIVANT
                    {selections.length > 0
                      ? ` (${selections.length} article${selections.length > 1 ? "s" : ""})`
                      : ""}
                    {" ›"}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {/* ── ÉTAPE 3 : Récapitulatif + mode paiement ── */}
            {step === 3 && (
              <>
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => setStep(2)}
                >
                  <Text style={styles.backBtnTxt}>‹ Modifier la sélection</Text>
                </TouchableOpacity>

                {/* Récap articles */}
                <View style={styles.recapCard}>
                  {selections.map((s, idx) => {
                    const nom = s.article != null ? s.article.nom : (s.nomManuel ?? "Article");
                    const prix = s.article != null
                      ? (s.article.prixIndicatif ?? 0)
                      : (s.prixManuel ?? 0);
                    return (
                      <View
                        key={s.article != null ? s.article.id : `manuel-${idx}`}
                        style={[
                          styles.recapRow,
                          idx === selections.length - 1 && styles.recapRowLast,
                        ]}
                      >
                        <View style={{ flex: 1, flexDirection: "row", alignItems: "center", paddingRight: 8 }}>
                          <Text style={styles.recapArticleNom} numberOfLines={2}>
                            {nom} × {s.quantite}
                          </Text>
                          {s.article == null && (
                            <Text style={styles.articleManuelTag}>Manuel</Text>
                          )}
                        </View>
                        <Text style={styles.recapArticlePrix}>
                          {(prix * s.quantite).toFixed(2)} €
                        </Text>
                      </View>
                    );
                  })}
                </View>

                {/* Total */}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>TOTAL</Text>
                  <Text style={styles.totalMontant}>
                    {totalGeneral.toFixed(2)} €
                  </Text>
                </View>

                {/* Mode paiement */}
                <View style={[styles.formGroup, { marginTop: 20 }]}>
                  <Text style={styles.formLabel}>Mode de paiement</Text>
                  <View style={styles.modePaiementRow}>
                    {(["ESPECES", "CARTE"] as ModePaiement[]).map((m) => (
                      <TouchableOpacity
                        key={m}
                        style={[
                          styles.modeChip,
                          modePaiement === m && styles.modeChipActive,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => {
                          setModePaiement(m);
                          if (m !== "ESPECES") setSansCommission(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.modeChipTxt,
                            modePaiement === m && styles.modeChipTxtActive,
                          ]}
                        >
                          {m === "ESPECES" ? "ESPECES" : "CARTE"}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {modePaiement === "ESPECES" && (
                    <TouchableOpacity
                      style={styles.sansCommissionRow}
                      onPress={() => setSansCommission((v) => !v)}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.checkbox, sansCommission && styles.checkboxChecked]}>
                        {sansCommission && <Text style={styles.checkboxTick}>✓</Text>}
                      </View>
                      <Text style={styles.sansCommissionTxt}>
                        Pas de commission sur cette vente
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Erreur */}
                {submitError && (
                  <Text style={styles.errorTxt}>
                    Erreur lors de l'enregistrement. Réessaye.
                  </Text>
                )}

                {/* Submit */}
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    submitPending && styles.submitBtnDisabled,
                  ]}
                  activeOpacity={0.85}
                  onPress={handleSubmitSafe}
                  disabled={submitPending}
                >
                  {submitPending ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitTxt}>
                      ENREGISTRER LES VENTES
                    </Text>
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

// ── BottomSheetEdit ───────────────────────────────────────────────────────────
//- Modifier/supprimer une vente existante. Champs volontairement limités à
//- ce qui peut vraiment se tromper (nom, prix, mode de paiement, commission)
//- — pas de réassignation de créatrice/boutique depuis ici.

function BottomSheetEdit({
  vente,
  onClose,
}: {
  vente: Vente | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const visible = vente != null;

  const [nomArticle, setNomArticle] = useState("");
  const [prixVente, setPrixVente] = useState("");
  const [modePaiement, setModePaiement] = useState<ModePaiement>("ESPECES");
  const [sansCommission, setSansCommission] = useState(false);
  const [error, setError] = useState(false);
  const [pending, setPending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const slideAnim = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (visible && vente) {
      setNomArticle(vente.nomArticle);
      setPrixVente(vente.prixVente.toString().replace(".", ","));
      setModePaiement(vente.modePaiement);
      setSansCommission(vente.sansCommission ?? false);
      setError(false);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 200,
      }).start();
    } else {
      slideAnim.setValue(400);
    }
  }, [visible, vente?.id]);

  const invalidateTout = () => {
    queryClient.invalidateQueries({ queryKey: ["ventes"] });
    queryClient.invalidateQueries({ queryKey: ["stats"] });
    queryClient.invalidateQueries({ queryKey: ["stats-global"] });
    queryClient.invalidateQueries({ queryKey: ["stats-top-articles"] });
    queryClient.invalidateQueries({ queryKey: ["stats-historique"] });
    queryClient.invalidateQueries({ queryKey: ["stats-par-creatrice"] });
    queryClient.invalidateQueries({ queryKey: ["ventes-recent"] });
  };

  const handleSave = async () => {
    if (!vente) return;
    const prix = parseFloat(prixVente.replace(",", "."));
    if (!nomArticle.trim() || isNaN(prix) || prix <= 0) {
      setError(true);
      return;
    }
    setError(false);
    setPending(true);
    try {
      await venteService.update(vente.id, {
        nomArticle: nomArticle.trim(),
        prixVente: prix,
        modePaiement,
        sansCommission,
      });
      invalidateTout();
      onClose();
    } catch {
      setError(true);
    } finally {
      setPending(false);
    }
  };

  const handleDelete = () => {
    if (!vente) return;
    Alert.alert(
      "Supprimer cette vente",
      "Cette action est irréversible.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            setDeleting(true);
            try {
              await venteService.remove(vente.id);
              invalidateTout();
              onClose();
            } catch {
              setError(true);
            } finally {
              setDeleting(false);
            }
          },
        },
      ],
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitre}>MODIFIER LA VENTE</Text>
            <TouchableOpacity style={styles.sheetClose} onPress={onClose}>
              <Text style={styles.sheetCloseTxt}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.sheetScroll} keyboardShouldPersistTaps="handled">
            <TextInput
              style={styles.manuelFormInput}
              placeholder="Nom de l'article"
              placeholderTextColor="#aaa"
              value={nomArticle}
              onChangeText={setNomArticle}
            />
            <TextInput
              style={[styles.manuelFormInput, { marginTop: 12 }]}
              placeholder="Prix (€)"
              placeholderTextColor="#aaa"
              value={prixVente}
              onChangeText={setPrixVente}
              keyboardType="decimal-pad"
            />

            <View style={[styles.formGroup, { marginTop: 20 }]}>
              <Text style={styles.formLabel}>Mode de paiement</Text>
              <View style={styles.modePaiementRow}>
                {(["ESPECES", "CARTE"] as ModePaiement[]).map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.modeChip, modePaiement === m && styles.modeChipActive]}
                    activeOpacity={0.8}
                    onPress={() => {
                      setModePaiement(m);
                      if (m !== "ESPECES") setSansCommission(false);
                    }}
                  >
                    <Text style={[styles.modeChipTxt, modePaiement === m && styles.modeChipTxtActive]}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {modePaiement === "ESPECES" && (
                <TouchableOpacity
                  style={styles.sansCommissionRow}
                  onPress={() => setSansCommission((v) => !v)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.checkbox, sansCommission && styles.checkboxChecked]}>
                    {sansCommission && <Text style={styles.checkboxTick}>✓</Text>}
                  </View>
                  <Text style={styles.sansCommissionTxt}>Pas de commission sur cette vente</Text>
                </TouchableOpacity>
              )}
            </View>

            {error && (
              <Text style={styles.errorTxt}>Erreur — vérifie les champs et réessaye.</Text>
            )}

            <TouchableOpacity
              style={[styles.submitBtn, pending && styles.submitBtnDisabled, { marginTop: 20 }]}
              activeOpacity={0.85}
              onPress={handleSave}
              disabled={pending || deleting}
            >
              {pending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitTxt}>ENREGISTRER</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteVenteBtn}
              activeOpacity={0.75}
              onPress={handleDelete}
              disabled={pending || deleting}
            >
              <Text style={styles.deleteVenteTxt}>
                {deleting ? "Suppression..." : "Supprimer cette vente"}
              </Text>
            </TouchableOpacity>
          </ScrollView>

          <View style={{ height: insets.bottom }} />
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── VentesScreen ──────────────────────────────────────────────────────────────

type FilterMode = "TOUT" | "ESPECES" | "CARTE";
const PAGE_SIZE = 20;
const MOIS_FR = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
const pad = (n: number) => String(n).padStart(2, "0");

/** Les 6 derniers mois, le plus récent en premier — mois précis uniquement
 * (chips horizontales), pas de plage libre. Fenêtre plus courte qu'en web
 * (12) pour rester lisible dans une rangée de chips sur petit écran. */
function moisOptions() {
  const now = new Date();
  const opts: { value: string; label: string }[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    opts.push({ value: `${d.getFullYear()}-${pad(d.getMonth() + 1)}`, label: `${MOIS_FR[d.getMonth()].slice(0, 3)} ${d.getFullYear()}` });
  }
  return opts;
}

function moisToRange(mois: string): { dateDebut: string; dateFin: string } {
  const [y, m] = mois.split("-").map(Number);
  const debut = new Date(y, m - 1, 1, 0, 0, 0);
  const fin = new Date(y, m, 0, 23, 59, 59);
  return { dateDebut: debut.toISOString(), dateFin: fin.toISOString() };
}

export default function VentesScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const activeEvenementId = useAuthStore((state) => state.activeEvenementId);
  const activeEvenementNom = useAuthStore((state) => state.activeEvenementNom);
  const [filter, setFilter] = useState<FilterMode>("TOUT");
  const [mois, setMois] = useState<string>("");
  const [creatriceId, setCreatriceId] = useState<string>("");
  const [sheetVisible, setSheetVisible] = useState(false);
  const [editingVente, setEditingVente] = useState<Vente | null>(null);

  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const isDuoScreen = user?.role === "GERANTE_CREATRICE";
  const duoModeScreen = useAuthStore((state) => state.duoMode);
  const isGerante = user?.role === "GERANTE" || (isDuoScreen && duoModeScreen === "GERANTE");
  const currentMode: "GERANTE" | "CREATRICE" = isGerante ? "GERANTE" : "CREATRICE";

  // Filtre créatrice : uniquement côté gérante (une créatrice voit déjà
  // uniquement les siennes — pas la peine de se filtrer elle-même).
  const { data: creatrices } = useQuery<Creatrice[]>({
    queryKey: ["creatrices"],
    queryFn: creatriceService.getAll,
    enabled: isGerante,
  });

  const dateRange = mois ? moisToRange(mois) : {};

  const queryFilters = {
    ...(filter !== "TOUT" ? { modePaiement: filter } : {}),
    ...(activeEvenementId ? { evenementId: activeEvenementId } : {}),
    ...(isGerante && creatriceId ? { creatriceId } : {}),
    ...dateRange,
    mode: currentMode,
  };

  //- `currentMode` dans la clé : sans ça, basculer gérante/créatrice (DUO)
  //- ne redéclencherait pas la requête et afficherait la liste de l'autre vue.
  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["ventes", filter, creatriceId, mois, activeEvenementId ?? "personal", currentMode],
    queryFn: ({ pageParam }) => venteService.getAll({ ...queryFilters, skip: pageParam, take: PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce((acc, p) => acc + p.data.length, 0);
      return lastPage.hasMore ? loaded : undefined;
    },
  });

  const ventes = data?.pages.flatMap((p) => p.data) ?? [];
  const total = data?.pages[0]?.total ?? 0;

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
        <View style={{ flex: 1 }}>
          <Text style={styles.eyebrow}>{isGerante ? "GÉRANTE" : "CRÉATRICE"}</Text>
          <Text style={styles.titre}>Ventes</Text>
          <Text style={styles.headerSub}>
            {activeEvenementNom ? `🎪 ${activeEvenementNom}` : `${total} vente${total > 1 ? "s" : ""} · ${user?.plan ?? "FREE"}`}
          </Text>
          {isDuoScreen && <DuoModeToggle variant="onLight" />}
        </View>
        <Button
          size="sm"
          disabled={!isGerante && !activeEvenementId}
          onPress={() => setSheetVisible(true)}
          accessibilityLabel="Ajouter une vente"
        >
          ＋ Ajouter
        </Button>
      </Animated.View>

      {/* Liste — les filtres sont dans le scroll pour ne pas manger l'écran */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          <View style={styles.filtersBlock}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {(["TOUT", "ESPECES", "CARTE"] as FilterMode[]).map((f) => (
                <Chip key={f} active={filter === f} onPress={() => setFilter(f)}>{f}</Chip>
              ))}
            </ScrollView>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              <Chip active={mois === ""} onPress={() => setMois("")}>Tout l'historique</Chip>
              {moisOptions().map((o) => (
                <Chip key={o.value} active={mois === o.value} onPress={() => setMois(o.value)}>{o.label}</Chip>
              ))}
            </ScrollView>
            {isGerante && (creatrices?.length ?? 0) > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
                <Chip active={creatriceId === ""} onPress={() => setCreatriceId("")}>Toutes les créatrices</Chip>
                {(creatrices ?? []).map((c) => (
                  <Chip key={c.id} active={creatriceId === c.id} onPress={() => setCreatriceId(c.id)}>{c.nom}</Chip>
                ))}
              </ScrollView>
            )}
          </View>

          {!isGerante && !activeEvenementId && (
            <Notice>🎪 Aucun événement actif — va dans l'onglet Ma fiche pour activer ou créer un événement, puis reviens ici pour vendre.</Notice>
          )}
          {ventes.length > 0 ? (
            ventes.map((v, index) => (
              <AnimCard key={v.id} index={index % PAGE_SIZE}>
                <ListRow
                  onPress={() => setEditingVente(v)}
                  accessibilityLabel={`Vente ${v.nomArticle}, ${v.prixVente.toFixed(2)} euros, modifier`}
                  left={
                    <>
                      <Text style={styles.cardNomArticle} numberOfLines={2}>
                        {v.nomArticle}
                        {(v.quantite ?? 1) > 1 ? `  × ${v.quantite}` : ""}
                      </Text>
                      <Text style={styles.cardMeta} numberOfLines={1}>
                        {[v.evenement?.nom ?? v.creatrice?.nom, formatDate(v.createdAt)].filter(Boolean).join(" · ")}
                      </Text>
                    </>
                  }
                  right={
                    <>
                      <Text style={styles.cardPrix}>{v.prixVente.toFixed(2)} €</Text>
                      <Badge color={v.modePaiement === "CARTE" ? "info" : "warning"}>{v.modePaiement}</Badge>
                    </>
                  }
                />
              </AnimCard>
            ))
          ) : (
            !isGerante && !activeEvenementId ? null : (
              <Notice>
                {filter !== "TOUT" || mois || creatriceId
                  ? "Aucune vente pour ces filtres."
                  : "Aucune vente — appuie sur « Ajouter » pour enregistrer la première."}
              </Notice>
            )
          )}
          {hasNextPage && (
            <Button
              variant="secondary"
              fullWidth
              loading={isFetchingNextPage}
              onPress={() => fetchNextPage()}
              style={{ marginTop: 4 }}
            >
              {`Afficher plus (${ventes.length} / ${total})`}
            </Button>
          )}
        </ScrollView>
      )}

      {/* Bottom sheet création */}
      <BottomSheetCreation
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
      />

      {/* Bottom sheet édition/suppression */}
      <BottomSheetEdit
        vente={editingVente}
        onClose={() => setEditingVente(null)}
      />
    </View>
  );
}
