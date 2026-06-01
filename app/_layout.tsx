import { useFonts } from "expo-font";
import { Stack, Redirect } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth.store";
import * as WebBrowser from "expo-web-browser";

//- Nécessaire pour fermer le navigateur Google après auth
WebBrowser.maybeCompleteAuthSession();

const queryClient = new QueryClient();

export default function RootLayout() {
  const accessToken = useAuthStore((state) => state.accessToken);

  const [fontsLoaded] = useFonts({
    Norwester: require("@/assets/fonts/norwester.otf"),
    Urbanist: require("@/assets/fonts/Urbanist-VariableFont_wght.ttf"),
    "Now-Thin": require("@/assets/fonts/Now-Thin.otf"),
    "Now-Light": require("@/assets/fonts/Now-Light.otf"),
    "Now-Regular": require("@/assets/fonts/Now-Regular.otf"),
    "Now-Medium": require("@/assets/fonts/Now-Medium.otf"),
    "Now-Bold": require("@/assets/fonts/Now-Bold.otf"),
    "Now-Black": require("@/assets/fonts/Now-Black.otf"),
  });

  if (!fontsLoaded) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
      {accessToken && <Redirect href="/(app)" />}
    </QueryClientProvider>
  );
}
