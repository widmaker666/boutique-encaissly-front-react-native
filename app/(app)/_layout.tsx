import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useAuthStore } from "@/stores/auth.store";
import { notificationService, boutiqueService } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { AntDesign } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { Boutique } from "@/types";

export default function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const duoMode = useAuthStore((s) => s.duoMode);
  const isDuo = user?.role === "GERANTE_CREATRICE";
  const isGerante = user?.role === "GERANTE" || (isDuo && duoMode === "GERANTE");

  const { data: unreadData } = useQuery({
    queryKey: ["notifications-count"],
    queryFn: notificationService.getUnreadCount,
    refetchInterval: 30000,
  });
  const unreadCount: number = unreadData?.count ?? 0;

  //- Onglet "Boutique" — visible seulement si la créatrice est membre d'au
  //- moins une boutique (invitation acceptée). Même queryKey que Profil pour
  //- partager le cache, pas de requête réseau en plus.
  const { data: mesBoutiques } = useQuery<Boutique[]>({
    queryKey: ["mes-boutiques"],
    queryFn: () => boutiqueService.getMesBoutiques(),
    enabled: !isGerante,
  });
  const showBoutiqueTab = !isGerante && (mesBoutiques?.length ?? 0) > 0;

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
        name="boutique-membre"
        options={{
          title: "Boutique",
          href: showBoutiqueTab ? undefined : null,
          tabBarIcon: ({ color }) => (
            <AntDesign name="shop" size={24} color={color} />
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
      <Tabs.Screen name="aide" options={{ href: null }} />
      <Tabs.Screen name="boutique/[id]" options={{ href: null }} />
      <Tabs.Screen name="mes-ventes-boutique/[id]" options={{ href: null }} />
    </Tabs>
  );
}
