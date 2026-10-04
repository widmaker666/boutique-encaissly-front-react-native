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
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
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
    fontFamily: Fonts.family.norwester,
    fontWeight: "800" as const,
    fontSize: 26,
    color: Colors.text,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    marginLeft: 56, // aligne sous le titre (skip backBtn)
  },
  importBtn: {
    backgroundColor: Colors.surface,
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  importBtnTxt: {
    fontSize: 16,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.text,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnTxt: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: Fonts.family.nowLight,
    lineHeight: 26,
  },

  // ── SCROLL ──────────────────────────────────────
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // ── ARTICLE CARD ────────────────────────────────
  articleCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    ...shadows.sm,
  },
  articleLeft: {
    flex: 1,
    marginRight: 10,
  },
  articleNom: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    marginBottom: 4,
  },
  articleDescription: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    marginBottom: 6,
    lineHeight: 16,
  },
  articleStock: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    marginTop: 4,
  },
  prixBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primaryTint,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  prixBadgeTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 11,
    color: Colors.primaryDark,
  },

  // ── ACTIONS ARTICLE (= Button variant="icon") ───
  articleActions: {
    flexDirection: "column",
    gap: 8,
    alignItems: "flex-end",
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editBtnTxt: {
    fontSize: 14,
    color: Colors.text,
  },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  deleteBtnTxt: {
    fontSize: 14,
    color: Colors.error,
  },

  // ── EMPTY ────────────────────────────────────────
  emptyContainer: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTxt: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    textAlign: "center",
  },

  // ── MODAL (bottom sheet) ─────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
    ...shadows.sheet,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginBottom: 18,
  },
  modalTitle: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800" as const,
    fontSize: 20,
    color: Colors.text,
    letterSpacing: -0.3,
    marginBottom: 20,
  },
  // Même rendu que components/Inputs/Field
  inputLabel: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.md,
    color: Colors.text,
    backgroundColor: Colors.surface,
    marginBottom: 14,
  },
  inputMultiline: {
    height: 72,
    textAlignVertical: "top",
  },
  submitBtn: {
    backgroundColor: Colors.text,
    borderRadius: Radius.md,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 15,
    color: "#FFFFFF",
  },
});
