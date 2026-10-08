import { useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { evenementService, boutiqueService } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Radius } from "@/constants/spacing";
import Button from "@/components/Buttons/Button";
import Card from "@/components/Cards/Card";
import Badge from "@/components/Badge/Badge";
import Avatar from "@/components/Avatar/Avatar";
import Field from "@/components/Inputs/Field";
import { Notice } from "@/components/Notice/Notice";
import EventFiche from "@/pages/Creatrice/EventFiche";

function fmt(n: number) {
  return (Math.round(n * 100) / 100).toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

/** Onglet « Événements » (vue créatrice) — remplace « Ma fiche » et « Boutique » : un seul endroit
 * pour choisir où l'on vend. Un seul événement est actif à la fois. */
export default function Evenements() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const activeEvenementId = useAuthStore((s) => s.activeEvenementId);
  const setActiveEvenement = useAuthStore((s) => s.setActiveEvenement);
  const isPro = user?.plan === "PRO" || user?.plan === "DUO";

  const [creating, setCreating] = useState(false);
  const [nom, setNom] = useState("");
  const [ouvert, setOuvert] = useState<{ id: string; nom: string } | null>(null);

  const { data: evenements, isLoading: loadingEvents } = useQuery<any[]>({
    queryKey: ["evenements-recap"],
    queryFn: () => evenementService.getAll(),
  });
  const { data: boutiques, isLoading: loadingBoutiques } = useQuery<any[]>({
    queryKey: ["boutiques-recap"],
    queryFn: () => boutiqueService.getMesBoutiques(),
  });

  const { mutate: creer, isPending } = useMutation({
    mutationFn: () => evenementService.creerMonEvenement(nom.trim()),
    onSuccess: (newEvent) => {
      queryClient.invalidateQueries({ queryKey: ["evenements-recap"] });
      queryClient.invalidateQueries({ queryKey: ["mes-evenements"] });
      setNom("");
      setCreating(false);
      // Active directement le nouvel événement
      setActiveEvenement(newEvent.id, newEvent.nom);
    },
    onError: () => Alert.alert("Erreur", "Impossible de créer l'événement."),
  });

  const events: any[] = evenements ?? [];
  const bouts: any[] = boutiques ?? [];
  // FREE : 1 événement maximum ; PRO/DUO : illimité (le serveur applique la même règle)
  const canCreate = isPro || events.length < 1;

  // Fiche d'un événement : stats, articles, dernières ventes
  if (ouvert) {
    return <EventFiche evenementId={ouvert.id} evenementNom={ouvert.nom} onBack={() => setOuvert(null)} />;
  }

  return (
    <View style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <View style={{ flex: 1 }}>
            <Text style={s.titre}>Événements</Text>
            <Text style={s.sub}>Là où tu vends : marchés, salons, boutiques partenaires</Text>
          </View>
        </View>

        {canCreate && !creating && (
          <Button fullWidth onPress={() => setCreating(true)}>+ Nouvel événement</Button>
        )}
        {!canCreate && <Notice>🔒 Plan FREE : 1 événement maximum. Passe à PRO pour en créer davantage.</Notice>}

        {creating && (
          <Card style={{ gap: 12 }}>
            <Field label="Nom de l'événement" value={nom} onChangeText={setNom} placeholder="Ex : Marché de Noël 2026" autoFocus />
            <View style={s.formRow}>
              <Button variant="secondary" style={{ flex: 1 }} onPress={() => { setCreating(false); setNom(""); }}>
                Annuler
              </Button>
              <Button style={{ flex: 1 }} disabled={!nom.trim()} loading={isPending} onPress={() => creer()}>
                Créer et activer
              </Button>
            </View>
          </Card>
        )}

        {loadingEvents || loadingBoutiques ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 30 }} />
        ) : events.length === 0 && !creating ? (
          <Notice>Aucun événement pour l'instant — crée-en un pour pouvoir enregistrer des ventes.</Notice>
        ) : (
          events.map((e) => {
            const actif = e.id === activeEvenementId;
            const nb = e.ventes?.length ?? 0;
            const ca = (e.ventes ?? []).reduce((acc: number, v: any) => acc + (v.prixVente ?? 0), 0);
            return (
              <Card key={e.id} style={actif ? s.cardActive : undefined}>
                <View style={s.line}>
                  <Text style={s.nom} numberOfLines={1}>{e.nom}</Text>
                  {actif && <Badge color="success">Actif</Badge>}
                </View>
                <Text style={s.meta}>{fmtDate(e.dateDebut)} · {nb} vente{nb > 1 ? "s" : ""} · {fmt(ca)}</Text>
                <View style={s.actions}>
                  {actif ? (
                    <Button size="sm" onPress={() => router.push("/(app)/ventes?nouvelle=1")}>+ Vente</Button>
                  ) : (
                    <Button size="sm" variant="secondary" onPress={() => setActiveEvenement(e.id, e.nom)}>Activer</Button>
                  )}
                  <Button size="sm" variant="secondary" onPress={() => setOuvert({ id: e.id, nom: e.nom })}>Ouvrir</Button>
                </View>
              </Card>
            );
          })
        )}

        {bouts.length > 0 && (
          <>
            <Text style={s.sectionTitle}>Mes boutiques partenaires</Text>
            {bouts.map((b) => (
              <TouchableOpacity
                key={b.id}
                activeOpacity={0.8}
                onPress={() => router.push(`/(app)/mes-ventes-boutique/${b.id}?nom=${encodeURIComponent(b.nom)}`)}
                accessibilityRole="button"
                accessibilityLabel={`Voir mes ventes dans ${b.nom}`}
              >
                <Card>
                  <View style={s.line}>
                    <Avatar name={b.nom} size="sm" />
                    <View style={{ flex: 1 }}>
                      <Text style={s.nom} numberOfLines={1}>{b.nom}</Text>
                      <Text style={s.meta}>Tu es membre de cette boutique</Text>
                    </View>
                    <Text style={s.lien}>Mes ventes ›</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: 16, gap: 12, paddingBottom: 40 },
  header: { flexDirection: "row", alignItems: "flex-start", paddingTop: 4, marginBottom: 4 },
  titre: { fontFamily: Fonts.family.norwester, fontWeight: "800", fontSize: 30, color: Colors.text, letterSpacing: -0.5 },
  sub: { fontFamily: Fonts.family.nowRegular, fontSize: Fonts.sizes.sm, color: Colors.textLight, marginTop: 4 },
  formRow: { flexDirection: "row", gap: 8 },
  cardActive: { borderWidth: 2, borderColor: Colors.primary },
  line: { flexDirection: "row", alignItems: "center", gap: 10 },
  nom: { fontFamily: Fonts.family.nowBold, fontSize: Fonts.sizes.md, color: Colors.text, flexShrink: 1 },
  meta: { fontFamily: Fonts.family.nowRegular, fontSize: Fonts.sizes.xs, color: Colors.textLight, marginTop: 2 },
  actions: { flexDirection: "row", gap: 8, marginTop: 12 },
  sectionTitle: { fontFamily: Fonts.family.norwester, fontWeight: "800", fontSize: Fonts.sizes.lg, color: Colors.text, letterSpacing: -0.3, marginTop: 12 },
  lien: { fontFamily: Fonts.family.nowMedium, fontSize: Fonts.sizes.xs, color: Colors.textLight },
});
