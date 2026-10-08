import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { AntDesign } from "@expo/vector-icons";
import { notificationService } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Radius } from "@/constants/spacing";
import { shadows } from "@/styles/utils/shadows.styles";
import Avatar from "@/components/Avatar/Avatar";

type Row = { icon: React.ComponentProps<typeof AntDesign>["name"]; label: string; onPress: () => void; badge?: number; danger?: boolean };

/** Onglet « Plus » : tout ce qui n'a pas sa place dans la barre du bas (Compte, Notifications, Aide, Déconnexion). */
export default function PlusScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const { data } = useQuery({
    queryKey: ["notifications-count"],
    queryFn: notificationService.getUnreadCount,
    refetchInterval: 30000,
  });
  const unread: number = data?.count ?? 0;

  const nom = [user?.prenom, user?.nom].filter(Boolean).join(" ") || user?.email || "Mon compte";

  const handleLogout = () => {
    Alert.alert("Se déconnecter", "Tu vas être déconnectée de l'application.", [
      { text: "Annuler", style: "cancel" },
      { text: "Se déconnecter", style: "destructive", onPress: () => logout() },
    ]);
  };

  const rows: Row[] = [
    { icon: "bell", label: "Notifications", onPress: () => router.push("/(app)/notifications"), badge: unread },
    { icon: "user", label: "Compte", onPress: () => router.push("/(app)/profil") },
    { icon: "question-circle", label: "Aide", onPress: () => router.push("/(app)/aide") },
    { icon: "logout", label: "Se déconnecter", onPress: handleLogout, danger: true },
  ];

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.userCard}>
        <Avatar name={nom} src={user?.avatar} size="md" />
        <View style={{ flex: 1 }}>
          <Text style={s.userName} numberOfLines={1}>{nom}</Text>
          <Text style={s.userPlan}>Plan {user?.plan ?? "FREE"}</Text>
        </View>
      </View>

      <View style={s.list}>
        {rows.map((row, i) => (
          <TouchableOpacity
            key={row.label}
            style={[s.row, i > 0 && s.rowBorder]}
            onPress={row.onPress}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={row.label}
          >
            <AntDesign name={row.icon} size={20} color={row.danger ? Colors.error : Colors.text} />
            <Text style={[s.rowLabel, row.danger && { color: Colors.error }]}>{row.label}</Text>
            {!!row.badge && (
              <View style={s.badge}>
                <Text style={s.badgeTxt}>{row.badge > 99 ? "99+" : row.badge}</Text>
              </View>
            )}
            {!row.danger && <AntDesign name="right" size={14} color={Colors.textLight} />}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, gap: 16, paddingBottom: 40 },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    ...shadows.sm,
  },
  userName: { fontFamily: Fonts.family.nowBold, fontSize: Fonts.sizes.md, color: Colors.text },
  userPlan: { fontFamily: Fonts.family.nowRegular, fontSize: Fonts.sizes.xs, color: Colors.textLight, marginTop: 2 },
  list: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    ...shadows.sm,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 14, paddingHorizontal: 16, minHeight: 56 },
  rowBorder: { borderTopWidth: 1, borderTopColor: Colors.border },
  rowLabel: { flex: 1, fontFamily: Fonts.family.nowMedium, fontSize: Fonts.sizes.md, color: Colors.text },
  badge: {
    backgroundColor: Colors.error,
    borderRadius: Radius.pill,
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeTxt: { fontFamily: Fonts.family.nowBold, fontSize: 11, color: "#fff" },
});
