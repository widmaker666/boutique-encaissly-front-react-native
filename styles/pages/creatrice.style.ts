import { StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Radius } from "@/constants/spacing";
import { shadows } from "@/styles/utils/shadows.styles";
import { getAvatarColor } from "@/styles/pages/ventes.style";

export { getAvatarColor };

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

  // ── HEADER (crème, même DA que le web) ──────────
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  titre: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800" as const,
    fontSize: 30,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.xs,
    color: Colors.textLight,
    marginTop: 3,
  },
  duoSwitchBtn: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  duoSwitchTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: 12,
    color: Colors.text,
  },
  addBtn: {
    backgroundColor: Colors.text,
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: 16,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
  },
  searchIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  search: {
    flex: 1,
    paddingVertical: 12,
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.md,
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
    borderRadius: Radius.lg,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    ...shadows.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarTxt: {
    color: Colors.text,
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
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.sm,
    marginBottom: 3,
  },
  meta: {
    color: Colors.textLight,
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.xs,
  },
  badge: {
    backgroundColor: Colors.primaryTint,
    borderRadius: Radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeTxt: {
    color: Colors.primaryDark,
    fontFamily: Fonts.family.nowBold,
    fontSize: 11,
  },
  arrow: {
    color: Colors.textLight,
    fontSize: 22,
    marginLeft: 8,
  },
  emptyTxt: {
    textAlign: "center",
    color: Colors.textLight,
    fontFamily: Fonts.family.nowRegular,
    fontSize: Fonts.sizes.sm,
    marginTop: 40,
  },

  // ── LOCK FREE ───────────────────────────────────
  lockedBox: {
    backgroundColor: Colors.primaryTint,
    borderRadius: Radius.lg,
    padding: 22,
    alignItems: "center",
    marginTop: 6,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    borderStyle: "dashed",
  },
  lockedEmoji: {
    fontSize: 26,
    marginBottom: 8,
  },
  lockedTxt: {
    color: Colors.primaryDark,
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.sm,
    marginBottom: 14,
    textAlign: "center",
  },
  upgradeBtn: {
    backgroundColor: Colors.text,
    borderRadius: Radius.md,
    minHeight: 44,
    justifyContent: "center",
    paddingHorizontal: 26,
  },
  upgradeTxt: {
    color: "#FFFFFF",
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.sm,
  },
});
