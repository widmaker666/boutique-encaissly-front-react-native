import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";

const AVATAR_COLORS = [
  "#EDE0F7",
  "#E0EDFF",
  "#E0F7EF",
  "#FFF3E0",
  "#FCE4EC",
];

export const getAvatarColor = (index: number) =>
  AVATAR_COLORS[index % AVATAR_COLORS.length];

const cardShadow = {
  shadowColor: "#7a41bb",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.09,
  shadowRadius: 8,
  elevation: 3,
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },

  // ── HEADER ──────────────────────────────────────
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  titre: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800" as const,
    fontSize: 30,
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  headerSub: {
    fontFamily: Fonts.family.nowLight,
    fontSize: Fonts.sizes.xs,
    color: "rgba(255,255,255,0.65)",
    marginTop: 3,
    letterSpacing: 0.4,
  },
  addBtn: {
    backgroundColor: "rgba(255,255,255,0.18)",
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.32)",
  },
  addBtnTxt: {
    color: "#FFFFFF",
    fontSize: 24,
    lineHeight: 28,
    fontFamily: Fonts.family.nowLight,
  },

  // ── SEARCH ──────────────────────────────────────
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surface,
    marginHorizontal: 16,
    marginTop: -16,
    marginBottom: 16,
    borderRadius: 14,
    paddingHorizontal: 14,
    ...cardShadow,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  search: {
    flex: 1,
    paddingVertical: 14,
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },

  // ── LIST ────────────────────────────────────────
  list: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  // ── CARD ────────────────────────────────────────
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    ...cardShadow,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarTxt: {
    color: Colors.primaryDark,
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.sm,
    letterSpacing: 0.5,
  },
  info: {
    flex: 1,
    paddingHorizontal: 12,
  },
  nom: {
    color: Colors.text,
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    marginBottom: 3,
  },
  meta: {
    color: Colors.textLight,
    fontFamily: Fonts.family.nowLight,
    fontSize: Fonts.sizes.xs,
  },
  badge: {
    backgroundColor: Colors.primaryLight + "22",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.primaryLight + "55",
  },
  badgeTxt: {
    color: Colors.primaryDark,
    fontFamily: Fonts.family.nowBold,
    fontSize: 12,
  },
  arrow: {
    color: Colors.primaryLight,
    fontSize: 22,
    marginLeft: 8,
  },
  emptyTxt: {
    textAlign: "center",
    color: Colors.textLight,
    fontFamily: Fonts.family.nowLight,
    fontSize: Fonts.sizes.sm,
    marginTop: 40,
  },

  // ── LOCK FREE ───────────────────────────────────
  lockedBox: {
    backgroundColor: Colors.primaryLight + "15",
    borderRadius: 16,
    padding: 22,
    alignItems: "center",
    marginTop: 6,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight + "40",
    borderStyle: "dashed",
  },
  lockedEmoji: {
    fontSize: 26,
    marginBottom: 8,
  },
  lockedTxt: {
    color: Colors.primaryDark,
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    marginBottom: 14,
    textAlign: "center",
  },
  upgradeBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 26,
  },
  upgradeTxt: {
    color: "#FFFFFF",
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    letterSpacing: 0.3,
  },
});
