import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/auth.store";
import HomeScreen from "@/pages/Home";

export default function Index() {
  const accessToken = useAuthStore((state) => state.accessToken);

  if (accessToken) return <Redirect href="/(app)" />;

  return <HomeScreen />;
}