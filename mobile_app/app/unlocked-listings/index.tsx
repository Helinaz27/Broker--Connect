import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useGetMyAccessesQuery } from "../../store/apis/accessApi";
import { useInitiateChatMutation } from "../../store/apis/chatApi";
import { useTheme } from "../../hooks/useTheme";
import Toast from "react-native-toast-message";

export default function UnlockedListingsScreen() {
  const t = useTheme();
  const s = makeStyles(t);
  const router = useRouter();
  const token = useSelector((st: RootState) => st.user.token);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [initiateChat] = useInitiateChatMutation();

  const { data, isLoading, isError, refetch } = useGetMyAccessesQuery(
    { page, limit: 10 },
    { skip: !token },
  );
  const accesses = data?.data?.accesses ?? [];
  const pagination = data?.data?.pagination;
  const totalPages = pagination?.pages ?? 1;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleChat = async (listingId: string, ownerId: string) => {
    try {
      await initiateChat({ listingId, otherUserId: ownerId }).unwrap();
      router.push("/chat" as any);
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: e?.data?.message ?? "Could not open chat.",
      });
    }
  };

  const getPath = (type: string, id: string) => {
    const t = type?.toLowerCase();
    if (t === "house") return `/house-listings/${id}`;
    if (t === "car") return `/car-listings/${id}`;
    return `/service-listings/${id}`;
  };

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={t.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: t.text }]}>
          My Unlocked Listings
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator color={t.primary} style={{ marginTop: 48 }} />
      ) : isError ? (
        <View style={s.center}>
          <Ionicons name="alert-circle-outline" size={48} color={t.textMuted} />
          <Text style={[s.emptyTitle, { color: t.text }]}>Failed to load</Text>
          <TouchableOpacity
            style={[s.retryBtn, { borderColor: t.primary }]}
            onPress={() => refetch()}
          >
            <Text style={[s.retryBtnText, { color: t.primary }]}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : accesses.length === 0 ? (
        <View style={s.center}>
          <Ionicons name="home-outline" size={56} color={t.border} />
          <Text style={[s.emptyTitle, { color: t.text }]}>
            No unlocked listings yet
          </Text>
          <Text style={[s.emptySub, { color: t.textMuted }]}>
            Browse listings and unlock contact details to see them here.
          </Text>
          <TouchableOpacity
            style={[s.browsBtn, { backgroundColor: t.primary }]}
            onPress={() => router.push("/(tabs)/")}
          >
            <Ionicons name="search-outline" size={16} color="#fff" />
            <Text style={s.browsBtnText}>Browse Listings</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={accesses}
          keyExtractor={(a) => a.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={t.primary}
            />
          }
          renderItem={({ item: access }) => {
            const listing = access.listing;
            const cover = listing.images?.[0];
            const loc = listing.location;
            const locStr =
              typeof loc === "string"
                ? loc.split(",")[0]
                : ((loc as any)?.placeName ??
                  (loc as any)?.subCity ??
                  (loc as any)?.city ??
                  "");

            return (
              <TouchableOpacity
                style={[
                  s.card,
                  { backgroundColor: t.card, borderColor: t.border },
                ]}
                onPress={() =>
                  router.push(getPath(listing.listingType, listing.id) as any)
                }
                activeOpacity={0.88}
              >
                <View style={s.cardTop}>
                  {cover ? (
                    <Image
                      source={{ uri: cover }}
                      style={s.cardImg}
                      resizeMode="cover"
                    />
                  ) : (
                    <View
                      style={[
                        s.cardImgPlaceholder,
                        { backgroundColor: t.inputBg },
                      ]}
                    >
                      <Ionicons
                        name="home-outline"
                        size={22}
                        color={t.textMuted}
                      />
                    </View>
                  )}
                  <View style={s.cardInfo}>
                    <View
                      style={[
                        s.typeBadge,
                        { backgroundColor: `${t.primary}12` },
                      ]}
                    >
                      <Text style={[s.typeBadgeText, { color: t.primary }]}>
                        {listing.listingType}
                      </Text>
                    </View>
                    <Text
                      style={[s.cardTitle, { color: t.text }]}
                      numberOfLines={1}
                    >
                      {listing.title}
                    </Text>
                    <View style={s.locRow}>
                      <Ionicons
                        name="location-outline"
                        size={12}
                        color={t.primary}
                      />
                      <Text
                        style={[s.locText, { color: t.textMuted }]}
                        numberOfLines={1}
                      >
                        {locStr}
                      </Text>
                    </View>
                    <Text style={[s.cardPrice, { color: t.primary }]}>
                      {listing.price?.toLocaleString()} ETB
                    </Text>
                  </View>
                  <View
                    style={[
                      s.coinsPaidBadge,
                      { backgroundColor: `${t.primary}12` },
                    ]}
                  >
                    <Ionicons name="logo-bitcoin" size={11} color={t.primary} />
                    <Text style={[s.coinsPaidText, { color: t.primary }]}>
                      {access.coinsPaid}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    s.contactBox,
                    {
                      backgroundColor: `${t.success}08`,
                      borderColor: `${t.success}25`,
                    },
                  ]}
                >
                  <Text style={[s.contactLabel, { color: t.success }]}>
                    Unlocked Contact
                  </Text>
                  <View style={s.contactRow}>
                    <View style={s.contactField}>
                      <Ionicons
                        name="call-outline"
                        size={14}
                        color={t.success}
                      />
                      <Text style={[s.contactValue, { color: t.text }]}>
                        {listing.owner?.phone ?? "—"}
                      </Text>
                      <TouchableOpacity
                        style={s.iconBtn}
                        onPress={() =>
                          Linking.openURL(`tel:${listing.owner?.phone}`)
                        }
                      >
                        <Ionicons name="call" size={14} color={t.primary} />
                      </TouchableOpacity>
                    </View>
                    <View style={s.contactField}>
                      <Ionicons
                        name="mail-outline"
                        size={14}
                        color={t.success}
                      />
                      <Text
                        style={[s.contactValue, { color: t.text }]}
                        numberOfLines={1}
                      >
                        {listing.owner?.email ?? "—"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={s.cardFooter}>
                  <Text style={[s.dateText, { color: t.textMuted }]}>
                    {new Date(access.createdAt).toLocaleDateString()}
                  </Text>
                  <TouchableOpacity
                    style={[s.chatBtn, { borderColor: t.primary }]}
                    onPress={() => handleChat(listing.id, listing.owner?.id)}
                  >
                    <Ionicons
                      name="chatbubble-outline"
                      size={14}
                      color={t.primary}
                    />
                    <Text style={[s.chatBtnText, { color: t.primary }]}>
                      Chat
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={
            totalPages > 1 ? (
              <View style={s.pagination}>
                <TouchableOpacity
                  style={[
                    s.pageBtn,
                    { borderColor: t.border, backgroundColor: t.card },
                    page === 1 && { opacity: 0.4 },
                  ]}
                  disabled={page === 1}
                  onPress={() => setPage((p) => p - 1)}
                >
                  <Ionicons
                    name="chevron-back"
                    size={18}
                    color={page === 1 ? t.border : t.primary}
                  />
                </TouchableOpacity>
                <Text style={[s.pageText, { color: t.text }]}>
                  {page} / {totalPages} · {pagination?.total ?? 0} total
                </Text>
                <TouchableOpacity
                  style={[
                    s.pageBtn,
                    { borderColor: t.border, backgroundColor: t.card },
                    page === totalPages && { opacity: 0.4 },
                  ]}
                  disabled={page === totalPages}
                  onPress={() => setPage((p) => p + 1)}
                >
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={page === totalPages ? t.border : t.primary}
                  />
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ height: 24 }} />
            )
          }
        />
      )}
    </SafeAreaView>
  );
}

