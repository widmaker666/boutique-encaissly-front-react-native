import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Radius } from "@/constants/spacing";
import { shadows } from "@/styles/utils/shadows.styles";

// Partagé par les modales créatrice (création / modification / invitation).
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
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingHorizontal: 20,
    paddingBottom: 32,
    ...shadows.sheet,
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
    color: Colors.text,
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 18,
    color: Colors.text,
    lineHeight: 22,
    marginTop: -1,
  },

  // ── FORM (même rendu que components/Inputs/Field) ──
  label: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
    marginBottom: 6,
    marginTop: 14,
  },
  labelRequired: {
    color: Colors.primary,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.md,
    color: Colors.text,
  },
  inputFocused: {
    borderColor: Colors.primary,
  },
  inputError: {
    borderColor: Colors.error,
  },

  // ── ERROR MSG (= Banner error) ──────────────────
  errorBox: {
    backgroundColor: Colors.errorTint,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 16,
  },
  errorTxt: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.sm,
    color: Colors.error,
  },

  // ── CTA (= Button primary) ──────────────────────
  ctaBtn: {
    backgroundColor: Colors.text,
    borderRadius: Radius.md,
    minHeight: 48,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  ctaBtnDisabled: {
    opacity: 0.5,
  },
  ctaTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 15,
    color: "#FFFFFF",
  },
});
