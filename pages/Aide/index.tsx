import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import { useAuthStore } from "@/stores/auth.store";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { shadows } from "@/styles/utils/shadows.styles";
import { Radius } from "@/constants/spacing";

interface HelpItem {
  title: string;
  body: string;
  badge?: "PRO" | "DUO";
}

interface HelpSection {
  title: string;
  items: HelpItem[];
}

export default function AideScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const duoMode = useAuthStore((state) => state.duoMode);

  const isDuo = user?.role === "GERANTE_CREATRICE";
  const isGerante = user?.role === "GERANTE" || (isDuo && duoMode === "GERANTE");

  //- Une seule réponse ouverte à la fois, identifiée par "sectionIndex-itemIndex"
  const [openKey, setOpenKey] = useState<string | null>(null);

  const sections: HelpSection[] = [
    {
      title: "Démarrage",
      items: [
        {
          title: "Quelle différence entre Gérante et Créatrice ?",
          body: "La Gérante gère la boutique, ses créatrices et les stats globales. La Créatrice voit uniquement ses propres ventes et commissions. Le mode DUO permet de cumuler les deux rôles sur un seul compte.",
        },
        ...(isGerante
          ? [{
              title: "Créer ma boutique",
              body: "Depuis le Dashboard, appuyez sur « Créer ma première boutique », donnez-lui un nom et validez. Vous pourrez ensuite inviter des créatrices et enregistrer des ventes.",
            }]
          : [{
              title: "Créer un événement",
              body: "Dans l'onglet Profil, section « Mes événements », appuyez sur « Créer un événement ». Donnez-lui un nom (ex : Marché de Noël 2025). En plan FREE, vous êtes limité à 1 événement actif.",
            }]),
      ],
    },
    ...(isGerante
      ? [{
          title: "Créatrices",
          items: [
            {
              title: "Ajouter une créatrice (fiche directe)",
              body: "Dans l'onglet Créatrices, appuyez sur +, puis choisissez « Créer une fiche ». La créatrice apparaît immédiatement dans votre liste, sans qu'elle ait besoin de compte.",
            },
            {
              title: "Inviter une créatrice (par email)",
              body: "Dans l'onglet Créatrices, appuyez sur +, puis choisissez « Inviter par email ». La créatrice reçoit un email avec un lien pour créer son propre compte et accéder à sa fiche.",
            },
          ],
        }]
      : []),
    {
      title: "Articles",
      items: [
        {
          title: "Créer un article manuellement",
          body: "Depuis votre fiche (onglet Créatrices), appuyez sur +, renseignez le nom, le prix et la quantité, puis validez.",
        },
        {
          title: "Importer un CSV / Excel",
          body: "Depuis la même page, utilisez le bouton d'import pour charger un fichier CSV ou Excel contenant vos articles en une seule fois.",
        },
      ],
    },
    {
      title: "Ventes",
      items: [
        {
          title: "Enregistrer une vente",
          body: "Dans l'onglet Ventes, appuyez sur le bouton +. Sélectionnez l'article vendu (ou saisissez-en un manuellement), le prix et le mode de paiement, puis validez.",
        },
      ],
    },
    {
      title: "Stats & export",
      items: [
        {
          title: "Lire mes statistiques",
          body: "L'onglet Stats affiche votre chiffre d'affaires, le ticket moyen, l'évolution par rapport à la période précédente, et le détail par créatrice ou événement.",
        },
        {
          title: "Exporter en PDF",
          body: "Depuis l'onglet Stats, appuyez sur le bouton d'export puis choisissez PDF. En plan FREE, l'export comporte un filigrane.",
        },
        {
          title: "Exporter en CSV",
          body: "Depuis l'onglet Stats, choisissez CSV pour récupérer toutes vos ventes dans un tableur.",
          badge: "PRO",
        },
      ],
    },
    {
      title: "Mon compte",
      items: [
        {
          title: "Comment modifier mon email ?",
          body: "La modification d'email n'est pas disponible dans l'app pour l'instant. Contactez-nous à contact.encaissly@gmail.com.",
        },
      ],
    },
    {
      title: "Abonnement",
      items: [
        {
          title: "Passer PRO / DUO",
          body: "Dans l'onglet Profil, section Abonnement, choisissez votre formule (mensuelle ou annuelle) et validez. Le paiement est géré par Stripe.",
        },
        {
          title: "Puis-je avoir plusieurs boutiques ?",
          body: "Oui, avec le plan PRO. En plan FREE, vous êtes limité à 1 boutique et 3 créatrices maximum.",
        },
        ...(isDuo
          ? [{
              title: "Mode DUO : basculer de vue",
              body: "Un toggle Gérante/Créatrice apparaît en haut de chaque écran principal pour basculer entre les deux vues, sans changer de compte.",
              badge: "DUO" as const,
            }]
          : []),
        {
          title: "Résilier mon abonnement",
          body: "Dans l'onglet Profil, section Abonnement, appuyez sur « Résilier l'abonnement ». Vous repassez immédiatement en plan FREE.",
        },
      ],
    },
  ];

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <AntDesign name="arrow-left" size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Aide</Text>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.intro}>
          Retrouvez ici comment faire les actions essentielles dans Encaissly.
        </Text>

        {sections.map((section, si) => (
          <View key={section.title}>
            <Text style={s.sectionTitle}>{section.title}</Text>
            <View style={s.card}>
              {section.items.map((item, ii) => {
                const key = `${si}-${ii}`;
                const isOpen = openKey === key;
                return (
                  <View key={key}>
                    {ii > 0 && <View style={s.divider} />}
                    <TouchableOpacity
                      style={s.itemHeader}
                      onPress={() => setOpenKey(isOpen ? null : key)}
                      activeOpacity={0.75}
                    >
                      <View style={s.itemTitleRow}>
                        <Text style={s.itemTitleTxt}>{item.title}</Text>
                        {item.badge && (
                          <View
                            style={[
                              s.badge,
                              { backgroundColor: item.badge === "PRO" ? Colors.successSolid : Colors.duo },
                            ]}
                          >
                            <Text style={s.badgeTxt}>{item.badge}</Text>
                          </View>
                        )}
                      </View>
                      <AntDesign name={isOpen ? "up" : "down"} size={12} color={Colors.textLight} />
                    </TouchableOpacity>
                    {isOpen && <Text style={s.itemBody}>{item.body}</Text>}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  // Header crème — même DA que le web
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800",
    fontSize: 24,
    color: Colors.text,
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  content: { padding: 20 },
  intro: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 19,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800",
    fontSize: Fonts.sizes.lg,
    color: Colors.text,
    letterSpacing: -0.3,
    marginBottom: 10,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...shadows.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 10,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
    gap: 8,
  },
  itemTitleRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemTitleTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: 14,
    color: Colors.text,
    flexShrink: 1,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 10,
    color: "#fff",
  },
  itemBody: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 19,
    marginTop: 6,
    marginBottom: 4,
  },
});
