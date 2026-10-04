import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";
import { Radius, Spacing } from "@/constants/spacing";
import { shadows } from "@/styles/utils/shadows.styles";

type Padding = "sm" | "md" | "lg";

interface CardProps {
  children: React.ReactNode;
  padding?: Padding;
  style?: StyleProp<ViewStyle>;
}

/** Conteneur de base (fond blanc, radius, ombre légère) — remplace les 5+
 * variantes "card" réimplémentées par écran (dashboard.style.ts à lui seul
 * en avait 5 : card/infoBox/boutiqueRow/paiementCard/venteRow). */
export default function Card({ children, padding = "md", style }: CardProps) {
  return <View style={[styles.card, paddingStyles[padding], style]}>{children}</View>;
}

interface CardButtonProps extends CardProps {
  onPress?: () => void;
  accessibilityLabel?: string;
}

/** Même rendu que Card mais pressable — pour les cards cliquables
 * (boutique, créatrice, événement...), avec un vrai retour visuel au press. */
export function CardButton({ children, padding = "md", style, onPress, accessibilityLabel }: CardButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.card, paddingStyles[padding], pressed && styles.pressed, style]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    ...shadows.sm,
  },
  pressed: {
    backgroundColor: "#faf8f4",
  },
});

const paddingStyles = StyleSheet.create({
  sm: { padding: Spacing.lg },
  md: { padding: Spacing.xxl },
  lg: { padding: Spacing.xxxl },
});
