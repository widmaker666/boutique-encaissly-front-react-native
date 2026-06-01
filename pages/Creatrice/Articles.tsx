import { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { articleService } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import type { Article } from "@/types";
import { styles } from "@/styles/pages/articles.style";

// ─── AnimCard ────────────────────────────────────────────────────────────────
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
      delay: index * 55,
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

// ─── Formateur prix ───────────────────────────────────────────────────────────
function formatPrix(n: number): string {
  return n.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) + " €";
}

// ─── Modal Article ────────────────────────────────────────────────────────────
interface ArticleModalProps {
  visible: boolean;
  onClose: () => void;
  creatriceId: string;
  article?: Article | null; // null = création, objet = modification
}

function ArticleModal({
  visible,
  onClose,
  creatriceId,
  article,
}: ArticleModalProps) {
  const queryClient = useQueryClient();
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [prix, setPrix] = useState("");

  // Pré-remplit si modification
  useEffect(() => {
    if (article) {
      setNom(article.nom);
      setDescription(article.description ?? "");
      setPrix(article.prixIndicatif != null ? String(article.prixIndicatif) : "");
    } else {
      setNom("");
      setDescription("");
      setPrix("");
    }
  }, [article, visible]);

  const { mutate: creerArticle, isPending: isCreating } = useMutation({
    mutationFn: () =>
      articleService.create({
        nom: nom.trim(),
        description: description.trim() || undefined,
        prixIndicatif: prix ? parseFloat(prix.replace(",", ".")) : undefined,
        creatriceId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles", creatriceId] });
      onClose();
    },
    onError: () => {
      Alert.alert("Erreur", "Impossible de créer l'article.");
    },
  });

  const { mutate: modifierArticle, isPending: isUpdating } = useMutation({
    mutationFn: () =>
      articleService.update(article!.id, {
        nom: nom.trim(),
        description: description.trim() || undefined,
        prixIndicatif: prix ? parseFloat(prix.replace(",", ".")) : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles", creatriceId] });
      onClose();
    },
    onError: () => {
      Alert.alert("Erreur", "Impossible de modifier l'article.");
    },
  });

  const isPending = isCreating || isUpdating;
  const isEdit = !!article;
  const canSubmit = nom.trim().length > 0 && !isPending;

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (isEdit) {
      modifierArticle();
    } else {
      creerArticle();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>
            {isEdit ? "MODIFIER L'ARTICLE" : "NOUVEL ARTICLE"}
          </Text>

          <Text style={styles.inputLabel}>Nom *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Bracelet bohème"
            placeholderTextColor="#b0b0b0"
            value={nom}
            onChangeText={setNom}
            autoFocus={!isEdit}
          />

          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            placeholder="Description optionnelle..."
            placeholderTextColor="#b0b0b0"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.inputLabel}>Prix indicatif (€)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 12.50"
            placeholderTextColor="#b0b0b0"
            value={prix}
            onChangeText={setPrix}
            keyboardType="decimal-pad"
          />

          <TouchableOpacity
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={!canSubmit}
          >
            {isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitBtnTxt}>
                {isEdit ? "ENREGISTRER" : "CRÉER"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Écran principal ─────────────────────────────────────────────────────────
export default function ArticlesScreen() {
  const { creatriceId, nomCreatrice } = useLocalSearchParams<{
    creatriceId: string;
    nomCreatrice: string;
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const isGerante = user?.role === "GERANTE";
  const queryClient = useQueryClient();

  const [modalVisible, setModalVisible] = useState(false);
  const [articleToEdit, setArticleToEdit] = useState<Article | null>(null);

  const headerAnim = useRef(new Animated.Value(0)).current;

  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["articles", creatriceId],
    queryFn: () => articleService.getAll(creatriceId),
    enabled: !!creatriceId,
  });

  const { mutate: supprimerArticle } = useMutation({
    mutationFn: (id: string) => articleService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles", creatriceId] });
    },
    onError: () => {
      Alert.alert("Erreur", "Impossible de supprimer l'article.");
    },
  });

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleDelete = (article: Article) => {
    Alert.alert(
      "Supprimer",
      `Supprimer "${article.nom}" ? Cette action est irréversible.`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => supprimerArticle(article.id),
        },
      ],
    );
  };

  const handleEdit = (article: Article) => {
    setArticleToEdit(article);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setArticleToEdit(null);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#7a41bb" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── HEADER ── */}
      <Animated.View
        style={[
          styles.header,
          { paddingTop: insets.top + 12 },
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
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.back()}
              activeOpacity={0.75}
            >
              <Text style={styles.backTxt}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>ARTICLES</Text>
          </View>

          {isGerante && (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => {
                setArticleToEdit(null);
                setModalVisible(true);
              }}
              activeOpacity={0.75}
            >
              <Text style={styles.addBtnTxt}>+</Text>
            </TouchableOpacity>
          )}
        </View>

        {!!nomCreatrice && (
          <Text style={styles.headerSubtitle}>{nomCreatrice}</Text>
        )}
      </Animated.View>

      {/* ── LISTE ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {articles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTxt}>Aucun article pour l'instant.</Text>
          </View>
        ) : (
          articles.map((article, i) => (
            <AnimCard key={article.id} index={i} style={styles.articleCard}>
              <View style={styles.articleLeft}>
                <Text style={styles.articleNom}>{article.nom}</Text>
                {!!article.description && (
                  <Text style={styles.articleDescription} numberOfLines={2}>
                    {article.description}
                  </Text>
                )}
                {article.prixIndicatif != null && (
                  <View style={styles.prixBadge}>
                    <Text style={styles.prixBadgeTxt}>
                      {formatPrix(article.prixIndicatif)}
                    </Text>
                  </View>
                )}
              </View>

              {isGerante && (
                <View style={styles.articleActions}>
                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => handleEdit(article)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.editBtnTxt}>✎</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDelete(article)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.deleteBtnTxt}>×</Text>
                  </TouchableOpacity>
                </View>
              )}
            </AnimCard>
          ))
        )}
      </ScrollView>

      {/* ── MODAL ── */}
      <ArticleModal
        visible={modalVisible}
        onClose={handleCloseModal}
        creatriceId={creatriceId}
        article={articleToEdit}
      />
    </View>
  );
}
