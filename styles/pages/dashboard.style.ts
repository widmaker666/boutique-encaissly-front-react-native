import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },

  //- Header
  header: {
    flex: 1,
    alignItems: "center",
    marginBottom: 28,
  },
  greeting: {
    color: Colors.textLight,
    fontSize: Fonts.sizes.sm,
  },
  name: {
    color: Colors.text,
    fontSize: Fonts.sizes.xl,
    marginTop: 2,
  },
  badgeWrap: {
    marginTop: 6,
  },
  badge: {
    backgroundColor: Colors.primary,
    color: Colors.surface,
    fontSize: Fonts.sizes.xs,
    fontFamily: Fonts.family.nowMedium,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 10,
    overflow: "hidden",
  },

  //- Sections
  sectionTitle: {
    color: Colors.textLight,
    fontSize: Fonts.sizes.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },

  //- Cards grid
  cardsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    width: "47%",
    borderWidth: 2,
    borderColor: Colors.primaryLight,
  },
  cardLabel: {
    color: Colors.textLight,
    fontSize: Fonts.sizes.xs,
  },
  cardValue: {
    color: Colors.primary,
    fontSize: Fonts.sizes.lg,
    marginTop: 4,
  },

  //- Paiements
  paiementRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
    width: "95%",
  },
  paiementCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: Colors.primaryLight,
  },

  //- Dernière vente
  venteRow: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "95%",
    borderWidth: 2,
    borderColor: Colors.primaryLight,
  },
  venteName: {
    color: Colors.text,
    fontSize: Fonts.sizes.sm,
  },
  venteMeta: {
    color: Colors.textLight,
    fontSize: Fonts.sizes.xs,
    marginTop: 2,
  },
  ventePrice: {
    color: Colors.primary,
    fontSize: Fonts.sizes.md,
  },

  //- Lockbox passer en PRO
  lockedBox: {
    backgroundColor: "#f0e8f7",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderStyle: "dashed",
    width: "95%",
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

  infoBox: {
    backgroundColor: "#f0e8f7",
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    width: "95%",
  },
  infoTxt: {
    color: Colors.primaryDark,
    fontSize: Fonts.sizes.xs,
    fontFamily: Fonts.family.nowMedium,
    textAlign: "center",
  },

  moisBadge: {
    backgroundColor: "#fff3e0",
    borderRadius: 8,
    padding: 8,
    marginBottom: 14,
    alignItems: "center",
    width: "95%",
  },
  moisTxt: {
    color: "#e65100",
    fontSize: Fonts.sizes.xs,
    fontFamily: Fonts.family.nowMedium,
  },
});
