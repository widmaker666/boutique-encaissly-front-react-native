import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { evenementService, boutiqueService } from "@/services/api";
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

export default function PersonnelRecap() {
  const insets = useSafeAreaInsets();

  const { data: evenements, isLoading: loadingEvents } = useQuery<any[]>({
    queryKey: ["evenements-recap"],
    queryFn: () => evenementService.getAll(),
  });

  const { data: boutiques, isLoading: loadingBoutiques } = useQuery<any[]>({
    queryKey: ["boutiques-recap"],
    queryFn: () => boutiqueService.getMesBoutiques(),
  });

  const events: any[] = evenements ?? [];
  const bouts: any[] = boutiques ?? [];
  const loading = loadingEvents || loadingBoutiques;

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={[s.header, { paddingTop: insets.top + 20 }]}>
        <Text style={s.titre}>MODE PERSONNEL</Text>
        <Text style={s.sousTitre}>VUE D'ENSEMBLE</Text>
      </View>

      {/* Bannière info */}
      <View style={s.infoBanner}>
        <Text style={s.infoIcon}>🎪</Text>
        <Text style={s.infoTxt}>
          Sélectionne un événement depuis le Dashboard pour vendre et gérer tes articles
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* Événements */}
          <Text style={s.sectionTitle}>MES ÉVÉNEMENTS ({events.length})</Text>
          {events.length === 0 ? (
            <View style={s.emptyBox}>
              <Text style={s.emptyIcon}>📅</Text>
              <Text style={s.emptyTxt}>Aucun événement</Text>
              <Text style={s.emptySub}>Crée ton premier événement depuis le Dashboard</Text>
            </View>
          ) : (
            events.map((e) => {
              const ca = (e.ventes ?? []).reduce((acc: number, v: any) => acc + (v.prixVente ?? 0), 0);
              const nb = e.ventes?.length ?? 0;
              return (
                <View key={e.id} style={s.card}>
                  <View style={s.cardTop}>
                    <Text style={s.cardNom} numberOfLines={1}>{e.nom}</Text>
                    <Text style={s.cardCa}>{fmt(ca)}</Text>
                  </View>
                  <View style={s.cardBottom}>
                    <Text style={s.cardMeta}>{fmtDate(e.dateDebut)}</Text>
                    <Text style={s.cardVentes}>{nb} vente{nb > 1 ? "s" : ""}</Text>
                  </View>
                </View>
              );
            })
          )}

          {/* Boutiques */}
          {bouts.length > 0 && (
            <>
              <Text style={[s.sectionTitle, { marginTop: 16 }]}>MES BOUTIQUES ({bouts.length})</Text>
              {bouts.map((b) => (
                <View key={b.id} style={s.card}>
                  <View style={s.cardTop}>
                    <Text style={s.cardNom} numberOfLines={1}>{b.nom}</Text>
                    {b.ca != null && <Text style={s.cardCa}>{fmt(b.ca)}</Text>}
                  </View>
                  {b.nbVentes != null && (
                    <View style={s.cardBottom}>
                      <Text style={s.cardVentes}>{b.nbVentes} vente{b.nbVentes > 1 ? "s" : ""}</Text>
                    </View>
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
  titre: { fontFamily: "Norwester", fontSize: 20, color: "#fff", letterSpacing: 2 },
  sousTitre: { fontFamily: Fonts.family.nowRegular, fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 4 },

  infoBanner: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#f0eaf9", marginHorizontal: 16, marginTop: 16,
    borderRadius: 12, padding: 14,
    borderLeftWidth: 3, borderLeftColor: Colors.primary,
  },
  infoIcon: { fontSize: 22 },
  infoTxt: { fontFamily: Fonts.family.nowRegular, fontSize: 13, color: Colors.text, flex: 1, lineHeight: 18 },

  scroll: { padding: 16 },

  sectionTitle: {
    fontFamily: Fonts.family.nowBold, fontSize: 12, color: Colors.textLight,
    letterSpacing: 1, textTransform: "uppercase", marginBottom: 10, marginTop: 4,
  },

  emptyBox: { alignItems: "center", paddingVertical: 24 },
  emptyIcon: { fontSize: 32, marginBottom: 6 },
  emptyTxt: { fontFamily: Fonts.family.nowBold, fontSize: 13, color: Colors.text, marginBottom: 4 },
  emptySub: { fontFamily: Fonts.family.nowRegular, fontSize: 12, color: Colors.textLight, textAlign: "center" },

  card: {
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14, marginBottom: 10,
    shadowColor: "#7a41bb", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  cardNom: { fontFamily: Fonts.family.nowBold, fontSize: 14, color: Colors.text, flex: 1, marginRight: 8 },
  cardCa: { fontFamily: "Norwester", fontSize: 16, color: Colors.primary },
  cardBottom: { flexDirection: "row", justifyContent: "space-between" },
  cardMeta: { fontFamily: Fonts.family.nowRegular, fontSize: 11, color: Colors.textLight },
  cardVentes: { fontFamily: Fonts.family.nowRegular, fontSize: 11, color: Colors.textLight },
});
