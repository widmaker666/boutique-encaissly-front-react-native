import { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { venteService, creatriceService, articleService } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import type { Vente, Creatrice, Article, ModePaiement } from "@/types";
import { Colors } from "@/constants/colors";
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

function groupVentes(ventes: Vente[]): (Vente & { quantite: number })[] {
  const map = new Map<string, Vente & { quantite: number }>();
  for (const v of ventes) {
    const creatriceId = v.creatriceId ?? "";
    const key = `${v.nomArticle}-${creatriceId}-${v.modePaiement}`;
    if (map.has(key)) {
      const g = map.get(key)!;
      g.quantite = g.quantite + ((v as any).quantite ?? 1);
      g.prixVente += v.prixVente;
    } else {
      map.set(key, { ...v, quantite: (v as any).quantite ?? 1 });
    }
  }
  return Array.from(map.values());
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

type Step = 1 | 2 | 3;

interface ArticleSelection {
  article: Article;
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
  const [step, setStep] = useState<Step>(1);
  const [creatrice, setCreatrice] = useState<SelectedCreatrice | null>(null);
  const [selections, setSelections] = useState<ArticleSelection[]>([]);
  const [modePaiement, setModePaiement] = useState<ModePaiement>("ESPECES");

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
    }
  }, [visible]);

  const { data: creatrices, isLoading: loadingCreatrices } = useQuery({
    queryKey: ["creatrices"],
    queryFn: creatriceService.getAll,
    enabled: visible,
  });

  const { data: articles, isLoading: loadingArticles } = useQuery({
    queryKey: ["articles", creatrice?.id],
    queryFn: () => articleService.getAll(creatrice!.id),
    enabled: !!creatrice?.id && step === 2,
  });

  // ── Helpers sélection ────────────────────────────────────────────────────────

  const toggleArticle = (article: Article) => {
    setSelections((prev) => {
      const exists = prev.find((s) => s.article.id === article.id);
      if (exists) {
        return prev.filter((s) => s.article.id !== article.id);
      }
      return [...prev, { article, quantite: 1 }];
    });
  };

  const setQty = (articleId: string, delta: number) => {
    setSelections((prev) =>
      prev.map((s) => {
        if (s.article.id !== articleId) return s;
        const next = Math.max(1, s.quantite + delta);
        return { ...s, quantite: next };
      })
    );
  };

  const isSelected = (articleId: string) =>
    selections.some((s) => s.article.id === articleId);

  const getQty = (articleId: string) =>
    selections.find((s) => s.article.id === articleId)?.quantite ?? 1;

  const totalGeneral = selections.reduce(
    (acc, s) => acc + (s.article.prixIndicatif ?? 0) * s.quantite,
    0
  );

  const [submitError, setSubmitError] = useState(false);
  const [submitPending, setSubmitPending] = useState(false);

  const handleSubmitSafe = async () => {
    if (!creatrice || selections.length === 0 || submitPending) return;
    setSubmitError(false);
    setSubmitPending(true);
    try {
      await Promise.all(
        selections.map((s) =>
          venteService.create({
            nomArticle: s.article.nom,
            prixVente: (s.article.prixIndicatif ?? 0) * s.quantite,
            modePaiement,
            creatriceId: creatrice.id,
            articleId: s.article.id,
            quantite: s.quantite,
          })
        )
      );
      queryClient.invalidateQueries({ queryKey: ["ventes"] });
      queryClient.invalidateQueries({ queryKey: ["articles", creatrice.id] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
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
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => setStep(1)}
                >
                  <Text style={styles.backBtnTxt}>‹ Changer de créatrice</Text>
                </TouchableOpacity>

                {creatrice && (
                  <View style={styles.selectedCreatriceBanner}>
                    <Text style={styles.selectedCreatriceBannerTxt}>
                      {creatrice.nom}
                    </Text>
                  </View>
                )}

                {loadingArticles ? (
                  <ActivityIndicator color={Colors.primary} />
                ) : articles && articles.length > 0 ? (
                  articles.map((a: Article) => {
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
                              {a.prixIndicatif} €
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
                  <Text style={styles.noArticleTxt}>
                    Aucun article pour cette créatrice
                  </Text>
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
                  {selections.map((s, idx) => (
                    <View
                      key={s.article.id}
                      style={[
                        styles.recapRow,
                        idx === selections.length - 1 && styles.recapRowLast,
                      ]}
                    >
                      <Text style={styles.recapArticleNom} numberOfLines={2}>
                        {s.article.nom} × {s.quantite}
                      </Text>
                      <Text style={styles.recapArticlePrix}>
                        {((s.article.prixIndicatif ?? 0) * s.quantite).toFixed(
                          2
                        )}{" "}
                        €
                      </Text>
                    </View>
                  ))}
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
                        onPress={() => setModePaiement(m)}
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
            groupVentes(ventes).map((v, index) => (
              <AnimCard key={v.id} index={index} style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={styles.cardLeft}>
                    <Text style={styles.cardNomArticle} numberOfLines={2}>
                      {v.nomArticle}
                      {v.quantite > 1 ? `  × ${v.quantite}` : ""}
                    </Text>
                    {v.creatrice?.nom && (
                      <Text style={styles.cardCreatrice} numberOfLines={1}>
                        {v.creatrice.nom} · {v.modePaiement}
                      </Text>
                    )}
                  </View>
                  <View style={styles.cardRight}>
                    <Text style={styles.cardPrix}>{v.prixVente.toFixed(2)} €</Text>
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
