import { ActivityIndicator, Pressable, StyleSheet, Text, View, type GestureResponderEvent, type StyleProp, type ViewStyle } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Radius, Spacing } from "@/constants/spacing";

type Variant = "primary" | "secondary" | "outline" | "danger" | "dangerOutline" | "link" | "icon";
type Size = "sm" | "md";

interface ButtonProps {
  children?: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  /** Pour les icon buttons sans texte (ex: "Supprimer") — requis par l'audit accessibilité. */
  accessibilityLabel?: string;
}

/** Bouton unique de l'app — remplace btnPrimary/submitBtn/upgradeBtn/editBtn et
 * consorts, dupliqués avec de petites variations dans chaque écran. */
export default function Button({
  children,
  onPress,
  variant = "primary",
  size = "md",
  fullWidth,
  disabled,
  loading,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled }}
      hitSlop={variant === "icon" ? undefined : 4}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && pressedStyles[variant],
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" || variant === "danger" ? "#fff" : Colors.primary} size="small" />
      ) : typeof children === "string" ? (
        <Text style={[textBase[variant], size === "sm" && styles.textSm]}>{children}</Text>
      ) : (
        <View>{children}</View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    borderRadius: Radius.md,
    minHeight: 44, // touch target
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  textSm: {
    fontSize: Fonts.sizes.xs,
  },

  primary: { backgroundColor: Colors.primary, paddingHorizontal: Spacing.xxl, borderWidth: 0 },
  secondary: { backgroundColor: "transparent", borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: Spacing.xxl },
  outline: { backgroundColor: "transparent", borderWidth: 1, borderColor: Colors.primary, paddingHorizontal: Spacing.xxl },
  danger: { backgroundColor: Colors.error, borderWidth: 0, paddingHorizontal: Spacing.xxl },
  dangerOutline: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: Spacing.xxl },
  link: { backgroundColor: "transparent", alignSelf: "flex-start", minHeight: undefined, paddingVertical: Spacing.xs },
  icon: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    width: 40,
    height: 40,
    minHeight: undefined,
  },
});

const sizeStyles = StyleSheet.create({
  md: { paddingVertical: Spacing.md },
  sm: { paddingVertical: Spacing.sm, minHeight: 36 },
});

const pressedStyles = StyleSheet.create({
  primary: { backgroundColor: Colors.primaryDark },
  secondary: { borderColor: Colors.text },
  outline: { backgroundColor: Colors.primaryTint },
  danger: { backgroundColor: Colors.errorDark },
  dangerOutline: { backgroundColor: Colors.errorTint, borderColor: Colors.error },
  link: { opacity: 0.6 },
  icon: { borderColor: Colors.text },
});

const textBase = StyleSheet.create({
  primary: { fontFamily: Fonts.family.nowBold, color: "#fff", fontSize: Fonts.sizes.sm },
  secondary: { fontFamily: Fonts.family.nowMedium, color: Colors.text, fontSize: Fonts.sizes.sm },
  outline: { fontFamily: Fonts.family.nowMedium, color: Colors.primary, fontSize: Fonts.sizes.sm },
  danger: { fontFamily: Fonts.family.nowBold, color: "#fff", fontSize: Fonts.sizes.sm },
  dangerOutline: { fontFamily: Fonts.family.nowMedium, color: Colors.error, fontSize: Fonts.sizes.sm },
  link: { fontFamily: Fonts.family.nowMedium, color: Colors.primary, fontSize: Fonts.sizes.sm },
  icon: { fontFamily: Fonts.family.nowMedium, color: Colors.text, fontSize: Fonts.sizes.sm },
});
