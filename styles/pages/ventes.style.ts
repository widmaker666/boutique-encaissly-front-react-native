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

  // ── HEADER (fond crème, même DA que le web) ──────
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  eyebrow: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.xs,
    color: Colors.primary,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  titre: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800" as const,
    fontSize: 30,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    marginTop: 3,
  },

  // ── FILTRES ─────────────────────────────────────
  filtersBlock: {
    gap: 8,
    marginBottom: 4,
  },
  chipsRow: {
    gap: 8,
  },

  // ── LIST ────────────────────────────────────────
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 32,
    gap: 10,
  },

  // ── LIGNE VENTE ─────────────────────────────────
  cardNomArticle: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },
  cardMeta: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
  },
  cardPrix: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.md,
    color: Colors.text,
  },


  // ── BOTTOM SHEET ─────────────────────────────────
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: "85%",
    ...shadows.sheet,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetTitre: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800",
    fontSize: 20,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  sheetClose: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetCloseTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 16,
    color: Colors.text,
    lineHeight: 20,
  },
  sheetScroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },

  // ── STEPS ────────────────────────────────────────
  stepIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 18,
    marginBottom: 16,
  },
  stepBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  stepBubbleActive: {
    backgroundColor: Colors.text,
  },
  stepBubbleInactive: {
    backgroundColor: Colors.border,
  },
  stepNum: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 13,
    color: "#FFFFFF",
  },
  stepLabel: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800",
    fontSize: 15,
  },
  stepLabelActive: {
    color: Colors.text,
  },
  stepLabelInactive: {
    color: Colors.textLight,
  },

  // ── CRÉATRICE ROW ────────────────────────────────
  creatriceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  creatriceRowSelected: {
    backgroundColor: Colors.primaryTint,
    borderRadius: Radius.md,
    paddingHorizontal: 8,
    borderBottomWidth: 0,
    marginBottom: 2,
  },
  creatriceAvatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  creatriceAvatarTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 12,
    color: Colors.text,
    letterSpacing: 0.5,
  },
  creatriceNom: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    flex: 1,
  },
  creatriceArrow: {
    fontFamily: Fonts.family.nowLight,
    fontSize: 18,
    color: Colors.textLight,
  },

  // ── ARTICLES ─────────────────────────────────────
  articlesSection: {
    marginTop: 16,
  },
  articlesSectionTitle: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    letterSpacing: 0.6,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  // articleRow : ligne principale (checkbox + infos + qty)
  articleRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  articleRowSelected: {
    backgroundColor: Colors.primaryTint,
    borderRadius: Radius.md,
    borderBottomWidth: 0,
    marginBottom: 2,
    paddingHorizontal: 6,
  },
  articleRowTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  checkboxChecked: {
    borderColor: Colors.text,
    backgroundColor: Colors.text,
  },
  checkboxTick: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 16,
    fontFamily: Fonts.family.nowBold,
  },
  articleNom: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    flex: 1,
  },
  articlePrix: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    marginLeft: 8,
  },
  articleStock: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: 11,
    color: Colors.textLight,
    marginTop: 3,
    marginLeft: 32,
  },
  // qtyRow : ligne +/-/nombre (visible seulement si sélectionné)
  qtyRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginLeft: 32,
  },
  qtyBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 15,
    color: Colors.text,
    lineHeight: 20,
  },
  qtyValue: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    minWidth: 30,
    textAlign: "center",
  },
  articleSelectBtn: {
    backgroundColor: Colors.text,
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  articleSelectTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 11,
    color: "#FFFFFF",
  },
  noArticleTxt: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    marginTop: 8,
    textAlign: "center",
  },

  // ── RÉCAPITULATIF ────────────────────────────────
  recapCard: {
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    padding: 14,
    marginBottom: 16,
  },
  recapRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  recapRowLast: {
    borderBottomWidth: 0,
  },
  recapArticleNom: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    flex: 1,
    paddingRight: 8,
  },
  recapArticlePrix: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1.5,
    borderTopColor: Colors.border,
  },
  totalLabel: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800",
    fontSize: 16,
    color: Colors.text,
  },
  totalMontant: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800",
    fontSize: 22,
    color: Colors.text,
  },

  // ── FORMULAIRE (même rendu que components/Inputs/Field) ──
  formGroup: {
    marginBottom: 18,
  },
  formLabel: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formInputFocus: {
    borderColor: Colors.primary,
  },
  modePaiementRow: {
    flexDirection: "row",
    gap: 10,
  },
  sansCommissionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },
  sansCommissionTxt: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: 13,
    color: Colors.text,
  },
  // Même rendu que components/Chip (actif = sombre)
  modeChip: {
    flex: 1,
    minHeight: 44,
    paddingVertical: 12,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  modeChipActive: {
    borderColor: Colors.text,
    backgroundColor: Colors.text,
  },
  modeChipTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },
  modeChipTxtActive: {
    color: "#FFFFFF",
  },

  // ── ERREUR ───────────────────────────────────────
  errorTxt: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: 12,
    color: Colors.error,
    marginBottom: 12,
    textAlign: "center" as const,
  },

  // ── SUBMIT (même rendu que Button primary / dangerOutline) ──
  submitBtn: {
    backgroundColor: Colors.text,
    borderRadius: Radius.md,
    minHeight: 48,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 15,
    color: "#FFFFFF",
  },
  deleteVenteBtn: {
    minHeight: 44,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  deleteVenteTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: 14,
    color: Colors.error,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    marginTop: 8,
    minHeight: 32,
  },
  backBtnTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    color: Colors.primary,
    marginLeft: 4,
  },

  // ── ARTICLE MANUEL ──────────────────────────────
  addManuelBtn: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: "dashed",
    borderRadius: Radius.md,
    minHeight: 44,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  addManuelBtnTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },
  manuelForm: {
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    padding: 14,
    marginTop: 14,
    gap: 10,
  },
  manuelFormRow: {
    flexDirection: "row",
    gap: 10,
  },
  manuelFormInput: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    flex: 1,
  },
  manuelFormBtn: {
    backgroundColor: Colors.text,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  manuelFormBtnTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.xs,
    color: "#FFFFFF",
  },
  articleManuelTag: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 10,
    color: Colors.primaryDark,
    backgroundColor: Colors.primaryTint,
    borderRadius: Radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 6,
    alignSelf: "center",
    overflow: "hidden",
  },

  // ── INFO CREATRICE SELECTIONNEE ──────────────────
  selectedCreatriceBanner: {
    backgroundColor: Colors.primaryTint,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  selectedCreatriceBannerTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    color: Colors.primaryDark,
    flex: 1,
    marginLeft: 8,
  },
});

// Teintes "soft" de la palette (mêmes que les badges) au lieu de couleurs
// pastel ad hoc.
export const AVATAR_COLORS = [
  Colors.primaryTint,
  Colors.infoTint,
  Colors.successTint,
  Colors.warningTint,
  Colors.errorTint,
];

export const getAvatarColor = (index: number) => AVATAR_COLORS[index % AVATAR_COLORS.length];
