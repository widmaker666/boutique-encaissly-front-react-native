import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginBottom: 24,
  },
  titre: {
    fontSize: Fonts.sizes.xxl,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
    marginBottom: 12,
    fontFamily: Fonts.family.norwester,
  },
  pitch: {
    fontSize: Fonts.sizes.md,
    color: Colors.textLight,
    textAlign: "center",
    marginBottom: 16,
    fontFamily: Fonts.family.nowLight,
  },
  description: {
    fontSize: Fonts.sizes.sm,
    color: Colors.textLight,
    textAlign: "center",
    marginBottom: 48,
    fontFamily: Fonts.family.nowLight,
    lineHeight: 22,
    opacity: 0.7,
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    marginBottom: 12,
    minWidth: "20%",
    maxWidth: "50%",
    alignItems: "center",
  },
  btnPrimaryText: {
    color: Colors.surface,
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    fontFamily: Fonts.family.nowLight,
  },
  btnSecondary: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    minWidth: "20%",
    maxWidth: "50%",
    alignItems: "center",
  },
  btnSecondaryText: {
    color: Colors.primary,
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    fontFamily: Fonts.family.nowLight,
  },
});
