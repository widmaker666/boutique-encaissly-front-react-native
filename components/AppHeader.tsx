import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AntDesign } from "@expo/vector-icons";
import { notificationService } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Radius } from "@/constants/spacing";
import { DuoModeToggle } from "@/components/DuoModeToggle";

/** En-tête fixe des 5 onglets principaux : logo, sélecteur de vue (comptes DUO), cloche.
 * Remplace le sélecteur et la cloche qui étaient répétés en haut de chaque écran. */
export default function AppHeader() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isDuo = user?.role === "GERANTE_CREATRICE";

  // Même clé et même intervalle que le layout : une seule requête partagée
  const { data } = useQuery({
    queryKey: ["notifications-count"],
    queryFn: notificationService.getUnreadCount,
    refetchInterval: 30000,
  });
  const unread: number = data?.count ?? 0;

  return (
    <View style={[s.bar, { paddingTop: insets.top + 8 }]}>
      <View style={s.brand}>
        <Image source={require("@/assets/icon.png")} style={s.brandIcon} accessibilityIgnoresInvertColors />
        <Text style={s.logo}>Encaissly</Text>
      </View>

      <View style={s.right}>
        {isDuo && <DuoModeToggle variant="onDarkBar" />}
        <TouchableOpacity
          style={s.bell}
          onPress={() => router.push("/(app)/notifications")}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={`Notifications${unread > 0 ? `, ${unread} non lues` : ""}`}
        >
          <AntDesign name="bell" size={18} color="#fff" />
          {unread > 0 && (
            <View style={s.badge}>
              <Text style={s.badgeTxt}>{unread > 99 ? "99+" : unread}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    backgroundColor: Colors.dark,
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexShrink: 1,
  },
  brandIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
  },
  logo: {
    fontFamily: Fonts.family.norwester,
    fontWeight: "800",
    fontSize: 19,
    color: "#fff",
    letterSpacing: -0.3,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bell: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: Colors.error,
    borderRadius: Radius.pill,
    minWidth: 17,
    height: 17,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeTxt: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 9,
    color: "#fff",
    lineHeight: Platform.OS === "android" ? 14 : undefined,
  },
});
