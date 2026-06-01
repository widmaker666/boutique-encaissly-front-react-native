import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

const inputShadow = {
  shadowColor: "#7a41bb",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 6,
  elevation: 2,
};

export const modalStyles = StyleSheet.create({
  // ── OVERLAY ─────────────────────────────────────
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },

  // ── SHEET ───────────────────────────────────────
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },

  // ── HANDLE ──────────────────────────────────────
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },

  // ── HEADER ROW ──────────────────────────────────
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  titre: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800" as const,
    fontSize: 20,
    color: Colors.primaryDark,
    letterSpacing: 1.5,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 18,
    color: Colors.textLight,
    lineHeight: 22,
    marginTop: -1,
  },

  // ── FORM ────────────────────────────────────────
  label: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 14,
  },
  labelRequired: {
    color: Colors.primary,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    ...inputShadow,
  },
  inputFocused: {
    borderColor: Colors.primaryLight,
  },
  inputError: {
    borderColor: Colors.error,
  },

  // ── ERROR MSG ───────────────────────────────────
  errorBox: {
    backgroundColor: Colors.error + "15",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.error + "40",
  },
  errorTxt: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.xs,
    color: Colors.error,
  },

  // ── CTA ─────────────────────────────────────────
  ctaBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  ctaBtnDisabled: {
    opacity: 0.55,
  },
  ctaTxt: {
    fontFamily: Fonts.family.norwester,
    fontSize: Fonts.sizes.sm,
    color: "#FFFFFF",
    letterSpacing: 1.2,
  },
});
