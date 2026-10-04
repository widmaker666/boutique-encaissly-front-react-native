import { StyleSheet, View } from "react-native";
import { Spacing } from "@/constants/spacing";
import Card, { CardButton } from "@/components/Cards/Card";

interface ListRowProps {
  /** Bloc de gauche — typiquement un titre + une ligne secondaire (Text empilés). */
  left: React.ReactNode;
  /** Bloc de droite — typiquement un montant et/ou un Badge. */
  right?: React.ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
}

/** Ligne de liste mobile (card compacte en flex-row) — remplace le pattern
 * `<table>` du web, qui n'a pas d'équivalent direct en React Native. Pensé
 * pour être rendu dans une FlatList avec un petit gap entre les items (pas
 * de bordures internes comme un vrai tableau). */
export default function ListRow({ left, right, onPress, accessibilityLabel }: ListRowProps) {
  const content = (
    <View style={styles.row}>
      <View style={styles.left}>{left}</View>
      {right && <View style={styles.right}>{right}</View>}
    </View>
  );

  if (onPress) {
    return (
      <CardButton padding="sm" onPress={onPress} accessibilityLabel={accessibilityLabel}>
        {content}
      </CardButton>
    );
  }
  return <Card padding="sm">{content}</Card>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.md,
  },
  left: {
    flex: 1,
    gap: 2,
  },
  right: {
    alignItems: "flex-end",
    gap: 4,
  },
});
