import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Radius } from "@/constants/spacing";
import { shadows } from "@/styles/utils/shadows.styles";

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

  // ── HEADER (crème, même DA que le web) ──────────
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  backTxt: {
    color: Colors.text,
    fontSize: 22,
    fontFamily: Fonts.family.nowLight,
    lineHeight: 26,
  },
  headerTitle: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.xs,
    color: Colors.primary,
    letterSpacing: 0.6,
  },
  headerCenter: {
    alignItems: "center",
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarTxt: {
    color: "#FFFFFF",
    fontFamily: Fonts.family.norwester,
    fontWeight: "800",
    fontSize: 26,
  },
  nom: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800",
    fontSize: 26,
    color: Colors.text,
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  contactLine: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    marginBottom: 2,
  },
  commissionBadge: {
    marginTop: 10,
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  commissionTxt: {
    color: Colors.textLight,
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.xs,
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
    fontSize: Fonts.sizes.lg,
    color: Colors.text,
    letterSpacing: -0.3,
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
    borderRadius: Radius.lg,
    padding: 16,
    ...shadows.sm,
  },
  statValue: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800" as const,
    fontSize: Fonts.sizes.lg,
    color: Colors.text,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 11,
    color: Colors.textLight,
    letterSpacing: 0.3,
  },

  // ── VENTE CARD ──────────────────────────────────
  venteCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...shadows.sm,
  },
  venteLeft: {
    flex: 1,
    marginRight: 10,
  },
  venteArticle: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    marginBottom: 3,
  },
  venteDate: {
    fontFamily: Fonts.family.nowRegular,
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
    color: Colors.text,
  },
  // Mêmes couleurs que Badge (CARTE = info, ESPÈCES = warning) partout dans l'app
  badgeEspeces: {
    backgroundColor: Colors.warningTint,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeCarte: {
    backgroundColor: Colors.infoTint,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeEspecesTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 11,
    color: Colors.warningDark,
  },
  badgeCarteTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 11,
    color: Colors.info,
  },

  // ── CATALOGUE BTN ───────────────────────────────
  catalogueBtn: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 16,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    ...shadows.sm,
  },
  catalogueBtnTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    color: Colors.primary,
  },
  catalogueBtnArrow: {
    fontFamily: Fonts.family.nowLight,
    fontSize: 22,
    color: Colors.textLight,
    lineHeight: 24,
  },

  // ── EMPTY VENTES ────────────────────────────────
  emptyVentes: {
    textAlign: "center",
    color: Colors.textLight,
    fontFamily: Fonts.family.nowRegular,
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
  },
  actionBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  // Primaire sombre / secondaire bordé / danger bordé — comme Button
  btnModifier: {
    backgroundColor: Colors.text,
  },
  btnSupprimer: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnInviter: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  btnModifierTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.sm,
    color: "#FFFFFF",
  },
  btnSupprimerTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    color: Colors.error,
  },
  btnInviterTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },
});
