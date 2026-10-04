import { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { evenementService, boutiqueService } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Radius } from "@/constants/spacing";
import { shadows } from "@/styles/utils/shadows.styles";

function fmt(n: number) {
  return (Math.round(n * 100) / 100).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " €";
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function PersonnelRecap({ onSwitchToGerante }: { onSwitchToGerante?: () => void }) {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const setActiveEvenement = useAuthStore((s) => s.setActiveEvenement);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [nomNouvelEvent, setNomNouvelEvent] = useState("");

  const { data: evenements, isLoading: loadingEvents } = useQuery<any[]>({
    queryKey: ["evenements-recap"],
    queryFn: () => evenementService.getAll(),
  });

  const { data: boutiques, isLoading: loadingBoutiques } = useQuery<any[]>({
    queryKey: ["boutiques-recap"],
    queryFn: () => boutiqueService.getMesBoutiques(),
  });

  const { mutate: creerEvenement, isPending: isCreating } = useMutation({
    mutationFn: () => evenementService.creerMonEvenement(nomNouvelEvent.trim()),
    onSuccess: (newEvent) => {
      queryClient.invalidateQueries({ queryKey: ["evenements-recap"] });
      queryClient.invalidateQueries({ queryKey: ["mes-evenements"] });
      setNomNouvelEvent("");
      setShowCreateForm(false);
      // Active directement le nouvel événement
      setActiveEvenement(newEvent.id, newEvent.nom);
    },
    onError: () => Alert.alert("Erreur", "Impossible de créer l'événement."),
  });

  const events: any[] = evenements ?? [];
  const bouts: any[] = boutiques ?? [];
  const loading = loadingEvents || loadingBoutiques;

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 20 }, onSwitchToGerante && s.headerRow]}>
        <View>
          <Text style={s.sousTitre}>AUCUN ÉVÉNEMENT ACTIF</Text>
          <Text style={s.titre}>Ma fiche</Text>
        </View>
        {onSwitchToGerante && (
          <TouchableOpacity style={s.switchBtn} onPress={onSwitchToGerante} activeOpacity={0.8}>
            <Text style={s.switchBtnTxt}>🏪 Créatrices</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* Bloc explicatif — toujours visible */}
          <View style={s.howCard}>
            <Text style={s.howTitle}>Comment vendre ?</Text>
            <View style={s.howStep}>
              <View style={s.howBullet}><Text style={s.howBulletTxt}>1</Text></View>
              <Text style={s.howTxt}>Active un de tes événements ci-dessous</Text>
            </View>
            <View style={s.howStep}>
              <View style={s.howBullet}><Text style={s.howBulletTxt}>2</Text></View>
              <Text style={s.howTxt}>Va dans l'onglet <Text style={s.howTxtBold}>Ventes</Text> et appuie sur <Text style={s.howTxtBold}>Ajouter une vente</Text></Text>
            </View>
            <View style={s.howStep}>
              <View style={s.howBullet}><Text style={s.howBulletTxt}>3</Text></View>
              <Text style={s.howTxt}>Choisis tes articles et le mode de paiement</Text>
            </View>
          </View>

          {/* Événements */}
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Mes événements ({events.length})</Text>
            {!showCreateForm && (
              <TouchableOpacity style={s.createBtn} onPress={() => setShowCreateForm(true)} activeOpacity={0.8}>
                <Text style={s.createBtnTxt}>+ Nouveau</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Formulaire création inline */}
          {showCreateForm && (
            <View style={s.createForm}>
              <TextInput
                style={s.createInput}
                placeholder="Nom de l'événement"
                placeholderTextColor={Colors.textLight}
                value={nomNouvelEvent}
                onChangeText={setNomNouvelEvent}
                autoFocus
              />
              <View style={s.createFormActions}>
                <TouchableOpacity
                  style={s.createFormCancel}
                  onPress={() => { setShowCreateForm(false); setNomNouvelEvent(""); }}
                  activeOpacity={0.8}
                >
                  <Text style={s.createFormCancelTxt}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.createFormConfirm, (!nomNouvelEvent.trim() || isCreating) && s.createFormConfirmDisabled]}
                  onPress={() => creerEvenement()}
                  disabled={!nomNouvelEvent.trim() || isCreating}
                  activeOpacity={0.85}
                >
                  {isCreating
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={s.createFormConfirmTxt}>Créer et activer</Text>
                  }
                </TouchableOpacity>
              </View>
            </View>
          )}

          {events.length === 0 && !showCreateForm ? (
            <View style={s.emptyBox}>
              <Text style={s.emptyIcon}>📅</Text>
              <Text style={s.emptyTxt}>Aucun événement</Text>
              <Text style={s.emptySub}>Crée ton premier événement avec le bouton "Nouveau" ci-dessus</Text>
            </View>
          ) : (
            events.map((e) => {
              const ca = (e.ventes ?? []).reduce((acc: number, v: any) => acc + (v.prixVente ?? 0), 0);
              const nb = e.ventes?.length ?? 0;
              return (
                <TouchableOpacity
                  key={e.id}
                  style={s.eventCard}
                  onPress={() => setActiveEvenement(e.id, e.nom)}
                  activeOpacity={0.75}
                >
                  <View style={s.eventCardLeft}>
                    <Text style={s.eventNom} numberOfLines={1}>{e.nom}</Text>
                    <Text style={s.eventMeta}>{fmtDate(e.dateDebut)} · {nb} vente{nb > 1 ? "s" : ""}</Text>
                  </View>
                  <View style={s.eventRight}>
                    <Text style={s.eventCa}>{fmt(ca)}</Text>
                    <View style={s.activerBtn}>
                      <Text style={s.activerBtnTxt}>Activer ›</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}

          {/* Boutiques membres */}
          {bouts.length > 0 && (
            <>
              <Text style={[s.sectionTitle, { marginTop: 20 }]}>Mes boutiques ({bouts.length})</Text>
              {bouts.map((b) => (
                <View key={b.id} style={s.boutiqueCard}>
                  <Text style={s.boutiqueNom} numberOfLines={1}>{b.nom}</Text>
                  {b.nbVentes != null && (
                    <Text style={s.boutiqueMeta}>{b.nbVentes} vente{b.nbVentes > 1 ? "s" : ""}{b.ca != null ? ` · ${fmt(b.ca)}` : ""}</Text>
                  )}
                </View>
              ))}
            </>
          )}

          <View style={{ height: insets.bottom + 20 }} />
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // Header crème — même DA que le web
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  switchBtn: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  switchBtnTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: 12,
    color: Colors.text,
  },
  titre: { fontFamily: Fonts.family.norwester, fontWeight: "800", fontSize: 30, color: Colors.text, letterSpacing: -0.5 },
  sousTitre: { fontFamily: Fonts.family.nowBold, fontSize: 12, color: Colors.primary, letterSpacing: 0.6, marginBottom: 4 },

  scroll: { padding: 16 },

  // Bloc "comment vendre" (même rendu que le Dashboard web créatrice)
  howCard: {
    backgroundColor: Colors.primaryTint,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 20,
  },
  howTitle: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 14,
    color: Colors.primaryDark,
    marginBottom: 12,
  },
  howStep: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 8 },
  howBullet: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: Colors.primary,
    alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  },
  howBulletTxt: { fontFamily: Fonts.family.nowBold, fontSize: 11, color: "#fff" },
  howTxt: { fontFamily: Fonts.family.nowRegular, fontSize: 13, color: Colors.text, flex: 1, lineHeight: 19 },
  howTxtBold: { fontFamily: Fonts.family.nowBold, color: Colors.text },

  sectionRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 10, marginTop: 4,
  },
  sectionTitle: {
    fontFamily: Fonts.family.norwester, fontWeight: "800", fontSize: Fonts.sizes.lg, color: Colors.text,
    letterSpacing: -0.3,
  },
  // = Button primary size="sm"
  createBtn: {
    paddingHorizontal: 14, minHeight: 36, justifyContent: "center",
    backgroundColor: Colors.text, borderRadius: Radius.md,
  },
  createBtnTxt: { fontFamily: Fonts.family.nowBold, fontSize: 13, color: "#fff" },

  // Formulaire création
  createForm: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 16,
    marginBottom: 12, ...shadows.sm,
  },
  createInput: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md,
    paddingHorizontal: 16, paddingVertical: 12,
    fontFamily: Fonts.family.nowRegular, fontSize: 16, color: Colors.text,
    marginBottom: 12,
  },
  createFormActions: { flexDirection: "row", gap: 8 },
  createFormCancel: {
    flex: 1, minHeight: 44, borderRadius: Radius.md, justifyContent: "center",
    borderWidth: 1.5, borderColor: Colors.border, alignItems: "center",
  },
  createFormCancelTxt: { fontFamily: Fonts.family.nowMedium, fontSize: 14, color: Colors.text },
  createFormConfirm: {
    flex: 2, minHeight: 44, borderRadius: Radius.md, justifyContent: "center",
    backgroundColor: Colors.text, alignItems: "center",
  },
  createFormConfirmDisabled: { opacity: 0.5 },
  createFormConfirmTxt: { fontFamily: Fonts.family.nowBold, fontSize: 14, color: "#fff" },

  emptyBox: { alignItems: "center", paddingVertical: 28 },
  emptyIcon: { fontSize: 32, marginBottom: 6 },
  emptyTxt: { fontFamily: Fonts.family.nowBold, fontSize: 13, color: Colors.text, marginBottom: 4 },
  emptySub: { fontFamily: Fonts.family.nowRegular, fontSize: 12, color: Colors.textLight, textAlign: "center", lineHeight: 18 },

  // Event card cliquable
  eventCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 16, marginBottom: 10,
    ...shadows.sm,
  },
  eventCardLeft: { flex: 1, marginRight: 10 },
  eventNom: { fontFamily: Fonts.family.nowBold, fontSize: 14, color: Colors.text, marginBottom: 2 },
  eventMeta: { fontFamily: Fonts.family.nowRegular, fontSize: 12, color: Colors.textLight },
  eventRight: { alignItems: "flex-end", gap: 6 },
  eventCa: { fontFamily: Fonts.family.nowBold, fontSize: 15, color: Colors.text },
  activerBtn: {
    backgroundColor: Colors.text, borderRadius: Radius.sm,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  activerBtnTxt: { fontFamily: Fonts.family.nowBold, fontSize: 12, color: "#fff" },

  // Boutique card
  boutiqueCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 16, marginBottom: 10,
    ...shadows.sm,
  },
  boutiqueNom: { fontFamily: Fonts.family.nowBold, fontSize: 14, color: Colors.text, marginBottom: 2 },
  boutiqueMeta: { fontFamily: Fonts.family.nowRegular, fontSize: 12, color: Colors.textLight },
});
