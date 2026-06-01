import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

const cardShadow = {
  shadowColor: "#7a41bb",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.09,
  shadowRadius: 8,
  elevation: 3,
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingBottom: 48,
  },

  // ── HEADER ──────────────────────────────────────
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 28,
    alignItems: "center",
  },
  greeting: {
    color: "rgba(255,255,255,0.75)",
    fontFamily: Fonts.family.nowLight,
    fontSize: Fonts.sizes.sm,
    marginBottom: 4,
  },
  name: {
    color: "#FFFFFF",
    fontFamily: Fonts.family.norwester,
    fontWeight: "800" as const,
    fontSize: Fonts.sizes.xl,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  badgeWrap: {
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  badge: {
    color: "#FFFFFF",
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.xs,
    letterSpacing: 0.5,
  },

  // ── BODY ────────────────────────────────────────
  body: {
    padding: 16,
  },

  sectionTitle: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: 11,
    color: Colors.textLight,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 20,
  },

  // ── INFO BOXES ──────────────────────────────────
  infoBox: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    ...cardShadow,
  },
  infoTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.xs,
    color: Colors.primaryDark,
    textAlign: "center",
  },
  moisBadge: {
    backgroundColor: "#fff8f0",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffd0a0",
  },
  moisTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.xs,
    color: "#c06000",
  },

  // ── BOUTIQUES ───────────────────────────────────
  boutiqueRow: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...cardShadow,
  },
  boutiqueName: {
    fontFamily: Fonts.family.nowMedium,
    color: Colors.text,
    fontSize: Fonts.sizes.sm,
    marginBottom: 2,
  },
  boutiqueMeta: {
    fontFamily: Fonts.family.nowLight,
    color: Colors.textLight,
    fontSize: Fonts.sizes.xs,
  },
  boutiqueArrow: {
    color: Colors.primaryLight,
    fontSize: 22,
  },

  // ── CARDS GRID ──────────────────────────────────
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 8,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    width: "48.5%",
    ...cardShadow,
  },
  cardLabel: {
    fontFamily: Fonts.family.nowLight,
    color: Colors.textLight,
    fontSize: Fonts.sizes.xs,
    marginBottom: 6,
  },
  cardValue: {
    fontFamily: Fonts.family.norwester,
    color: Colors.primary,
    fontSize: Fonts.sizes.lg,
    letterSpacing: 0.5,
  },

  // ── PAIEMENTS ───────────────────────────────────
  paiementRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
  },
  paiementCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    ...cardShadow,
  },

  // ── VENTES ──────────────────────────────────────
  venteRow: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...cardShadow,
  },
  venteName: {
    fontFamily: Fonts.family.nowMedium,
    color: Colors.text,
    fontSize: Fonts.sizes.sm,
    marginBottom: 2,
  },
  venteMeta: {
    fontFamily: Fonts.family.nowLight,
    color: Colors.textLight,
    fontSize: Fonts.sizes.xs,
  },
  ventePrice: {
    fontFamily: Fonts.family.norwester,
    color: Colors.success,
    fontSize: Fonts.sizes.md,
    letterSpacing: 0.5,
  },

  // ── HISTORIQUE ──────────────────────────────────
  historiqueRow: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    ...cardShadow,
  },
  historiqueMois: {
    fontFamily: Fonts.family.nowMedium,
    color: Colors.text,
    fontSize: Fonts.sizes.sm,
    textTransform: "capitalize",
  },
  historiqueRight: {
    alignItems: "flex-end",
  },
  historiqueCA: {
    fontFamily: Fonts.family.norwester,
    color: Colors.primary,
    fontSize: Fonts.sizes.md,
    letterSpacing: 0.5,
  },
  historiqueNb: {
    fontFamily: Fonts.family.nowLight,
    color: Colors.textLight,
    fontSize: Fonts.sizes.xs,
    marginTop: 2,
  },

  // ── LOCKED ──────────────────────────────────────
  lockedBox: {
    backgroundColor: Colors.primaryLight + "15",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight + "40",
    borderStyle: "dashed",
  },
  lockedTxt: {
    fontFamily: Fonts.family.nowMedium,
    color: Colors.primaryDark,
    fontSize: Fonts.sizes.sm,
    textAlign: "center",
    marginBottom: 6,
  },
  lockedDesc: {
    fontFamily: Fonts.family.nowLight,
    color: Colors.textLight,
    fontSize: Fonts.sizes.xs,
    textAlign: "center",
    marginBottom: 14,
    lineHeight: 18,
  },
  upgradeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeTxt: {
    color: "#FFFFFF",
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    letterSpacing: 0.3,
  },
});
