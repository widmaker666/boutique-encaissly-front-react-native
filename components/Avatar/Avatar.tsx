import { Image, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Radius } from "@/constants/spacing";

type Size = "sm" | "md" | "lg";

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: Size;
  color?: string;
  /** Override des initiales affichées (par défaut : 1ère lettre de `name`). */
  initials?: string;
}

const SIZE_PX: Record<Size, number> = { sm: 34, md: 56, lg: 72 };

/** Avatar rond (photo ou initiale) — un seul composant pour toutes les listes
 * créatrices/boutiques, au lieu d'un cercle+initiale recodé par écran. */
export default function Avatar({ name, src, size = "md", color, initials }: AvatarProps) {
  const px = SIZE_PX[size];
  const dimStyle = { width: px, height: px, borderRadius: Radius.md };

  if (src) {
    return <Image source={{ uri: src }} style={dimStyle} />;
  }
  return (
    <View style={[styles.circle, dimStyle, { backgroundColor: color ?? Colors.primary }]}>
      <Text style={[styles.initial, { fontSize: px * 0.38 }]}>{(initials ?? name.charAt(0)).toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    justifyContent: "center",
  },
  initial: {
    fontFamily: Fonts.family.nowBold,
    color: "#fff",
  },
});
