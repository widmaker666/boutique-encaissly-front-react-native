import { Platform, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Radius, Spacing } from "@/constants/spacing";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: Spacing.xxxxxl,
  },

  // ── HEADER (fond crème, titre affirmé — même DA que le web) ──
  header: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  eyebrow: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.xs,
    color: Colors.primary,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  name: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800",
    fontSize: 30,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  bellBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: Colors.error,
    borderRadius: Radius.pill,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  bellBadgeTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 9,
    color: "#fff",
    lineHeight: Platform.OS === "android" ? 14 : undefined,
  },
  badgeRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  chipsRow: {
    gap: Spacing.sm,
    paddingTop: Spacing.lg,
  },

  // ── BODY ──
  body: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.md,
  },
  sectionTitle: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800",
    fontSize: Fonts.sizes.lg,
    color: Colors.text,
    letterSpacing: -0.3,
    marginTop: Spacing.lg,
  },

  // ── KPI : une carte "hero" sombre + 3 secondaires ──
  heroCard: {
    backgroundColor: Colors.text,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    gap: Spacing.md,
  },
  heroLabel: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.xs,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 0.4,
  },
  heroValue: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800",
    fontSize: 38,
    color: "#fff",
    letterSpacing: -1,
  },
  heroSub: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.sm,
    color: "rgba(255,255,255,0.7)",
  },
  kpiRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  kpiCard: {
    flex: 1,
  },
  kpiLabel: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 11,
    color: Colors.textLight,
    letterSpacing: 0.3,
    marginBottom: Spacing.sm,
  },
  kpiValue: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800",
    fontSize: Fonts.sizes.lg,
    color: Colors.text,
  },

  // ── LIGNES (boutiques, ventes, historique) ──
  rowTitle: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },
  rowMeta: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
  },
  rowValue: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },
  rowLeftInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },

  // ── INFO / LOCKED ──
  infoTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    color: Colors.primaryDark,
  },
  lockedCard: {
    backgroundColor: Colors.primaryTint,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    borderStyle: "dashed",
    alignItems: "center",
    gap: Spacing.sm,
  },
  lockedTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.sm,
    color: Colors.primaryDark,
    textAlign: "center",
  },
  lockedDesc: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },

  // ── CRÉATION BOUTIQUE ──
  emptyCard: {
    gap: Spacing.md,
  },
  emptyTxt: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    textAlign: "center",
  },
  formRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  emptyHint: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
  },
});
