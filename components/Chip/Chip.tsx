import { Pressable, StyleSheet, Text } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Radius, Spacing } from "@/constants/spacing";

interface ChipProps {
  children: React.ReactNode;
  active?: boolean;
  onPress?: () => void;
}

/** Filtre pressable (pill) — remplace chip/chipActive et modeChip/modeChipActive,
 * dupliqués à l'identique sous deux noms différents dans ventes.style.ts. */
export default function Chip({ children, active, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      style={[styles.chip, active && styles.active]}
    >
      <Text style={[styles.text, active && styles.textActive]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  active: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  text: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },
  textActive: {
    color: "#fff",
  },
});
