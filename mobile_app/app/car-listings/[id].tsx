// app/car-listings/[id].tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Image,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { useGetListingByIdQuery, Listing } from "../../store/apis/listingsApi";
import {
  useAccessContactMutation,
  useGetMyAccessesQuery,
} from "../../store/apis/accessApi";
import { useGetCoinBalanceQuery } from "../../store/apis/paymentApi";
import { useInitiateChatMutation } from "../../store/apis/chatApi";
import { useTheme } from "../../hooks/useTheme";
import { RootState } from "../../store/store";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

function normalizeListing(data: any): Listing | null {
  if (!data) return null;
  if (data.listing) return data.listing as Listing;
  return data as Listing;
}

export default function CarDetailScreen() {
  const t = useTheme();
  const s = makeStyles(t);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const token = useSelector((st: RootState) => st.user.token);
  const currentUser = useSelector((st: RootState) => st.user.currentUser);
  const [activeImage, setActiveImage] = useState(0);
  const [unlocking, setUnlocking] = useState(false);
  const [chatting, setChatting] = useState(false);

  const { data, isLoading, isError } = useGetListingByIdQuery(id as string);
  const { data: balanceData, refetch: refetchBalance } = useGetCoinBalanceQuery(
    undefined,
    { skip: !token },
  );
  const { data: accessData, refetch: refetchAccess } = useGetMyAccessesQuery(
    undefined,
    { skip: !token },
  );
  const [accessContact] = useAccessContactMutation();
  const [initiateChat] = useInitiateChatMutation();

  const listing: Listing | null = normalizeListing(data?.data);
  const myAccesses = accessData?.data?.accesses ?? [];
  const alreadyUnlocked = myAccesses.some((a) => a.listing?.id === id);
  const unlockedAccess = myAccesses.find((a) => a.listing?.id === id);
  const coins = balanceData?.data?.coins ?? currentUser?.coins ?? 0;
  const isOwner = listing?.owner?.id === currentUser?.id;
  const coinCost = listing?.contactCoinLimit ?? 1;

  const handleUnlock = async () => {
    if (!token) {
      router.push("/(auth)/login");
      return;
    }
    if (coins < coinCost) {
      Alert.alert(
        "Insufficient Coins",
        `You need ${coinCost} coins.\nYour balance: ${coins} coins.`,
        [
          {
            text: "Buy Coins",
            onPress: () => router.push("/(tabs)/coins" as any),
          },
          { text: "Cancel", style: "cancel" },
        ],
      );
      return;
    }
    Alert.alert(
      "Unlock Contact",
      `This will use ${coinCost} coin${coinCost !== 1 ? "s" : ""} from your balance of ${coins}.\nContinue?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Unlock",
          onPress: async () => {
            setUnlocking(true);
            try {
              await accessContact({ listingId: id as string }).unwrap();
              await Promise.all([refetchBalance(), refetchAccess()]);
              Toast.show({ type: "success", text1: "Contact unlocked!" });
            } catch (e: any) {
              Toast.show({
                type: "error",
                text1: e?.data?.message ?? "Failed to unlock.",
              });
            } finally {
              setUnlocking(false);
            }
          },
        },
      ],
    );
  };

  const handleChat = async () => {
    if (!token) {
      router.push("/(auth)/login");
      return;
    }
    if (!listing?.owner?.id) return;
    setChatting(true);
    try {
      await initiateChat({
        listingId: id as string,
        otherUserId: listing.owner.id,
      }).unwrap();
      router.push("/chat" as any);
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: e?.data?.message ?? "Could not open chat.",
      });
    } finally {
      setChatting(false);
    }
  };

  if (isLoading)
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={t.primary} />
      </View>
    );
  if (isError || !listing)
    return (
      <View style={s.center}>
        <Ionicons name="alert-circle-outline" size={48} color={t.textMuted} />
        <Text style={s.errorText}>Car listing not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtnCenter}>
          <Text style={{ color: t.primary, fontWeight: "700" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );

  const images = listing.images ?? [];
  const loc = listing.location ?? ({} as any);
  const owner = listing.owner ?? ({} as any);

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color="#fff" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image carousel */}
        <View style={s.imageWrap}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) =>
              setActiveImage(Math.round(e.nativeEvent.contentOffset.x / width))
            }
            scrollEventThrottle={16}
          >
            {images.length > 0 ? (
              images.map((img: string, i: number) => (
                <Image
                  key={i}
                  source={{ uri: img }}
                  style={{ width, height: 300 }}
                  resizeMode="cover"
                />
              ))
            ) : (
              <View style={[s.imagePlaceholder, { width }]}>
                <Ionicons name="car-outline" size={60} color="#fff" />
              </View>
            )}
          </ScrollView>
          {images.length > 1 && (
            <View style={s.dots}>
              {images.map((_: any, i: number) => (
                <View
                  key={i}
                  style={[s.dot, i === activeImage && s.dotActive]}
                />
              ))}
            </View>
          )}
          <View style={s.imageBadges}>
            <View style={s.typeBadge}>
              <Text style={s.typeBadgeText}>Car</Text>
            </View>
            {listing.listingMode && (
              <View
                style={[
                  s.modeBadge,
                  {
                    backgroundColor:
                      listing.listingMode === "rent" ? "#3B82F6" : "#22C55E",
                  },
                ]}
              >
                <Text style={s.modeBadgeText}>{listing.listingMode}</Text>
              </View>
            )}
            {listing.condition && (
              <View
                style={[s.modeBadge, { backgroundColor: "rgba(0,0,0,0.55)" }]}
              >
                <Text style={s.modeBadgeText}>{listing.condition}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={s.body}>
          {/* Title & Price */}
          <View style={s.titleRow}>
            <View style={{ flex: 1 }}>
              <Text style={s.title}>{listing.title}</Text>
              <View style={s.locRow}>
                <Ionicons name="location-outline" size={14} color={t.primary} />
                <Text style={s.locText}>
                  {loc.fullAddress ?? loc.city ?? "Location not specified"}
                </Text>
              </View>
            </View>
            <View style={s.priceWrap}>
              <Text style={s.price}>{listing.price?.toLocaleString()}</Text>
              <Text style={s.priceSub}>
                ETB{listing.listingMode === "rent" ? "/day" : ""}
              </Text>
            </View>
          </View>

          {/* Quick stats */}
          <View style={s.statsRow}>
            {listing.brand && (
              <StatPill icon="car-sport-outline" value={listing.brand} t={t} />
            )}
            {listing.carModel && (
              <StatPill icon="albums-outline" value={listing.carModel} t={t} />
            )}
            {listing.carType && (
              <StatPill icon="options-outline" value={listing.carType} t={t} />
            )}
            {listing.condition && (
              <StatPill
                icon="shield-checkmark-outline"
                value={listing.condition}
                t={t}
              />
            )}
          </View>

          {/* Coin cost chip */}
          <View
            style={[
              s.coinChip,
              {
                backgroundColor: `${t.primary}10`,
                borderColor: `${t.primary}25`,
              },
            ]}
          >
            <Ionicons name="logo-bitcoin" size={15} color={t.primary} />
            <Text style={[s.coinChipText, { color: t.primary }]}>
              {coinCost} coin{coinCost !== 1 ? "s" : ""} to unlock contact
            </Text>
            {!alreadyUnlocked && (
              <Text style={[s.coinChipBalance, { color: t.textMuted }]}>
                · Your balance: {coins}
              </Text>
            )}
            {alreadyUnlocked && (
              <View style={[s.unlockedBadge, { backgroundColor: t.success }]}>
                <Ionicons name="checkmark" size={10} color="#fff" />
                <Text style={s.unlockedBadgeText}>Unlocked</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {listing.description && (
            <Section title="Description" t={t}>
              <Text style={s.desc}>{listing.description}</Text>
            </Section>
          )}

          {/* Car Details */}
          <Section title="Car Details" t={t}>
            <View style={s.detailsGrid}>
              {listing.brand && (
                <DetailRow label="Brand" value={listing.brand} t={t} />
              )}
              {listing.carModel && (
                <DetailRow label="Model" value={listing.carModel} t={t} />
              )}
              {listing.carType && (
                <DetailRow label="Type" value={listing.carType} t={t} />
              )}
              {listing.condition && (
                <DetailRow label="Condition" value={listing.condition} t={t} />
              )}
              {listing.listingMode && (
                <DetailRow label="Mode" value={listing.listingMode} t={t} />
              )}
              {listing.rentalPeriod && (
                <DetailRow
                  label="Rental Period"
                  value={listing.rentalPeriod}
                  t={t}
                />
              )}
              {loc.city && <DetailRow label="City" value={loc.city} t={t} />}
              {loc.subCity && (
                <DetailRow label="Sub-City" value={loc.subCity} t={t} />
              )}
              {loc.placeName && (
                <DetailRow label="Place" value={loc.placeName} t={t} />
              )}
            </View>
          </Section>

          {/* Contact section */}
          {!isOwner && (
            <Section title="Contact Owner" t={t}>
              {alreadyUnlocked && unlockedAccess ? (
                <View style={s.contactCard}>
                  <View style={s.contactRow}>
                    <Ionicons name="call-outline" size={18} color={t.primary} />
                    <Text style={s.contactValue}>
                      {unlockedAccess.listing?.owner?.phone ??
                        owner.phone ??
                        "—"}
                    </Text>
                    <TouchableOpacity
                      style={s.callBtn}
                      onPress={() =>
                        Linking.openURL(
                          `tel:${unlockedAccess.listing?.owner?.phone ?? owner.phone}`,
                        )
                      }
                    >
                      <Text style={s.callBtnText}>Call</Text>
                    </TouchableOpacity>
                  </View>
                  <View
                    style={[
                      s.contactRow,
                      { borderTopWidth: 1, borderTopColor: t.border },
                    ]}
                  >
                    <Ionicons name="mail-outline" size={18} color={t.primary} />
                    <Text style={s.contactValue}>
                      {unlockedAccess.listing?.owner?.email ??
                        owner.email ??
                        "—"}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={s.lockCard}>
                  <Ionicons name="lock-closed" size={32} color={t.textMuted} />
                  <Text style={s.lockTitle}>Contact Hidden</Text>
                  <Text style={s.lockSub}>
                    Unlock to see the owner's phone & email
                  </Text>
                  <View
                    style={[
                      s.coinCostBox,
                      {
                        backgroundColor: `${t.primary}08`,
                        borderColor: `${t.primary}20`,
                      },
                    ]}
                  >
                    <View style={s.coinCostRow}>
                      <Ionicons
                        name="logo-bitcoin"
                        size={18}
                        color={t.primary}
                      />
                      <Text style={[s.coinCostValue, { color: t.primary }]}>
                        {coinCost}
                      </Text>
                      <Text style={[s.coinCostLabel, { color: t.textMuted }]}>
                        coins required
                      </Text>
                    </View>
                    <View style={s.coinDivider} />
                    <View style={s.coinCostRow}>
                      <Ionicons
                        name="wallet-outline"
                        size={16}
                        color={coins >= coinCost ? t.success : t.destructive}
                      />
                      <Text
                        style={[
                          s.coinCostValue,
                          {
                            color:
                              coins >= coinCost ? t.success : t.destructive,
                          },
                        ]}
                      >
                        {coins}
                      </Text>
                      <Text style={[s.coinCostLabel, { color: t.textMuted }]}>
                        your balance
                      </Text>
                    </View>
                    {coins < coinCost && (
                      <View
                        style={[
                          s.shortfallChip,
                          { backgroundColor: `${t.destructive}10` },
                        ]}
                      >
                        <Ionicons
                          name="warning-outline"
                          size={12}
                          color={t.destructive}
                        />
                        <Text
                          style={[s.shortfallText, { color: t.destructive }]}
                        >
                          Need {coinCost - coins} more coins
                        </Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[
                      s.unlockBtn,
                      { backgroundColor: t.primary },
                      unlocking && { opacity: 0.6 },
                    ]}
                    onPress={handleUnlock}
                    disabled={unlocking}
                  >
                    {unlocking ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons
                          name="lock-open-outline"
                          size={16}
                          color="#fff"
                        />
                        <Text style={s.unlockBtnText}>
                          Unlock for {coinCost} Coins
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                  {coins < coinCost && (
                    <TouchableOpacity
                      style={[s.buyCoinsBtn, { borderColor: t.primary }]}
                      onPress={() => router.push("/(tabs)/coins" as any)}
                    >
                      <Ionicons
                        name="add-circle-outline"
                        size={15}
                        color={t.primary}
                      />
                      <Text style={[s.buyCoinsText, { color: t.primary }]}>
                        Buy More Coins
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </Section>
          )}

          {/* Chat button */}
          {!isOwner && alreadyUnlocked && (
            <TouchableOpacity
              style={[s.chatBtn, chatting && { opacity: 0.6 }]}
              onPress={handleChat}
              disabled={chatting}
            >
              {chatting ? (
                <ActivityIndicator color={t.primary} size="small" />
              ) : (
                <>
                  <Ionicons
                    name="chatbubble-outline"
                    size={18}
                    color={t.primary}
                  />
                  <Text style={s.chatBtnText}>Chat with Owner</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          <View style={{ height: 32 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, t, children }: any) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text
        style={{
          fontSize: 17,
          fontWeight: "800",
          color: t.text,
          marginBottom: 12,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}
function StatPill({ icon, value, t }: any) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: `${t.primary}12`,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: `${t.primary}25`,
      }}
    >
      <Ionicons name={icon} size={14} color={t.primary} />
      <Text
        style={{
          fontSize: 12,
          fontWeight: "700",
          color: t.primary,
          textTransform: "capitalize",
        }}
      >
        {value}
      </Text>
    </View>
  );
}
function DetailRow({ label, value, t }: any) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: t.border,
      }}
    >
      <Text style={{ fontSize: 13, color: t.textMuted, fontWeight: "600" }}>
        {label}
      </Text>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "700",
          color: t.text,
          textTransform: "capitalize",
          maxWidth: "55%",
          textAlign: "right",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function makeStyles(t: any) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: t.background,
      gap: 12,
    },
    errorText: { fontSize: 16, color: t.textMuted, fontWeight: "600" },
    backBtnCenter: { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10 },
    backBtn: {
      position: "absolute",
      top: 52,
      left: 16,
      zIndex: 10,
      backgroundColor: "rgba(0,0,0,0.4)",
      borderRadius: 20,
      width: 38,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
    },
    imageWrap: { position: "relative" },
    imagePlaceholder: {
      height: 300,
      backgroundColor: "#1C1E26",
      alignItems: "center",
      justifyContent: "center",
    },
    dots: {
      position: "absolute",
      bottom: 12,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "center",
      gap: 5,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: "rgba(255,255,255,0.5)",
    },
    dotActive: { width: 18, backgroundColor: "#fff" },
    imageBadges: { position: "absolute", top: 16, right: 16, gap: 6 },
    typeBadge: {
      backgroundColor: "rgba(0,0,0,0.55)",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    typeBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
    modeBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
    modeBadgeText: {
      color: "#fff",
      fontSize: 11,
      fontWeight: "700",
      textTransform: "capitalize",
    },
    body: { padding: 20, backgroundColor: t.background },
    titleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 16,
      gap: 12,
    },
    title: { fontSize: 22, fontWeight: "800", color: t.text, lineHeight: 28 },
    locRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 6,
    },
    locText: { fontSize: 13, color: t.textMuted, flex: 1 },
    priceWrap: { alignItems: "flex-end" },
    price: { fontSize: 22, fontWeight: "800", color: t.primary },
    priceSub: { fontSize: 11, color: t.textMuted, fontWeight: "600" },
    statsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 20,
    },
    coinChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 20,
    },
    coinChipText: { fontSize: 13, fontWeight: "700" },
    coinChipBalance: { fontSize: 12 },
    unlockedBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      borderRadius: 8,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    unlockedBadgeText: { color: "#fff", fontSize: 9, fontWeight: "800" },
    desc: { fontSize: 14, color: t.textMuted, lineHeight: 22 },
    detailsGrid: { gap: 0 },
    contactCard: {
      backgroundColor: t.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.border,
      overflow: "hidden",
    },
    contactRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 16,
    },
    contactValue: { flex: 1, fontSize: 15, fontWeight: "600", color: t.text },
    callBtn: {
      backgroundColor: t.primary,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 7,
    },
    callBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
    lockCard: {
      backgroundColor: t.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: t.border,
      padding: 24,
      alignItems: "center",
      gap: 10,
    },
    lockTitle: { fontSize: 17, fontWeight: "800", color: t.text },
    lockSub: { fontSize: 13, color: t.textMuted, textAlign: "center" },
    coinCostBox: {
      width: "100%",
      borderRadius: 14,
      borderWidth: 1,
      padding: 14,
      gap: 10,
      marginVertical: 4,
    },
    coinCostRow: { flexDirection: "row", alignItems: "center", gap: 8 },
    coinCostValue: { fontSize: 20, fontWeight: "800" },
    coinCostLabel: { fontSize: 12, fontWeight: "500" },
    coinDivider: { height: 1, backgroundColor: t.border },
    shortfallChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
      marginTop: 2,
    },
    shortfallText: { fontSize: 12, fontWeight: "700" },
    unlockBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      width: "100%",
      borderRadius: 14,
      paddingVertical: 14,
      marginTop: 4,
    },
    unlockBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
    buyCoinsBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderWidth: 1.5,
      borderRadius: 12,
      paddingHorizontal: 18,
      paddingVertical: 10,
    },
    buyCoinsText: { fontSize: 13, fontWeight: "700" },
    chatBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderWidth: 1.5,
      borderColor: t.primary,
      borderRadius: 14,
      paddingVertical: 14,
      marginTop: 8,
    },
    chatBtnText: { color: t.primary, fontWeight: "700", fontSize: 14 },
  });
}
