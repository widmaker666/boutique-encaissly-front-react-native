import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { creatriceService } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { typo } from "@/styles/utils/typography.styles";
import { Colors } from "@/constants/colors";
import { styles } from "@/styles/pages/creatrice.style";

export default function CreatriceScreen() {
  const user = useAuthStore((state) => state.user);
  const isGerante = user?.role === "GERANTE";
  const isPro = user?.plan === "PRO";
  const [search, setSearch] = useState("");

  const { data: creatrices, isLoading } = useQuery({
    queryKey: ["creatrices"],
    queryFn: creatriceService.getAll,
  });

  if (isLoading)
    return (
      <View style={styles.container}>
        <Text style={typo.regular}>Chargement...</Text>
      </View>
    );

  //- Filtre par recherche
  const filtered = creatrices?.filter((c: any) =>
    c.nom.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[typo.title, styles.titre]}>CRÉATRICES</Text>
        {isGerante && (
          <TouchableOpacity style={styles.addBtn}>
            <Text style={styles.addBtnTxt}>+</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Barre de recherche */}
      <TextInput
        style={styles.search}
        placeholder="🔍 Rechercher..."
        placeholderTextColor={Colors.textLight}
        value={search}
        onChangeText={setSearch}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        {filtered?.map((creatrice: any) => (
          <TouchableOpacity key={creatrice.id} style={styles.card}>
            <View style={styles.avatar}>
              <Text style={styles.avatarTxt}>
                {creatrice.nom.substring(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.info}>
              <Text style={[typo.medium, styles.nom]}>{creatrice.nom}</Text>
              <Text style={[typo.light, styles.meta]}>
                {creatrice.tauxDeCommission}% commission
              </Text>
            </View>
            <Text style={[typo.bold, styles.taux]}>
              {creatrice.tauxDeCommission}%
            </Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        ))}

        {/* Limite FREE */}
        {isGerante && !isPro && (
          <View style={styles.lockedBox}>
            <Text style={styles.lockedTxt}>🔒 3 créatrices max en FREE</Text>
            <TouchableOpacity style={styles.upgradeBtn}>
              <Text style={styles.upgradeTxt}>✨ Passer à PRO — illimité</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
