import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuthStore } from "@/stores/auth.store";
import { Fonts } from "@/constants/fonts";
import { Colors } from "@/constants/colors";

/** `onLight` pour les écrans déjà migrés vers la nouvelle DA (header crème),
 * `onDark` (défaut) pour les headers violets pas encore migrés. */
export function DuoModeToggle({ variant = "onDark" }: { variant?: "onDark" | "onLight" }) {
  const duoMode = useAuthStore((s) => s.duoMode);
  const setDuoMode = useAuthStore((s) => s.setDuoMode);
  const v = variant === "onLight" ? light : dark;

  return (
    <View style={[s.container, v.container]}>
      {(["GERANTE", "CREATRICE"] as const).map((mode) => {
        const active = duoMode === mode;
        return (
          <TouchableOpacity
            key={mode}
            style={[s.btn, active && v.btnActive]}
            onPress={() => setDuoMode(mode)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[s.txt, v.txt, active && v.txtActive]}>{mode === "GERANTE" ? "Gérante" : "Créatrice"}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderRadius: 20,
    padding: 3,
    marginTop: 12,
    alignSelf: "flex-start",
  },
  btn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
  },
  txt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: 12,
  },
});

const dark = StyleSheet.create({
  container: { backgroundColor: "rgba(255,255,255,0.15)" },
  btnActive: { backgroundColor: "#fff" },
  txt: { color: "rgba(255,255,255,0.75)" },
  txtActive: { color: Colors.primary },
});

const light = StyleSheet.create({
  container: { backgroundColor: Colors.surface },
  btnActive: { backgroundColor: Colors.text },
  txt: { color: Colors.textLight },
  txtActive: { color: "#fff" },
});
