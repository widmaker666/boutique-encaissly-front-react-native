import { useRef } from "react";
import { ScrollView, Text, View, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Radius } from "@/constants/spacing";
import { LEGAL_PARTS, LEGAL_UPDATED_AT } from "@/constants/legal";

// Contenu dans constants/legal.ts (partagé à l'identique avec le web).

export default function LegalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const partY = useRef<Record<string, number>>({});

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7} accessibilityLabel="Retour">
          <AntDesign name="arrow-left" size={20} color={Colors.text} />
        </TouchableOpacity>
        <View style={{ flexShrink: 1 }}>
          <Text style={s.eyebrow}>ENCAISSLY</Text>
          <Text style={s.headerTitle}>Informations légales</Text>
        </View>
      </View>

      <ScrollView ref={scrollRef} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.lastUpdate}>Dernière mise à jour : {LEGAL_UPDATED_AT}</Text>

        <View style={s.card}>
          <Text style={s.tocTitle}>Sommaire</Text>
          {LEGAL_PARTS.map((p, i) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => scrollRef.current?.scrollTo({ y: partY.current[p.id] ?? 0, animated: true })}
              activeOpacity={0.7}
              style={s.tocRow}
            >
              <Text style={s.tocLink}>{`${i + 1}. ${p.title}`}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {LEGAL_PARTS.map((part) => (
          <View
            key={part.id}
            style={s.card}
            onLayout={(e) => {
              partY.current[part.id] = e.nativeEvent.layout.y;
            }}
          >
            <Text style={s.partTitle}>{part.title}</Text>
            {part.intro && <Text style={s.partIntro}>{part.intro}</Text>}
            {part.sections.map((sec) => (
              <View key={sec.title} style={s.section}>
                <Text style={s.sectionTitle}>{sec.title}</Text>
                <Text style={s.sectionBody} selectable>{sec.body}</Text>
              </View>
            ))}
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
  eyebrow: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 11,
    color: Colors.primary,
    letterSpacing: 1,
  },
  headerTitle: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800",
    fontSize: 24,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  content: { padding: 16, gap: 14 },
  lastUpdate: {
    fontFamily: Fonts.family.nowLight,
    fontSize: 12,
    color: Colors.textLight,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
  },
  tocTitle: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  tocRow: { minHeight: 36, justifyContent: "center" },
  tocLink: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: 14,
    color: Colors.primary,
  },
  partTitle: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800",
    fontSize: 18,
    color: Colors.text,
    marginBottom: 8,
  },
  partIntro: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 20,
    marginBottom: 12,
  },
  section: { marginTop: 10 },
  sectionTitle: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
  },
  sectionBody: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: 13,
    color: Colors.textLight,
    lineHeight: 20,
  },
});
