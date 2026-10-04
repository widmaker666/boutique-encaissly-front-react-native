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
          <Text style={s.titre}>MA FICHE</Text>
          <Text style={s.sousTitre}>AUCUN ÉVÉNEMENT ACTIF</Text>
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
            <Text style={s.sectionTitle}>MES ÉVÉNEMENTS ({events.length})</Text>
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
              <Text style={[s.sectionTitle, { marginTop: 20 }]}>MES BOUTIQUES ({bouts.length})</Text>
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

  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 24,
    alignItems: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  switchBtn: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  switchBtnTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: 12,
    color: "#fff",
  },
  titre: { fontFamily: Fonts.family.norwester, fontSize: 20, color: "#fff", letterSpacing: 2 },
  sousTitre: { fontFamily: Fonts.family.nowRegular, fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4 },

  scroll: { padding: 16 },

  // Bloc "comment vendre"
  howCard: {
    backgroundColor: "#f0eaf9",
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
  },
  howTitle: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 14,
    color: Colors.primary,
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
  howTxtBold: { fontFamily: Fonts.family.nowBold, color: Colors.primary },

  sectionRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginBottom: 10, marginTop: 4,
  },
  sectionTitle: {
    fontFamily: Fonts.family.nowBold, fontSize: 12, color: Colors.textLight,
    letterSpacing: 1, textTransform: "uppercase",
  },
  createBtn: {
    paddingHorizontal: 12, paddingVertical: 5,
    backgroundColor: Colors.primary, borderRadius: 16,
  },
  createBtnTxt: { fontFamily: Fonts.family.nowMedium, fontSize: 12, color: "#fff" },

  // Formulaire création
  createForm: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
    marginBottom: 12,
    shadowColor: "#7a41bb", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  createInput: {
    borderWidth: 1.5, borderColor: Colors.primary, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    fontFamily: Fonts.family.nowRegular, fontSize: 14, color: Colors.text,
    marginBottom: 10,
  },
  createFormActions: { flexDirection: "row", gap: 8 },
  createFormCancel: {
    flex: 1, paddingVertical: 10, borderRadius: 8,
    borderWidth: 1, borderColor: Colors.border, alignItems: "center",
  },
  createFormCancelTxt: { fontFamily: Fonts.family.nowMedium, fontSize: 13, color: Colors.textLight },
  createFormConfirm: {
    flex: 2, paddingVertical: 10, borderRadius: 8,
    backgroundColor: Colors.primary, alignItems: "center",
  },
  createFormConfirmDisabled: { opacity: 0.4 },
  createFormConfirmTxt: { fontFamily: Fonts.family.nowBold, fontSize: 13, color: "#fff" },

  emptyBox: { alignItems: "center", paddingVertical: 28 },
  emptyIcon: { fontSize: 32, marginBottom: 6 },
  emptyTxt: { fontFamily: Fonts.family.nowBold, fontSize: 13, color: Colors.text, marginBottom: 4 },
  emptySub: { fontFamily: Fonts.family.nowRegular, fontSize: 12, color: Colors.textLight, textAlign: "center", lineHeight: 18 },

  // Event card cliquable
  eventCard: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14, marginBottom: 10,
    shadowColor: "#7a41bb", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  eventCardLeft: { flex: 1, marginRight: 10 },
  eventNom: { fontFamily: Fonts.family.nowBold, fontSize: 14, color: Colors.text, marginBottom: 2 },
  eventMeta: { fontFamily: Fonts.family.nowRegular, fontSize: 11, color: Colors.textLight },
  eventRight: { alignItems: "flex-end", gap: 6 },
  eventCa: { fontFamily: Fonts.family.norwester, fontSize: 15, color: Colors.primary },
  activerBtn: {
    backgroundColor: Colors.primary, borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  activerBtnTxt: { fontFamily: Fonts.family.nowBold, fontSize: 11, color: "#fff" },

  // Boutique card
  boutiqueCard: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14, marginBottom: 10,
    shadowColor: "#7a41bb", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
  },
  boutiqueNom: { fontFamily: Fonts.family.nowBold, fontSize: 14, color: Colors.text, marginBottom: 2 },
  boutiqueMeta: { fontFamily: Fonts.family.nowRegular, fontSize: 11, color: Colors.textLight },
});
