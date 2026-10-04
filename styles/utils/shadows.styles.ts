import { StyleSheet } from "react-native";

// Remplace les ~9 copies quasi identiques de `cardShadow` (avec une dérive
// 0.08/0.09 d'un fichier à l'autre) + `sheetShadow` dispersées dans
// styles/pages/*.ts et les StyleSheet inline des écrans.
export const shadows = StyleSheet.create({
  sm: {
    shadowColor: "#7a41bb",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
    elevation: 3,
  },
  md: {
    shadowColor: "#7a41bb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  // Bottom sheets / modales — ombre neutre (pas teintée violet) car elle
  // doit se détacher du fond, pas de la couleur de marque.
  sheet: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
});
