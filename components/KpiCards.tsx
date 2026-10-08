import { StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import Card from "@/components/Cards/Card";

const round2 = (n: number) => (Math.round(n * 100) / 100).toFixed(2);

interface KpiCardsProps {
  gerante: boolean;
  ca: number;
  nbVentes: number;
  totalCommissions: number;
  /** CA de la période précédente, pour l'évolution (0 = pas de comparaison) */
  previousCA?: number;
  creatricesActives?: number;
}

/** Les 4 chiffres clés d'une période — mêmes libellés et calculs que sur le web. */
export default function KpiCards({ gerante, ca, nbVentes, totalCommissions, previousCA = 0, creatricesActives = 0 }: KpiCardsProps) {
  const ticketMoyen = nbVentes > 0 ? ca / nbVentes : 0;
  const net = ca - totalCommissions;
  const evolution = previousCA > 0 ? ((ca - previousCA) / previousCA) * 100 : null;

  return (
    <View style={s.grid}>
      <View style={s.cell}>
        <Card padding="sm">
          <Text style={s.label}>{gerante ? "CA boutique" : "Chiffre d'affaires"}</Text>
          <Text style={s.value} numberOfLines={1} adjustsFontSizeToFit>{round2(ca)} €</Text>
          {evolution !== null && (
            <Text style={evolution >= 0 ? s.up : s.down}>
              {evolution >= 0 ? `▲ +${evolution.toFixed(1)}%` : `▼ ${evolution.toFixed(1)}%`}
            </Text>
          )}
        </Card>
      </View>
      <View style={s.cell}>
        <Card padding="sm">
          <Text style={s.label}>{gerante ? "Créatrices actives" : "Ventes"}</Text>
          <Text style={s.value}>{gerante ? creatricesActives : nbVentes}</Text>
        </Card>
      </View>
      <View style={s.cell}>
        <Card padding="sm">
          <Text style={s.label}>{gerante ? "Commissions reçues" : "Net à percevoir"}</Text>
          <Text style={s.valueGreen} numberOfLines={1} adjustsFontSizeToFit>{round2(gerante ? totalCommissions : net)} €</Text>
        </Card>
      </View>
      <View style={s.cell}>
        <Card padding="sm">
          <Text style={s.label}>Ticket moyen</Text>
          <Text style={s.value} numberOfLines={1} adjustsFontSizeToFit>{round2(ticketMoyen)} €</Text>
        </Card>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  cell: { width: "48.5%" },
  label: { fontFamily: Fonts.family.nowBold, fontSize: 11, color: Colors.textLight, letterSpacing: 0.3, marginBottom: 6 },
  value: { fontFamily: Fonts.family.norwester, fontWeight: "800", fontSize: Fonts.sizes.lg, color: Colors.primary },
  valueGreen: { fontFamily: Fonts.family.norwester, fontWeight: "800", fontSize: Fonts.sizes.lg, color: Colors.successDark },
  up: { fontFamily: Fonts.family.nowBold, fontSize: 11, color: Colors.successDark, marginTop: 2 },
  down: { fontFamily: Fonts.family.nowBold, fontSize: 11, color: Colors.error, marginTop: 2 },
});
