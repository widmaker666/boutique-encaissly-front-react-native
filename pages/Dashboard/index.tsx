import { View, Text } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { statsService } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";

export default function DashboardScreen() {
  const user = useAuthStore((state) => state.user);
  const { data, isLoading } = useQuery({
    queryKey: ["stats"], // ← identifiant du cache — "ces données s'appellent 'stats'"
    queryFn: statsService.getGlobal, // ← la fonction qui fetch les données
  });

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Dashboard</Text>
      <Text>Bonjour {user?.prenom ?? user?.email} 👋</Text>
      <Text>CA total : {data?.stats._sum.prixVente}</Text>{" "}
    </View>
  );
}
