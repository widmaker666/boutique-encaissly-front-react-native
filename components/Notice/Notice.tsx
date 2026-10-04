import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Radius, Spacing } from "@/constants/spacing";

/** Message discret dans un encart (chargement, liste vide...). */
export function Notice({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.notice}>
      <Text style={styles.noticeText}>{children}</Text>
    </View>
  );
}

/** Bandeau succès/erreur pleine largeur. */
export function Banner({ variant, children }: { variant: "success" | "error"; children: React.ReactNode }) {
  const palette = variant === "success" ? { bg: Colors.successTint, fg: Colors.successDark } : { bg: Colors.errorTint, fg: Colors.error };
  return (
    <View style={[styles.banner, { backgroundColor: palette.bg }]}>
      <Text style={[styles.bannerText, { color: palette.fg }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
  },
  noticeText: {
    fontFamily: Fonts.family.nowRegular,
    color: Colors.textLight,
    fontSize: Fonts.sizes.sm,
  },
  banner: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  bannerText: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.sm,
  },
});
