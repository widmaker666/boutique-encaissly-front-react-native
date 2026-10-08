import { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { Radius } from "@/constants/spacing";

const MOIS_LABELS = ["Janv", "Févr", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc"];
const MOIS_LONGS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const ANNEE_MIN = 2024;

/** "2026-10" → "octobre 2026" ; null → "Tous les mois". */
export function formatPeriode(mois: string | null): string {
  return mois ? `${MOIS_LONGS[Number(mois.slice(5)) - 1]} ${mois.slice(0, 4)}` : "Tous les mois";
}

interface PeriodePickerProps {
  /** null = tous les mois, sinon "YYYY-MM" */
  value: string | null;
  onChange: (mois: string | null) => void;
}

/** Choix « Tous les mois » ou d'un mois précis d'une année — partagé Stats / fiche créatrice. */
export default function PeriodePicker({ value, onChange }: PeriodePickerProps) {
  const now = new Date();
  const [annee, setAnnee] = useState(value ? Number(value.slice(0, 4)) : now.getFullYear());

  return (
    <View style={st.periode}>
      <View style={st.periodeRow}>
        <TouchableOpacity
          style={[st.pill, value === null && st.pillActive]}
          onPress={() => onChange(null)}
          activeOpacity={0.75}
        >
          <Text style={[st.pillTxt, value === null && st.pillTxtActive]}>Tous les mois</Text>
        </TouchableOpacity>
        <View style={st.yearNav}>
          <TouchableOpacity
            style={st.yearBtn}
            disabled={annee <= ANNEE_MIN}
            onPress={() => setAnnee(annee - 1)}
            accessibilityLabel="Année précédente"
          >
            <Text style={[st.yearArrow, annee <= ANNEE_MIN && st.yearArrowOff]}>‹</Text>
          </TouchableOpacity>
          <Text style={st.yearLabel}>{annee}</Text>
          <TouchableOpacity
            style={st.yearBtn}
            disabled={annee >= now.getFullYear()}
            onPress={() => setAnnee(annee + 1)}
            accessibilityLabel="Année suivante"
          >
            <Text style={[st.yearArrow, annee >= now.getFullYear() && st.yearArrowOff]}>›</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={st.moisGrid}>
        {MOIS_LABELS.map((label, i) => {
          const mois = `${annee}-${String(i + 1).padStart(2, "0")}`;
          const futur = annee === now.getFullYear() && i > now.getMonth();
          const active = value === mois;
          return (
            <TouchableOpacity
              key={mois}
              style={[st.moisPill, active && st.pillActive, futur && st.moisPillOff]}
              disabled={futur}
              onPress={() => onChange(mois)}
              activeOpacity={0.75}
            >
              <Text style={[st.pillTxt, active && st.pillTxtActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  periode: {
    gap: 8,
    marginBottom: 12,
  },
  periodeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  pill: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  pillTxt: {
    fontFamily: Fonts.family.nowMedium,
    fontSize: Fonts.sizes.sm,
    color: Colors.text,
  },
  pillTxtActive: {
    color: "#fff",
  },
  yearNav: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  yearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  yearArrow: {
    fontFamily: Fonts.family.nowBold,
    fontSize: 22,
    color: Colors.text,
  },
  yearArrowOff: {
    opacity: 0.3,
  },
  yearLabel: {
    fontFamily: Fonts.family.nowBold,
    fontSize: Fonts.sizes.md,
    color: Colors.text,
    minWidth: 44,
    textAlign: "center",
  },
  moisGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  moisPill: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  moisPillOff: {
    opacity: 0.35,
  },
});
