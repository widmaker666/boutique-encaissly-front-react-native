import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  titre: {
    color: Colors.text,
    fontFamily: Fonts.family.nowBlack,
    fontSize: Fonts.sizes.xxl,
    letterSpacing: 1.2, // Augmente l'espacement des lettres (ajuste la valeur selon ton besoin)
    textTransform: "uppercase", // Met tout en majuscules
  },
  addBtn: {
    backgroundColor: Colors.primary,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  addBtnTxt: {
    color: Colors.surface,
    fontSize: 22,
    lineHeight: 26,
    fontFamily: Fonts.family.nowLight,
  },
  search: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.family.nowRegular,
    color: Colors.text,
    marginBottom: 14,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0e8f7",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarTxt: {
    color: Colors.primary,
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.family.nowBold,
  },
  info: {
    flex: 1,
    paddingHorizontal: 10,
  },
  nom: {
    color: Colors.text,
    fontSize: Fonts.sizes.sm,
  },
  meta: {
    color: Colors.textLight,
    fontSize: Fonts.sizes.xs,
    marginTop: 2,
  },
  taux: {
    color: Colors.primary,
    fontSize: Fonts.sizes.sm,
  },
  arrow: {
    color: Colors.primaryLight,
    fontSize: 20,
    marginLeft: 6,
  },
  lockedBox: {
    backgroundColor: "#f0e8f7",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderStyle: "dashed",
  },
  lockedTxt: {
    color: Colors.primaryDark,
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.family.nowMedium,
    marginBottom: 10,
    textAlign: "center",
  },
  upgradeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  upgradeTxt: {
    color: Colors.surface,
    fontSize: Fonts.sizes.sm,
    fontFamily: Fonts.family.nowMedium,
  },
});
