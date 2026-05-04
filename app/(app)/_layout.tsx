import { AntDesign } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function AppLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <AntDesign name="home" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ventes"
        options={{
          title: "Ventes",
          tabBarIcon: ({ color }) => (
            <AntDesign name="shopping-cart" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="creatrice"
        options={{
          title: "Créatrices",
          tabBarIcon: ({ color }) => (
            <AntDesign name="team" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: "Stats",
          tabBarIcon: ({ color }) => (
            <AntDesign name="bar-chart" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profil"
        options={{
          title: "Profil",
          tabBarIcon: ({ color }) => (
            <AntDesign name="user" size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
