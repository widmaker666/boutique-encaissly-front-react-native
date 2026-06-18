import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuthStore } from "@/stores/auth.store";
import { Fonts } from "@/constants/fonts";

export function DuoModeToggle() {
  const duoMode = useAuthStore((s) => s.duoMode);
  const setDuoMode = useAuthStore((s) => s.setDuoMode);

  return (
    <View style={s.container}>
      <TouchableOpacity
        style={[s.btn, duoMode === "GERANTE" && s.btnActive]}
        onPress={() => setDuoMode("GERANTE")}
        activeOpacity={0.8}
      >
        <Text style={[s.txt, duoMode === "GERANTE" && s.txtActive]}>Gerante</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[s.btn, duoMode === "CREATRICE" && s.btnActive]}
        onPress={() => setDuoMode("CREATRICE")}
        activeOpacity={0.8}
      >
        <Text style={[s.txt, duoMode === "CREATRICE" && s.txtActive]}>Creatrice</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
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
  btnActive: {
    backgroundColor: "#fff",
  },
  txt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
  },
  txtActive: {
    color: "#7a41bb",
  },
});
