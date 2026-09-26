import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";
import { API_BASE_URL } from "@/constants/api";

const MIME: Record<string, string> = {
  pdf: "application/pdf",
  csv: "text/csv",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

// Message clair selon la raison du refus (le backend renvoie 403/404/400)
const messageErreur = (status: number): string => {
  if (status === 403) return "Cette fonction n'est pas disponible avec votre formule.";
  if (status === 404) return "Boutique ou créatrice introuvable.";
  if (status === 400) return "Période invalide.";
  return "Impossible de générer le document.";
};

/**
 * Télécharge un document généré par le backend (avec le token) puis ouvre la
 * feuille de partage. Aucune limite de nombre : on peut le relancer autant de
 * fois que voulu, le fichier local est simplement écrasé.
 * `path` est relatif à l'API (ex. "/export/pdf/ventes?mois=2026-09").
 * Retourne true si le fichier a bien été généré.
 */
export async function downloadAndShare(
  path: string,
  filename: string,
  token: string | null,
): Promise<boolean> {
  if (!token) return false;
  const ext = filename.split(".").pop() ?? "pdf";
  const fileUri = `${FileSystem.documentDirectory}${filename}`;
  try {
    const result = await FileSystem.downloadAsync(`${API_BASE_URL}${path}`, fileUri, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (result.status !== 200) {
      // downloadAsync écrit le corps de l'erreur dans le fichier : on le retire
      await FileSystem.deleteAsync(result.uri, { idempotent: true }).catch(() => {});
      Alert.alert("Erreur", messageErreur(result.status));
      return false;
    }

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(result.uri, {
        mimeType: MIME[ext] ?? "application/octet-stream",
        dialogTitle: "Ouvrir ou enregistrer le document",
        UTI: ext === "pdf" ? "com.adobe.pdf" : undefined,
      });
    } else {
      Alert.alert("Document prêt", `Fichier sauvegardé : ${filename}`);
    }
    return true;
  } catch {
    Alert.alert("Erreur", "Une erreur est survenue lors du téléchargement.");
    return false;
  }
}
