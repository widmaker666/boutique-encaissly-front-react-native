import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { articleService, statsService, venteService } from "@/services/api";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

type Props = { evenementId: string; evenementNom: string };

function toUpper(str: string) {
  return str.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase();
}

function fmt(n: number | null | undefined) {
  return (Math.round((n ?? 0) * 100) / 100).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " €";
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function EventFiche({ evenementId, evenementNom }: Props) {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [modalAddVisible, setModalAddVisible] = useState(false);
  const [nomArticle, setNomArticle] = useState("");
  const [prixArticle, setPrixArticle] = useState("");
  const [qteArticle, setQteArticle] = useState("1");
  const [descArticle, setDescArticle] = useState("");
  const [importResult, setImportResult] = useState<string | null>(null);

  const qk = ["articles-event", evenementId];

  const { data: articles, isLoading: loadingArticles } = useQuery<any[]>({
    queryKey: qk,
    queryFn: () => articleService.getAll({ evenementId }),
  });

  const { data: stats } = useQuery<any>({
    queryKey: ["stats", evenementId],
    queryFn: () => statsService.getGlobal(evenementId),
  });

  const { data: recentVentes } = useQuery<any[]>({
    queryKey: ["ventes", "fiche", evenementId],
    queryFn: () => venteService.getAll({ evenementId }),
  });

  const { mutate: addArticle, isPending: isAdding } = useMutation({
    mutationFn: () =>
      articleService.create({
        nom: nomArticle.trim(),
        prixIndicatif: prixArticle ? parseFloat(prixArticle.replace(",", ".")) : undefined,
        quantite: qteArticle ? parseInt(qteArticle, 10) : undefined,
        description: descArticle.trim() || undefined,
        evenementId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk });
      setModalAddVisible(false);
      setNomArticle(""); setPrixArticle(""); setQteArticle("1"); setDescArticle("");
    },
    onError: () => Alert.alert("Erreur", "Impossible d'ajouter l'article."),
  });

  const { mutate: removeArticle } = useMutation({
    mutationFn: (id: string) => articleService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: qk }),
    onError: () => Alert.alert("Erreur", "Impossible de supprimer l'article."),
  });

  const { mutate: importFile, isPending: isImporting } = useMutation({
    mutationFn: async () => {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return null;
      const asset = result.assets[0];
      return articleService.importFile(asset.uri, asset.name, asset.mimeType ?? "text/csv", { evenementId });
    },
    onSuccess: (res) => {
      if (!res) return;
      queryClient.invalidateQueries({ queryKey: qk });
      setImportResult(res.message);
      setTimeout(() => setImportResult(null), 4000);
    },
    onError: () => Alert.alert("Erreur", "Impossible d'importer le fichier."),
  });

  const handleDelete = (article: any) => {
    Alert.alert("Supprimer", `Supprimer "${article.nom}" ?`, [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => removeArticle(article.id) },
    ]);
  };

  const articlesList: any[] = articles ?? [];
  const ventes: any[] = recentVentes ?? [];
  const ca = stats?.stats._sum?.prixVente ?? 0;
  const nbVentes = stats?.stats._count ?? 0;
  const commissions = stats?.totalCommissions ?? 0;

  return (
    <View style={s.container}>
      {/* Header violet */}
      <View style={[s.header, { paddingTop: insets.top + 20 }]}>
        <Text style={s.titre}>{toUpper(evenementNom)}</Text>
        <Text style={s.sousTitre}>MA FICHE ÉVÉNEMENT</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Stats */}
        <Text style={s.sectionTitle}>STATISTIQUES</Text>
        <View style={s.statsGrid}>
          {[
            { label: "Chiffre d'affaires", value: fmt(ca) },
            { label: "Ventes", value: String(nbVentes) },
            { label: "Commission", value: fmt(commissions) },
            { label: "Net créatrice", value: fmt(ca - commissions) },
          ].map((item) => (
            <View key={item.label} style={s.statCard}>
              <Text style={s.statValue}>{item.value}</Text>
              <Text style={s.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Articles */}
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>ARTICLES ({articlesList.length})</Text>
          <View style={s.sectionActions}>
            <TouchableOpacity
              style={s.actionBtn}
              onPress={() => importFile()}
              disabled={isImporting}
              activeOpacity={0.8}
            >
              {isImporting ? (
                <ActivityIndicator size="small" color={Colors.primary} />
              ) : (
                <Text style={s.actionBtnTxt}>⬆ Importer</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.actionBtn, s.actionBtnPrimary]}
              onPress={() => setModalAddVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={[s.actionBtnTxt, { color: "#fff" }]}>+ Ajouter</Text>
            </TouchableOpacity>
          </View>
        </View>

        {importResult && (
          <View style={s.importBanner}>
            <Text style={s.importBannerTxt}>{importResult}</Text>
          </View>
        )}

        {loadingArticles ? (
          <ActivityIndicator color={Colors.primary} style={{ marginVertical: 20 }} />
        ) : articlesList.length === 0 ? (
          <View style={s.emptyBox}>
            <Text style={s.emptyIcon}>📦</Text>
            <Text style={s.emptyTxt}>Aucun article pour cet événement</Text>
            <Text style={s.emptySub}>Ajoute des articles ou importe un CSV/Excel</Text>
          </View>
        ) : (
          articlesList.map((a) => (
            <View key={a.id} style={s.articleRow}>
              <View style={s.articleLeft}>
                <Text style={s.articleNom} numberOfLines={1}>{a.nom}</Text>
                <Text style={s.articleMeta}>
                  {a.prixIndicatif != null ? `${(a.prixIndicatif).toFixed(2)} €` : "Prix libre"}
                  {a.quantite != null ? `  · Qté : ${a.quantite}` : ""}
                </Text>
              </View>
              <TouchableOpacity style={s.deleteBtn} onPress={() => handleDelete(a)} activeOpacity={0.75}>
                <Text style={s.deleteBtnTxt}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Dernières ventes */}
        {ventes.length > 0 && (
          <>
            <Text style={[s.sectionTitle, { marginTop: 12 }]}>DERNIÈRES VENTES</Text>
            {ventes.slice(0, 10).map((v) => (
              <View key={v.id} style={s.venteRow}>
                <View style={s.venteLeft}>
                  <Text style={s.venteNom} numberOfLines={1}>
                    {v.nomArticle}{(v.quantite ?? 1) > 1 ? ` × ${v.quantite}` : ""}
                  </Text>
                  <Text style={s.venteMeta}>{formatDate(v.createdAt)} · {v.modePaiement}</Text>
                </View>
                <Text style={s.ventePrix}>{(v.prixVente ?? 0).toFixed(2)} €</Text>
              </View>
            ))}
          </>
        )}

        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>

      {/* Modal ajout article */}
      <Modal visible={modalAddVisible} transparent animationType="fade" onRequestClose={() => setModalAddVisible(false)}>
        <View style={s.overlay}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setModalAddVisible(false)} />
          <View style={[s.sheet, { paddingBottom: insets.bottom + 16 }]}>
            <View style={s.sheetHandle} />
            <Text style={s.sheetTitre}>Nouvel article</Text>

            <Text style={s.fieldLabel}>Nom *</Text>
            <TextInput
              style={s.input}
              value={nomArticle}
              onChangeText={setNomArticle}
              placeholder="Ex : Écharpe bleue"
              placeholderTextColor={Colors.textLight}
              autoFocus
            />

            <View style={s.fieldRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={s.fieldLabel}>Prix (€)</Text>
                <TextInput
                  style={s.input}
                  value={prixArticle}
                  onChangeText={setPrixArticle}
                  placeholder="0.00"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.fieldLabel}>Quantité</Text>
                <TextInput
                  style={s.input}
                  value={qteArticle}
                  onChangeText={setQteArticle}
                  placeholder="1"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <Text style={s.fieldLabel}>Description (optionnel)</Text>
            <TextInput
              style={[s.input, { height: 64, textAlignVertical: "top" }]}
              value={descArticle}
              onChangeText={setDescArticle}
              placeholder="Couleur, taille, matière..."
              placeholderTextColor={Colors.textLight}
              multiline
            />

            <TouchableOpacity
              style={[s.confirmBtn, (!nomArticle.trim() || isAdding) && s.confirmBtnDisabled]}
              onPress={() => addArticle()}
              disabled={!nomArticle.trim() || isAdding}
              activeOpacity={0.85}
            >
              {isAdding ? <ActivityIndicator color="#fff" /> : <Text style={s.confirmBtnTxt}>Ajouter l'article</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: "center",
  },
  titre: { fontFamily: "Norwester", fontSize: 20, color: "#fff", letterSpacing: 2, textAlign: "center" },
  sousTitre: { fontFamily: Fonts.family.nowRegular, fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4 },

  scroll: { padding: 16 },

  sectionTitle: {
    fontFamily: Fonts.family.nowBold, fontSize: 12, color: Colors.textLight,
    letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, marginTop: 4,
  },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10, marginTop: 4 },
  sectionActions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    borderWidth: 1, borderColor: Colors.primary, flexDirection: "row", alignItems: "center", gap: 4,
  },
  actionBtnPrimary: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  actionBtnTxt: { fontFamily: Fonts.family.nowMedium, fontSize: 12, color: Colors.primary },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1, minWidth: "45%", backgroundColor: Colors.surface, borderRadius: 12,
    padding: 14, shadowColor: "#7a41bb", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  statValue: { fontFamily: "Norwester", fontSize: 18, color: Colors.primary, marginBottom: 4 },
  statLabel: { fontFamily: Fonts.family.nowRegular, fontSize: 11, color: Colors.textLight },

  importBanner: {
    backgroundColor: "#e6f7ef", borderRadius: 8, padding: 10, marginBottom: 10,
  },
  importBannerTxt: { fontFamily: Fonts.family.nowMedium, fontSize: 13, color: "#1a7a4a" },

  emptyBox: { alignItems: "center", paddingVertical: 32 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyTxt: { fontFamily: Fonts.family.nowBold, fontSize: 14, color: Colors.text, marginBottom: 4 },
  emptySub: { fontFamily: Fonts.family.nowRegular, fontSize: 12, color: Colors.textLight, textAlign: "center" },

  articleRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: Colors.surface,
    borderRadius: 10, padding: 12, marginBottom: 8,
    shadowColor: "#7a41bb", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  articleLeft: { flex: 1 },
  articleNom: { fontFamily: Fonts.family.nowMedium, fontSize: 14, color: Colors.text, marginBottom: 2 },
  articleMeta: { fontFamily: Fonts.family.nowRegular, fontSize: 12, color: Colors.textLight },
  deleteBtn: { padding: 8 },
  deleteBtnTxt: { fontFamily: Fonts.family.nowBold, fontSize: 14, color: Colors.error },

  venteRow: {
    flexDirection: "row", alignItems: "center", backgroundColor: Colors.surface,
    borderRadius: 10, padding: 12, marginBottom: 8,
    shadowColor: "#7a41bb", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  venteLeft: { flex: 1 },
  venteNom: { fontFamily: Fonts.family.nowMedium, fontSize: 13, color: Colors.text },
  venteMeta: { fontFamily: Fonts.family.nowRegular, fontSize: 11, color: Colors.textLight, marginTop: 2 },
  ventePrix: { fontFamily: "Norwester", fontSize: 16, color: Colors.primary },

  // Modal
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { backgroundColor: Colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "#ddd", alignSelf: "center", marginBottom: 16 },
  sheetTitre: { fontFamily: "Norwester", fontSize: 18, color: Colors.text, letterSpacing: 1, marginBottom: 16 },
  fieldLabel: { fontFamily: Fonts.family.nowMedium, fontSize: 12, color: Colors.textLight, marginBottom: 4, marginTop: 8, textTransform: "uppercase" },
  fieldRow: { flexDirection: "row" },
  input: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    fontFamily: Fonts.family.nowRegular, fontSize: 14, color: Colors.text,
    backgroundColor: "#fafafa",
  },
  confirmBtn: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 16 },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnTxt: { fontFamily: Fonts.family.nowBold, fontSize: 14, color: "#fff" },
});
