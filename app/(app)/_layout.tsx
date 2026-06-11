import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useAuthStore } from "@/stores/auth.store";
import { notificationService } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { AntDesign } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const isGerante = user?.role === "GERANTE";

  const { data: unreadData } = useQuery({
    queryKey: ["notifications-count"],
    queryFn: notificationService.getUnreadCount,
    refetchInterval: 30000,
  });
  const unreadCount: number = unreadData?.count ?? 0;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.primaryLight,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontFamily: Fonts.family.nowMedium,
          fontSize: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <AntDesign name="home" size={24} color={color} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
      <Tabs.Screen
        name="ventes"
        options={{
          title: "Ventes",
          tabBarIcon: ({ color }) => (
            <AntDesign name="shopping-cart" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="creatrice"
        options={{
          title: isGerante ? "Créatrices" : "Ma fiche",
          tabBarIcon: ({ color }) => (
            <AntDesign name={isGerante ? "team" : "idcard"} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          tabBarIcon: ({ color }) => (
            <AntDesign name="bar-chart" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <AntDesign name="user" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}
