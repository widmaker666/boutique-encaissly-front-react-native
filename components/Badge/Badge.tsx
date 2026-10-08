import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Radius } from "@/constants/spacing";

type Color = "primary" | "success" | "warning" | "error" | "info" | "neutral";

interface BadgeProps {
  children: React.ReactNode;
  color?: Color;
  variant?: "soft" | "solid";
}

/** Pastille de statut — remplace badgeEspeces/Carte/Pro/Duo réinventés par écran,
 * dont certains avec des couleurs hors palette (#FFF3E0, #E0EDFF...). */
export default function Badge({ children, color = "neutral", variant = "soft" }: BadgeProps) {
  const palette = PALETTE[color][variant];
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Text style={[styles.text, { color: palette.fg }]}>{children}</Text>
    </View>
  );
}

const PALETTE: Record<Color, Record<"soft" | "solid", { bg: string; fg: string }>> = {
  primary: { soft: { bg: Colors.primaryTint, fg: Colors.primaryDark }, solid: { bg: Colors.primary, fg: "#fff" } },
  success: { soft: { bg: Colors.successTint, fg: Colors.successDark }, solid: { bg: Colors.successSolid, fg: "#fff" } },
  warning: { soft: { bg: Colors.warningTint, fg: Colors.warningDark }, solid: { bg: Colors.duo, fg: "#fff" } },
  error: { soft: { bg: Colors.errorTint, fg: Colors.error }, solid: { bg: Colors.error, fg: "#fff" } },
  info: { soft: { bg: Colors.infoTint, fg: Colors.info }, solid: { bg: Colors.info, fg: "#fff" } },
  neutral: { soft: { bg: Colors.background, fg: Colors.textLight }, solid: { bg: Colors.neutralSolid, fg: "#fff" } },
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  text: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 11,
    letterSpacing: 0.3,
  },
});
