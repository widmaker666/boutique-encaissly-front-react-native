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
import { useRouter } from "expo-router";
import { creatriceService } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import type { Creatrice } from "@/types";
import { typo } from "@/styles/utils/typography.styles";
import { Colors } from "@/constants/colors";
import { styles, getAvatarColor } from "@/styles/pages/creatrice.style";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ModalCreation from "@/components/Creatrice/ModalCreation";
import EventFiche from "@/pages/Creatrice/EventFiche";
import PersonnelRecap from "@/pages/Creatrice/PersonnelRecap";

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

const round2 = (n: number | null | undefined): string =>
  (Math.round((n ?? 0) * 100) / 100).toFixed(2);

export default function CreatriceScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const isGerante = user?.role === "GERANTE";
  const activeEvenementId = useAuthStore((state) => state.activeEvenementId);
  const activeEvenementNom = useAuthStore((state) => state.activeEvenementNom);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;

  // Hooks toujours appelés (avant tout return conditionnel)
  const { data: creatrices, isLoading } = useQuery({
    queryKey: ["creatrices"],
    queryFn: creatriceService.getAll,
    enabled: isGerante,
  });

  useEffect(() => {
    if (!isGerante) return;
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
  }, [isGerante]);

  // ── CREATRICE : EventFiche ou PersonnelRecap selon le contexte actif
  if (!isGerante) {
    if (activeEvenementId) {
      return <EventFiche evenementId={activeEvenementId} evenementNom={activeEvenementNom ?? ""} />;
    }
    return <PersonnelRecap />;
  }

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
          <Text style={styles.titre}>CREATRICES</Text>
          <Text style={styles.headerSub}>
            {count} créatrice{count > 1 ? "s" : ""} · {user?.plan ?? "FREE"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          activeOpacity={0.8}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.addBtnTxt}>+</Text>
        </TouchableOpacity>
      </Animated.View>

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
              onPress={() => router.push(`/(app)/creatrice/${creatrice.id}`)}
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
                    ? `${creatrice.nbVentes} vente${creatrice.nbVentes > 1 ? "s" : ""} · ${round2(creatrice.ca)} €`
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

        {!user?.plan?.includes("PRO") && (
          <AnimCard index={(filtered?.length ?? 0) + 1} style={styles.lockedBox}>
            <Text style={styles.lockedEmoji}>🔒</Text>
            <Text style={styles.lockedTxt}>3 créatrices max en FREE</Text>
            <TouchableOpacity style={styles.upgradeBtn} activeOpacity={0.85}>
              <Text style={styles.upgradeTxt}>✨ Passer à PRO — illimité</Text>
            </TouchableOpacity>
          </AnimCard>
        )}
      </ScrollView>

      <ModalCreation
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}
