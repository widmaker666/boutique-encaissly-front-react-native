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

const sheetShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: -6 },
  shadowOpacity: 0.12,
  shadowRadius: 16,
  elevation: 12,
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
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  titre: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800" as const,
    fontSize: 30,
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  headerSub: {
    fontFamily: Fonts.family.nowLight,
    fontSize: Fonts.sizes.xs,
    color: "rgba(255,255,255,0.65)",
    marginTop: 3,
    letterSpacing: 0.4,
  },
  addBtn: {
    backgroundColor: "rgba(255,255,255,0.18)",
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.32)",
  },
  addBtnTxt: {
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 28,
    fontFamily: Fonts.family.nowLight,
  },

  // ── FILTRES ─────────────────────────────────────
  filtersWrapper: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...cardShadow,
    shadowOpacity: 0.05,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    letterSpacing: 0.5,
  },
  chipTxtActive: {
    color: "#FFFFFF",
  },

  // ── LIST ────────────────────────────────────────
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 32,
  },

  // ── CARD VENTE ──────────────────────────────────
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    ...cardShadow,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardLeft: {
    flex: 1,
    paddingRight: 12,
  },
  cardNomArticle: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    marginBottom: 4,
  },
  cardCreatrice: {
    fontFamily: Fonts.family.nowLight,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
  },
  cardRight: {
    alignItems: "flex-end",
  },
  cardPrix: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.md,
    color: Colors.success,
    marginBottom: 6,
  },
  badgePaiement: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeEspeces: {
    backgroundColor: "#FFF3E0",
  },
  badgeCarte: {
    backgroundColor: "#E0EDFF",
  },
  badgeTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 10,
    letterSpacing: 0.4,
  },
  badgeTxtEspeces: {
    color: "#C47D00",
  },
  badgeTxtCarte: {
    color: "#2962B8",
  },
  cardDate: {
    fontFamily: Fonts.family.nowLight,
    fontSize: 11,
    color: Colors.textLight,
  },
  cardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },

  // ── EMPTY STATE ─────────────────────────────────
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    marginBottom: 6,
  },
  emptySub: {
    fontFamily: Fonts.family.nowLight,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    textAlign: "center",
  },

  // ── BOTTOM SHEET ─────────────────────────────────
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
    ...sheetShadow,
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
    fontSize: 18,
    color: Colors.primaryDark,
    letterSpacing: 1,
  },
  sheetClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetCloseTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 16,
    color: Colors.textLight,
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
    backgroundColor: Colors.primary,
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
    fontSize: 14,
    letterSpacing: 1,
  },
  stepLabelActive: {
    color: Colors.primaryDark,
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
    backgroundColor: Colors.primaryLight + "12",
    borderRadius: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 0,
    marginBottom: 2,
  },
  creatriceAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  creatriceAvatarTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 12,
    color: Colors.primaryDark,
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
    color: Colors.primaryLight,
  },

  // ── ARTICLES ─────────────────────────────────────
  articlesSection: {
    marginTop: 16,
  },
  articlesSectionTitle: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    letterSpacing: 0.8,
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
    backgroundColor: Colors.primary + "08",
    borderRadius: 10,
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
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
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
    color: Colors.success,
    marginLeft: 8,
  },
  articleStock: {
    fontFamily: Fonts.family.nowLight,
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
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 15,
    color: Colors.primaryDark,
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
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  articleSelectTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: 11,
    color: "#FFFFFF",
  },
  noArticleTxt: {
    fontFamily: Fonts.family.nowLight,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    marginTop: 8,
    textAlign: "center",
  },

  // ── RÉCAPITULATIF ────────────────────────────────
  recapCard: {
    backgroundColor: Colors.background,
    borderRadius: 14,
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
    borderTopWidth: 2,
    borderTopColor: Colors.primary + "30",
  },
  totalLabel: {
    fontFamily: Fonts.family.norwester,
    fontSize: 15,
    color: Colors.primaryDark,
    letterSpacing: 1,
  },
  totalMontant: {
    fontFamily: Fonts.family.norwester,
    fontSize: 20,
    color: Colors.primary,
    letterSpacing: 0.5,
  },

  // ── FORMULAIRE ───────────────────────────────────
  formGroup: {
    marginBottom: 18,
  },
  formLabel: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    letterSpacing: 0.8,
    marginBottom: 7,
    textTransform: "uppercase",
  },
  formInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    borderWidth: 1.5,
    borderColor: "transparent",
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
  modeChip: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  modeChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "12",
  },
  modeChipTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    letterSpacing: 0.5,
  },
  modeChipTxtActive: {
    color: Colors.primaryDark,
  },

  // ── ERREUR ───────────────────────────────────────
  errorTxt: {
    fontFamily: Fonts.family.nowLight,
    fontSize: 12,
    color: Colors.error,
    marginBottom: 12,
    textAlign: "center" as const,
  },

  // ── SUBMIT ───────────────────────────────────────
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    ...cardShadow,
    shadowOpacity: 0.2,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitTxt: {
    fontFamily: Fonts.family.norwester,
    fontSize: 15,
    color: "#FFFFFF",
    letterSpacing: 1.5,
  },
  deleteVenteBtn: {
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  deleteVenteTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: 13,
    color: Colors.error,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    marginTop: 8,
  },
  backBtnTxt: {
    fontFamily: Fonts.family.nowLight,
    fontSize: Fonts.sizes.xs,
    color: Colors.primaryLight,
    marginLeft: 4,
  },

  // ── ARTICLE MANUEL ──────────────────────────────
  addManuelBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: "dashed",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 14,
  },
  addManuelBtnTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.xs,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  manuelForm: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: Colors.primary + "40",
    gap: 10,
  },
  manuelFormRow: {
    flexDirection: "row",
    gap: 10,
  },
  manuelFormInput: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    borderWidth: 1.5,
    borderColor: Colors.border,
    flex: 1,
  },
  manuelFormBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  manuelFormBtnTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.xs,
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },
  articleManuelTag: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: 10,
    color: Colors.primary,
    backgroundColor: Colors.primary + "15",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
    alignSelf: "center",
    overflow: "hidden",
  },

  // ── INFO CREATRICE SELECTIONNEE ──────────────────
  selectedCreatriceBanner: {
    backgroundColor: Colors.primaryLight + "18",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  selectedCreatriceBannerTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.xs,
    color: Colors.primaryDark,
    flex: 1,
    marginLeft: 8,
  },
});

export const AVATAR_COLORS = [
  "#EDE0F7",
  "#E0EDFF",
  "#E0F7EF",
  "#FFF3E0",
  "#FCE4EC",
];

export const getAvatarColor = (index: number) =>
  AVATAR_COLORS[index % AVATAR_COLORS.length];
