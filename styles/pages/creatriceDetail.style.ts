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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },

  // ── HEADER ──────────────────────────────────────
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  backTxt: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: Fonts.family.nowLight,
    lineHeight: 26,
  },
  headerTitle: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800" as const,
    fontSize: 22,
    color: "#FFFFFF",
    letterSpacing: 1.5,
  },
  headerCenter: {
    alignItems: "center",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.45)",
  },
  avatarTxt: {
    color: "#FFFFFF",
    fontFamily: Fonts.family.norwester,
    fontSize: 22,
    letterSpacing: 1,
  },
  nom: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.lg,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  contactLine: {
    fontFamily: Fonts.family.nowLight,
    fontSize: Fonts.sizes.xs,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 2,
  },
  commissionBadge: {
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.18)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  commissionTxt: {
    color: "#FFFFFF",
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    letterSpacing: 0.4,
  },

  // ── SCROLL CONTENT ──────────────────────────────
  scrollContent: {
    paddingBottom: 120,
  },

  // ── SECTION ─────────────────────────────────────
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800" as const,
    fontSize: 13,
    color: Colors.primaryDark,
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  // ── STATS GRID ──────────────────────────────────
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    ...cardShadow,
  },
  statValue: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800" as const,
    fontSize: Fonts.sizes.xl,
    color: Colors.primaryDark,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: Fonts.family.nowLight,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    letterSpacing: 0.3,
    textAlign: "center",
  },

  // ── VENTE CARD ──────────────────────────────────
  venteCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...cardShadow,
  },
  venteLeft: {
    flex: 1,
    marginRight: 10,
  },
  venteArticle: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    marginBottom: 3,
  },
  venteDate: {
    fontFamily: Fonts.family.nowLight,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
  },
  venteRight: {
    alignItems: "flex-end",
    gap: 6,
  },
  ventePrix: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.sm,
    color: Colors.primaryDark,
  },
  badgeEspeces: {
    backgroundColor: Colors.warning + "33",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.warning + "88",
  },
  badgeCarte: {
    backgroundColor: Colors.success + "22",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.success + "66",
  },
  badgeEspecesTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 10,
    color: "#b07d00",
    letterSpacing: 0.3,
  },
  badgeCarteTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 10,
    color: Colors.success,
    letterSpacing: 0.3,
  },

  // ── CATALOGUE BTN ───────────────────────────────
  catalogueBtn: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...cardShadow,
  },
  catalogueBtnTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    color: Colors.primaryDark,
    letterSpacing: 0.3,
  },
  catalogueBtnArrow: {
    fontFamily: Fonts.family.norwester,
    fontSize: 22,
    color: Colors.primaryLight,
    lineHeight: 24,
  },

  // ── EMPTY VENTES ────────────────────────────────
  emptyVentes: {
    textAlign: "center",
    color: Colors.textLight,
    fontFamily: Fonts.family.nowLight,
    fontSize: Fonts.sizes.sm,
    marginTop: 20,
    marginBottom: 10,
  },

  // ── ACTIONS STICKY ──────────────────────────────
  actionsBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: "row",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnModifier: {
    backgroundColor: Colors.primary,
  },
  btnSupprimer: {
    backgroundColor: Colors.error + "18",
    borderWidth: 1.5,
    borderColor: Colors.error + "55",
  },
  btnInviter: {
    backgroundColor: Colors.success + "18",
    borderWidth: 1.5,
    borderColor: Colors.success + "55",
  },
  btnModifierTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.xs,
    color: "#FFFFFF",
    letterSpacing: 0.3,
  },
  btnSupprimerTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.xs,
    color: Colors.error,
    letterSpacing: 0.3,
  },
  btnInviterTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.xs,
    color: Colors.success,
    letterSpacing: 0.3,
  },
});
