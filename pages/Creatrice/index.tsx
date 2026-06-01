import { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { creatriceService } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import type { Creatrice } from "@/types";
import { typo } from "@/styles/utils/typography.styles";
import { Colors } from "@/constants/colors";
import { styles, getAvatarColor } from "@/styles/pages/creatrice.style";
import { useSafeAreaInsets } from "react-native-safe-area-context";

//- Card animée avec délai
function AnimCard({
  children,
  index,
  style,
}: {
  children: React.ReactNode;
  index: number;
  style?: any;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 320,
      delay: index * 50,
      useNativeDriver: true,
    }).start();
  }, []);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: anim,
          transform: [
            {
              translateY: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

export default function CreatriceScreen() {
  const insets = useSafeAreaInsets();
  const user = useAuthStore((state) => state.user);
  const isGerante = user?.role === "GERANTE";
  const isPro = user?.plan === "PRO";
  const [search, setSearch] = useState("");

  const headerAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;

  const { data: creatrices, isLoading } = useQuery({
    queryKey: ["creatrices"],
    queryFn: creatriceService.getAll,
  });

  useEffect(() => {
    Animated.stagger(80, [
      Animated.timing(headerAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(searchAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (isLoading)
    return (
      <View style={styles.loadingContainer}>
        <Text style={[typo.regular, { color: Colors.textLight }]}>
          Chargement...
        </Text>
      </View>
    );

  const filtered = creatrices?.filter((c: Creatrice) =>
    c.nom.toLowerCase().includes(search.toLowerCase()),
  );

  const count = creatrices?.length ?? 0;

  return (
    <View style={styles.container}>
      {/* Header animé */}
      <Animated.View
        style={[
          styles.header,
          { paddingTop: insets.top + 16 },
          {
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-16, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View>
          <Text style={styles.titre}>CRÉATRICES</Text>
          <Text style={styles.headerSub}>
            {count} créatrice{count > 1 ? "s" : ""} · {user?.plan ?? "FREE"}
          </Text>
        </View>
        {isGerante && (
          <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}>
            <Text style={styles.addBtnTxt}>+</Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Search animée */}
      <Animated.View
        style={[
          styles.searchWrapper,
          {
            opacity: searchAnim,
            transform: [
              {
                translateY: searchAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.search}
          placeholder="Rechercher une créatrice..."
          placeholderTextColor={Colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {filtered?.map((creatrice: Creatrice, index: number) => (
          <AnimCard key={creatrice.id} index={index} style={styles.card}>
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
              activeOpacity={0.75}
            >
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: getAvatarColor(index) },
                ]}
              >
                <Text style={styles.avatarTxt}>
                  {creatrice.nom.substring(0, 2).toUpperCase()}
                </Text>
              </View>

              <View style={styles.info}>
                <Text style={styles.nom} numberOfLines={1}>
                  {creatrice.nom}
                </Text>
                <Text style={styles.meta} numberOfLines={1}>
                  {creatrice.nbVentes
                    ? `${creatrice.nbVentes} vente${creatrice.nbVentes > 1 ? "s" : ""} · ${creatrice.ca ?? 0} €`
                    : (creatrice.email ?? creatrice.telephone ?? "Aucun contact")}
                </Text>
              </View>

              <View style={styles.badge}>
                <Text style={styles.badgeTxt}>
                  {creatrice.tauxDeCommission}%
                </Text>
              </View>

              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          </AnimCard>
        ))}

        {filtered?.length === 0 && search.length > 0 && (
          <Text style={styles.emptyTxt}>Aucune créatrice trouvée</Text>
        )}

        {isGerante && !isPro && (
          <AnimCard index={(filtered?.length ?? 0) + 1} style={styles.lockedBox}>
            <Text style={styles.lockedEmoji}>🔒</Text>
            <Text style={styles.lockedTxt}>3 créatrices max en FREE</Text>
            <TouchableOpacity style={styles.upgradeBtn} activeOpacity={0.85}>
              <Text style={styles.upgradeTxt}>✨ Passer à PRO — illimité</Text>
            </TouchableOpacity>
          </AnimCard>
        )}
      </ScrollView>
    </View>
  );
}
