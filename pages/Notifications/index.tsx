import { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService, creatriceService } from "@/services/api";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  metadata?: {
    creatriceId?: string;
    boutiqueId?: string;
    boutiqueName?: string;
  };
  read: boolean;
  createdAt: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRelative(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();

  const todayStr = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const hhmm = date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (date.toDateString() === todayStr) {
    return `Aujourd'hui ${hhmm}`;
  }
  if (date.toDateString() === yesterdayStr) {
    return `Hier ${hhmm}`;
  }
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

function getTypeEmoji(type: string): string {
  if (type === "VENTE") return "💰";
  return "📌";
}

// ── AnimCard ──────────────────────────────────────────────────────────────────

function AnimCard({
  children,
  index,
  style,
}: {
  children: React.ReactNode;
  index: number;
  style?: object;
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

// ── NotificationsScreen ───────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const { data: notifications, isLoading } = useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: notificationService.getAll,
  });

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  const { mutate: acceptInvitation, isPending: isAccepting } = useMutation({
    mutationFn: ({ creatriceId, boutiqueId }: { creatriceId: string; boutiqueId: string }) =>
      creatriceService.acceptInvitation(creatriceId, boutiqueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
      Alert.alert("Invitation acceptée", "Tu fais maintenant partie de la boutique !");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? err?.message ?? "Impossible de rejoindre la boutique.";
      Alert.alert("Erreur", typeof msg === "string" ? msg : JSON.stringify(msg));
    },
  });

  const markAllMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["notifications-count"] });
    },
  });

  return (
    <View style={styles.container}>
      {/* Header violet */}
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
        <Text style={styles.titre}>NOTIFICATIONS</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllBtn}
            activeOpacity={0.8}
            onPress={() => markAllMutation.mutate()}
            disabled={markAllMutation.isPending}
          >
            <Text style={styles.markAllTxt}>
              {markAllMutation.isPending ? "..." : "Tout lire"}
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Contenu */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={Colors.primary} size="large" />
        </View>
      ) : !notifications || notifications.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyTxt}>Aucune notification pour l'instant</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
        >
          {notifications.map((notif, index) => (
            <AnimCard key={notif.id} index={index} style={[
              styles.card,
              !notif.read && styles.cardUnread,
            ]}>
              <View style={styles.cardRow}>
                {/* Point lu/non-lu */}
                <View style={styles.dotWrapper}>
                  <View style={[
                    styles.dot,
                    notif.read ? styles.dotRead : styles.dotUnread,
                  ]} />
                </View>

                {/* Contenu */}
                <View style={styles.cardContent}>
                  <View style={styles.cardTop}>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeTxt}>
                        {getTypeEmoji(notif.type)} {notif.type}
                      </Text>
                    </View>
                    <Text style={styles.cardDate}>
                      {formatRelative(notif.createdAt)}
                    </Text>
                  </View>
                  <Text style={[
                    styles.cardMessage,
                    notif.read && styles.cardMessageRead,
                  ]}>
                    {notif.message}
                  </Text>
                  {notif.type === "INVITATION_BOUTIQUE" && notif.metadata?.creatriceId && (
                    <View style={styles.actionRow}>
                      <Text style={styles.inviteTxt}>
                        Boutique : {notif.metadata.boutiqueName}
                      </Text>
                      <TouchableOpacity
                        style={styles.joinBtn}
                        disabled={isAccepting}
                        activeOpacity={0.8}
                        onPress={() =>
                          acceptInvitation({
                            creatriceId: notif.metadata!.creatriceId!,
                            boutiqueId: notif.metadata!.boutiqueId ?? "",
                          })
                        }
                      >
                        <Text style={styles.joinBtnTxt}>Rejoindre</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </AnimCard>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f4ff",
  },
  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titre: {
    fontFamily: "Norwester",
    fontSize: 22,
    color: "#fff",
    letterSpacing: 1.5,
  },
  markAllBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  markAllTxt: {
    fontFamily: "Now-Medium",
    fontSize: 13,
    color: "#fff",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyTxt: {
    fontFamily: "Now-Regular",
    fontSize: 15,
    color: Colors.textLight,
    textAlign: "center",
  },
  list: {
    padding: 16,
    gap: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    shadowColor: "#7a41bb",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardUnread: {
    backgroundColor: "#f3eaff",
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  dotWrapper: {
    paddingTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotUnread: {
    backgroundColor: Colors.primary,
  },
  dotRead: {
    backgroundColor: "#ccc",
  },
  cardContent: {
    flex: 1,
    gap: 6,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  typeBadge: {
    backgroundColor: "rgba(122, 65, 187, 0.1)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  typeBadgeTxt: {
    fontFamily: "Now-Medium",
    fontSize: 11,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  cardDate: {
    fontFamily: "Now-Light",
    fontSize: 11,
    color: Colors.textLight,
  },
  cardMessage: {
    fontFamily: "Now-Regular",
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  cardMessageRead: {
    color: Colors.textLight,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f0eaf8",
  },
  inviteTxt: {
    fontFamily: "Now-Light",
    fontSize: 12,
    color: "#7a7a7a",
    flex: 1,
  },
  joinBtn: {
    backgroundColor: "#7a41bb",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    marginLeft: 10,
  },
  joinBtnTxt: {
    fontFamily: "Now-Bold",
    fontSize: 12,
    color: "#fff",
  },
});
