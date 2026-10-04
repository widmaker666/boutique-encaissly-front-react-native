import { useEffect, useState } from "react";
import { useFonts } from "expo-font";
import { Stack, Redirect } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";

//- Nécessaire pour fermer le navigateur Google après auth
WebBrowser.maybeCompleteAuthSession();

const queryClient = new QueryClient();

export default function RootLayout() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);

  const [fontsLoaded] = useFonts({
    Urbanist: require("@/assets/fonts/Urbanist-VariableFont_wght.ttf"),
    "Now-Thin": require("@/assets/fonts/Now-Thin.otf"),
    "Now-Light": require("@/assets/fonts/Now-Light.otf"),
    "Now-Regular": require("@/assets/fonts/Now-Regular.otf"),
    "Now-Medium": require("@/assets/fonts/Now-Medium.otf"),
    "Now-Bold": require("@/assets/fonts/Now-Bold.otf"),
    "Now-Black": require("@/assets/fonts/Now-Black.otf"),
  });

  useEffect(() => {
    AsyncStorage.getItem("hasSeenOnboarding").then((val) => {
      setHasSeenOnboarding(val === "true");
    });
  }, []);

  if (!fontsLoaded || hasSeenOnboarding === null) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
      {!hasSeenOnboarding && <Redirect href="/onboarding" />}
      {hasSeenOnboarding && accessToken && <Redirect href="/(app)" />}
    </QueryClientProvider>
  );
}
