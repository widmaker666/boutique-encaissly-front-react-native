import { StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Radius, Spacing } from "@/constants/spacing";

interface FieldProps extends TextInputProps {
  label?: string;
  error?: string;
}

/** Label + TextInput + erreur — remplace les champs stylés à la main dans
 * Login/Register/Profil (chacun avec son propre style d'input). */
export default function Field({ label, error, style, ...rest }: FieldProps) {
  return (
    <View style={styles.field}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.control, style]}
        placeholderTextColor={Colors.textLight}
        {...rest}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  label: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },
  control: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.md,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  error: {
    fontFamily: Fonts.family.nowRegular,
    color: Colors.error,
    fontSize: Fonts.sizes.xs,
  },
});