function makeStyles(t: any) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
    },
    backBtn: { marginRight: 10, padding: 2 },
    headerTitle: { fontSize: 20, fontWeight: "800" },
    center: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 32,
      gap: 12,
    },
    emptyTitle: { fontSize: 17, fontWeight: "700", textAlign: "center" },
    emptySub: { fontSize: 13, textAlign: "center", lineHeight: 20 },
    browsBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 14,
      marginTop: 8,
    },
    browsBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
    retryBtn: {
      borderWidth: 1.5,
      borderRadius: 12,
      paddingHorizontal: 20,
      paddingVertical: 10,
    },
    retryBtnText: { fontWeight: "700", fontSize: 14 },
    card: {
      borderRadius: 18,
      borderWidth: 1,
      marginBottom: 16,
      overflow: "hidden",
    },
    cardTop: {
      flexDirection: "row",
      padding: 14,
      gap: 12,
      alignItems: "flex-start",
    },
    cardImg: { width: 70, height: 70, borderRadius: 12 },
    cardImgPlaceholder: {
      width: 70,
      height: 70,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    cardInfo: { flex: 1, gap: 3 },
    typeBadge: {
      alignSelf: "flex-start",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    typeBadgeText: {
      fontSize: 9,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    cardTitle: { fontSize: 14, fontWeight: "700" },
    locRow: { flexDirection: "row", alignItems: "center", gap: 3 },
    locText: { fontSize: 11, flex: 1 },
    cardPrice: { fontSize: 15, fontWeight: "800" },
    coinsPaidBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    coinsPaidText: { fontSize: 11, fontWeight: "800" },
    contactBox: {
      marginHorizontal: 14,
      marginBottom: 10,
      borderRadius: 12,
      borderWidth: 1,
      padding: 12,
      gap: 8,
    },
    contactLabel: {
      fontSize: 9,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    contactRow: { gap: 6 },
    contactField: { flexDirection: "row", alignItems: "center", gap: 6 },
    contactValue: { flex: 1, fontSize: 13, fontWeight: "600" },
    iconBtn: { padding: 4 },
    cardFooter: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 14,
      paddingBottom: 12,
    },
    dateText: { fontSize: 11 },
    chatBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      borderWidth: 1.5,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    chatBtnText: { fontSize: 12, fontWeight: "700" },
    pagination: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 14,
      paddingVertical: 20,
    },
    pageBtn: {
      width: 38,
      height: 38,
      borderRadius: 10,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
    },
    pageText: { fontSize: 12, fontWeight: "600" },
  });
}
