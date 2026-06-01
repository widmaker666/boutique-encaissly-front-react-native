import { Fonts } from "@/constants/fonts";
import { StyleSheet } from "react-native";

export const typo = StyleSheet.create({
  thin: {
    fontFamily: Fonts.family.nowThin,
    fontSize: Fonts.sizes.xs,
  },

  light: {
    fontFamily: Fonts.family.nowLight,
    fontSize: Fonts.sizes.xs,
  },

  regular: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.md,
  },

  medium: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.md,
  },
  bold: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.md,
  },
  title: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800" as const,
    fontSize: Fonts.sizes.xl,
  },
});
