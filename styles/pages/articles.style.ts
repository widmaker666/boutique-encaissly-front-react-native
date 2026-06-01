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
    paddingBottom: 22,
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
  headerSubtitle: {
    fontFamily: Fonts.family.nowLight,
    fontSize: Fonts.sizes.xs,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 0.3,
    marginLeft: 48, // aligne sous le titre (skip backBtn)
  },
  importBtn: {
    backgroundColor: "rgba(255,255,255,0.18)",
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.32)",
    marginRight: 8,
  },
  importBtnTxt: {
    fontSize: 16,
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    ...cardShadow,
  },
  articleLeft: {
    flex: 1,
    marginRight: 10,
  },
  articleNom: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    marginBottom: 4,
  },
  articleDescription: {
    fontFamily: Fonts.family.nowLight,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    marginBottom: 6,
    lineHeight: 16,
  },
  prixBadge: {
    alignSelf: "flex-start",
    backgroundColor: Colors.primary + "18",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.primary + "44",
  },
  prixBadgeTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.xs,
    color: Colors.primaryDark,
    letterSpacing: 0.3,
  },

  // ── ACTIONS ARTICLE ─────────────────────────────
  articleActions: {
    flexDirection: "column",
    gap: 8,
    alignItems: "flex-end",
  },
  editBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary + "18",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.primary + "44",
  },
  editBtnTxt: {
    fontSize: 13,
    color: Colors.primaryDark,
  },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.error + "18",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.error + "44",
  },
  deleteBtnTxt: {
    fontSize: 13,
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
    fontFamily: Fonts.family.nowLight,
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
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
    fontSize: 18,
    color: Colors.primaryDark,
    letterSpacing: 1.2,
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    letterSpacing: 0.5,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    backgroundColor: Colors.background + "80",
    marginBottom: 14,
  },
  inputMultiline: {
    height: 72,
    textAlignVertical: "top",
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnTxt: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800" as const,
    fontSize: 15,
    color: "#FFFFFF",
    letterSpacing: 1.2,
  },
});
