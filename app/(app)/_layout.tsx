import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useAuthStore } from "@/stores/auth.store";
import AppHeader from "@/components/AppHeader";
import { AntDesign } from "@expo/vector-icons";
import { Tabs } from "expo-router";

/** 5 onglets (Accueil · Ventes · Créatrices/Événements · Stats · Plus) + en-tête fixe.
 * Les autres écrans (Compte, Notifications, Aide, fiches…) restent des routes sans onglet. */
export default function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const duoMode = useAuthStore((s) => s.duoMode);
  const isDuo = user?.role === "GERANTE_CREATRICE";
  const isGerante = user?.role === "GERANTE" || (isDuo && duoMode === "GERANTE");

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: Colors.darkText,
        tabBarStyle: {
          backgroundColor: Colors.dark,
          borderTopColor: Colors.darkLine,
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
          title: "Accueil",
          headerShown: true,
          header: () => <AppHeader />,
          tabBarIcon: ({ color, focused }) => (
            <AntDesign name="home" size={24} color={focused ? Colors.primaryLight : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ventes"
        options={{
          title: "Ventes",
          headerShown: true,
          header: () => <AppHeader />,
          tabBarIcon: ({ color, focused }) => (
            <AntDesign name="shopping-cart" size={24} color={focused ? Colors.primaryLight : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="creatrice"
        options={{
          title: isGerante ? "Créatrices" : "Événements",
          headerShown: true,
          header: () => <AppHeader />,
          tabBarIcon: ({ color, focused }) => (
            <AntDesign name={isGerante ? "team" : "calendar"} size={24} color={focused ? Colors.primaryLight : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          headerShown: true,
          header: () => <AppHeader />,
          tabBarIcon: ({ color, focused }) => (
            <AntDesign name="bar-chart" size={24} color={focused ? Colors.primaryLight : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="plus"
        options={{
          title: "Plus",
          headerShown: true,
          header: () => <AppHeader />,
          tabBarIcon: ({ color, focused }) => (
            <AntDesign name="ellipsis" size={24} color={focused ? Colors.primaryLight : color} />
          ),
        }}
      />
      {/* Écrans sans onglet : atteints depuis « Plus », l'Accueil ou les listes */}
      <Tabs.Screen name="profil" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="aide" options={{ href: null }} />
      <Tabs.Screen name="boutique/[id]" options={{ href: null }} />
      <Tabs.Screen name="mes-ventes-boutique/[id]" options={{ href: null }} />
    </Tabs>
  );
}
