import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <Text style={s.sectionBody}>{children}</Text>
    </View>
  );
}

export default function LegalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <AntDesign name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={s.headerTitle}>CGU & Confidentialité</Text>
      </View>

      <ScrollView contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.lastUpdate}>Dernière mise à jour : juin 2026</Text>

        <Section title="1. Présentation">
          {`Encaissly est une application mobile de caisse destinée aux boutiques de créateurs. Elle est éditée par Encaissly SAS et permet d'enregistrer des ventes, suivre les commissions des créatrices, et gérer les statistiques d'activité.`}
        </Section>

        <Section title="2. Données collectées">
          {`En créant un compte, nous collectons :\n• Votre adresse email\n• Votre nom et prénom (facultatifs)\n• Les données liées à votre activité (ventes, montants, créatrices)\n\nCes données sont nécessaires au fonctionnement du service et ne sont jamais vendues à des tiers.`}
        </Section>

        <Section title="3. Utilisation des données">
          {`Vos données sont utilisées exclusivement pour :\n• Gérer votre compte et votre abonnement\n• Afficher vos statistiques de vente\n• Vous envoyer des notifications liées à votre activité (si activé)\n• Gérer la facturation via Stripe`}
        </Section>

        <Section title="4. Hébergement et sécurité">
          {`Les données sont hébergées en Europe (Neon / AWS eu-central-1). Les mots de passe sont hachés (bcrypt) et ne sont jamais stockés en clair. Les communications sont chiffrées (HTTPS/TLS).`}
        </Section>

        <Section title="5. Durée de conservation">
          {`Vos données sont conservées pendant la durée de votre abonnement et 12 mois après sa résiliation, conformément à nos obligations légales. Vous pouvez demander la suppression de votre compte à tout moment.`}
        </Section>

        <Section title="6. Vos droits (RGPD)">
          {`Conformément au RGPD, vous disposez des droits suivants :\n• Accès à vos données\n• Rectification de vos données\n• Suppression de votre compte\n• Portabilité de vos données\n• Opposition au traitement\n\nPour exercer ces droits, contactez-nous à : support@encaissly.fr`}
        </Section>

        <Section title="7. Cookies et tracking">
          {`L'application n'utilise pas de cookies de tracking publicitaire. Seules les données strictement nécessaires au fonctionnement sont collectées.`}
        </Section>

        <Section title="8. Paiements">
          {`Les paiements sont traités par Stripe, Inc. Encaissly ne stocke jamais vos coordonnées bancaires. Consultez la politique de confidentialité de Stripe sur stripe.com.`}
        </Section>

        <Section title="9. Modifications">
          {`Nous pouvons mettre à jour ces conditions. En cas de modification substantielle, vous serez notifié par email ou via l'application. La poursuite de l'utilisation après notification vaut acceptation.`}
        </Section>

        <Section title="10. Contact">
          {`Pour toute question relative à vos données ou à ces conditions :\nEmail : support@encaissly.fr`}
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 14,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    fontFamily: Fonts.family.norwester,
    fontSize: 18,
    color: "#fff",
    letterSpacing: 1,
  },
  content: { padding: 20 },
  lastUpdate: {
    fontFamily: Fonts.family.nowLight,
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 20,
  },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 6,
  },
  sectionBody: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 20,
  },
});
