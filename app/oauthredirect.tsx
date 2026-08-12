import { useEffect } from "react";
import { router } from "expo-router";

//- Route "catch" pour le retour Google OAuth (encaissly://oauthredirect?...).
//- expo-auth-session résout la promesse de promptAsync() via son propre
//- listener sur cet événement Linking — cette page n'a qu'à éviter le 404
//- d'Expo Router et renvoyer l'utilisateur sur l'écran d'où il venait.
export default function OAuthRedirectScreen() {
  useEffect(() => {
    router.back();
  }, []);

  return null;
}
