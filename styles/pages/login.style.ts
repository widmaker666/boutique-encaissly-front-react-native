import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
    padding: 32,
  },
  titre: {
    fontSize: Fonts.sizes.xxl,
    fontFamily: Fonts.family.norwester,
    color: Colors.primary,
    marginBottom: 8,
  },
  sousTitre: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.family.nowLight,
    color: Colors.textLight,
    marginBottom: 40,
  },
  label: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.family.nowMedium,
    color: Colors.text,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: Fonts.sizes.md,
    fontFamily: Fonts.family.nowRegular,
    color: Colors.text,
    marginBottom: 20,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    fontSize: Fonts.sizes.xs,
    fontFamily: Fonts.family.nowLight,
    color: Colors.error,
    marginTop: -16,
    marginBottom: 16,
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  btnPrimaryText: {
    color: Colors.surface,
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    fontFamily: Fonts.family.nowLight,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.family.nowLight,
    color: Colors.textLight,
  },
  footerLink: {
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.family.nowMedium,
    color: Colors.primary,
    marginLeft: 4,
  },

  btnGoogle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DADCE0",
    paddingVertical: 14,
    borderRadius: 12,
    width: "100%",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },

  btnGoogleText: {
    color: "#3C4043",
    fontSize: Fonts.sizes.md,
    fontFamily: Fonts.family.nowMedium,
  },
});
