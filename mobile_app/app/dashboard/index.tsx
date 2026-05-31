// app/dashboard/index.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { useGetMyListingsQuery } from "../../store/apis/listingsApi";
import { useGetCoinBalanceQuery } from "../../store/apis/paymentApi";
import { useTheme } from "../../hooks/useTheme";

const STATUS_COLOR: Record<string, string> = {
  active: "#22C55E",
  inactive: "#F59E0B",
  occupied: "#6366F1",
  sold: "#94A3B8",
};

export default function DashboardHome() {
  const t = useTheme();
  const s = makeStyles(t);
  const router = useRouter();
  const currentUser = useSelector((st: RootState) => st.user.currentUser);
  const isAdmin = currentUser?.roles?.includes("admin") ?? false;

  const { data: listingsData, isLoading, refetch } = useGetMyListingsQuery();
  const { data: balanceData, refetch: refetchBalance } =
    useGetCoinBalanceQuery(undefined);
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchBalance()]);
    setRefreshing(false);
  };

  const listings = listingsData?.data?.listings ?? [];
  const coins = balanceData?.data?.coins ?? currentUser?.coins ?? 0;

  const total = listings.length;
  const active = listings.filter((l) => l.status === "active").length;
  const houses = listings.filter((l) => l.listingType === "house").length;
  const cars = listings.filter((l) => l.listingType === "car").length;
  const services = listings.filter((l) => l.listingType === "service").length;

  const recent = listings.slice(0, 5);

  const STATS = [
    { label: "Total", value: total, icon: "list-outline", color: t.primary },
    {
      label: "Active",
      value: active,
      icon: "checkmark-circle-outline",
      color: "#22C55E",
    },
    { label: "Houses", value: houses, icon: "home-outline", color: "#6366F1" },
    { label: "Cars", value: cars, icon: "car-outline", color: "#0EA5E9" },
    {
      label: "Services",
      value: services,
      icon: "construct-outline",
      color: "#F59E0B",
    },
  ];

  const QUICK_ACTIONS = [
    {
      label: "Post House",
      icon: "home-outline",
      route: "/dashboard/create-house",
      color: "#6366F1",
    },
    {
      label: "Post Car",
      icon: "car-outline",
      route: "/dashboard/create-car",
      color: "#0EA5E9",
    },
    {
      label: "Post Service",
      icon: "construct-outline",
      route: "/dashboard/create-service",
      color: "#F59E0B",
    },
    {
      label: "My Listings",
      icon: "list-outline",
      route: "/dashboard/my-listings",
      color: t.primary,
    },
  ];

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={t.primary}
        />
      }
    >
      {/* Welcome banner */}
      <View style={s.banner}>
        <View>
          <Text style={s.bannerGreet}>Welcome back 👋</Text>
          <Text style={s.bannerName}>
            {currentUser?.firstName} {currentUser?.lastName}
          </Text>
          {isAdmin && (
            <View style={s.adminChip}>
              <Ionicons name="shield-checkmark" size={11} color="#fff" />
              <Text style={s.adminChipText}>Admin</Text>
            </View>
          )}
        </View>
        <View style={s.coinsBadge}>
          <Ionicons name="logo-bitcoin" size={16} color={t.primary} />
          <Text style={s.coinsValue}>{coins.toLocaleString()}</Text>
          <Text style={s.coinsUnit}>coins</Text>
        </View>
      </View>

      {/* Stats row */}
      {isLoading ? (
        <ActivityIndicator color={t.primary} style={{ marginVertical: 24 }} />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.statsScroll}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 10 }}
        >
          {STATS.map((st) => (
            <View
              key={st.label}
              style={[s.statCard, { borderColor: `${st.color}30` }]}
            >
              <View style={[s.statIcon, { backgroundColor: `${st.color}15` }]}>
                <Ionicons name={st.icon as any} size={18} color={st.color} />
              </View>
              <Text style={[s.statValue, { color: st.color }]}>{st.value}</Text>
              <Text style={s.statLabel}>{st.label}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Quick actions */}
      <Text style={s.sectionTitle}>Quick Actions</Text>
      <View style={s.actionsGrid}>
        {QUICK_ACTIONS.map((a) => (
          <TouchableOpacity
            key={a.label}
            style={[s.actionCard, { borderColor: `${a.color}25` }]}
            onPress={() => router.push(a.route as any)}
          >
            <View style={[s.actionIcon, { backgroundColor: `${a.color}15` }]}>
              <Ionicons name={a.icon as any} size={22} color={a.color} />
            </View>
            <Text style={s.actionLabel}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Admin quick links */}
      {isAdmin && (
        <>
          <Text style={s.sectionTitle}>Admin Console</Text>
          <View style={s.adminRow}>
            {[
              {
                label: "KYC Requests",
                icon: "shield-outline",
                route: "/dashboard/admin-kyc",
                color: "#F59E0B",
              },
              {
                label: "Users",
                icon: "people-outline",
                route: "/dashboard/admin-users",
                color: "#6366F1",
              },
              {
                label: "Fees",
                icon: "cash-outline",
                route: "/dashboard/admin-fees",
                color: "#22C55E",
              },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                style={[s.adminCard, { borderColor: `${item.color}25` }]}
                onPress={() => router.push(item.route as any)}
              >
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={item.color}
                />
                <Text style={[s.adminCardText, { color: item.color }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {/* Recent listings */}
      {recent.length > 0 && (
        <>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>Recent Listings</Text>
            <TouchableOpacity
              onPress={() => router.push("/dashboard/my-listings" as any)}
            >
              <Text style={[s.seeAll, { color: t.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={s.listingsCard}>
            {recent.map((l, i) => {
              const icon =
                l.listingType === "house"
                  ? "home-outline"
                  : l.listingType === "car"
                    ? "car-outline"
                    : "construct-outline";
              const statusColor = STATUS_COLOR[l.status] ?? t.textMuted;
              return (
                <TouchableOpacity
                  key={l.id}
                  style={[
                    s.listingRow,
                    i < recent.length - 1 && s.listingBorder,
                  ]}
                  onPress={() => router.push(`/dashboard/my-listings` as any)}
                >
                  <View
                    style={[
                      s.listingThumb,
                      { backgroundColor: `${t.primary}10` },
                    ]}
                  >
                    {l.images?.[0] ? (
                      <Image
                        source={{ uri: l.images[0] }}
                        style={StyleSheet.absoluteFill}
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons
                        name={icon as any}
                        size={18}
                        color={t.primary}
                      />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.listingTitle} numberOfLines={1}>
                      {l.title}
                    </Text>
                    <Text style={s.listingLocation} numberOfLines={1}>
                      {l.location?.city ?? "—"}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <Text style={s.listingPrice}>
                      {l.price.toLocaleString()} Br
                    </Text>
                    <View
                      style={[
                        s.statusDot,
                        {
                          backgroundColor: `${statusColor}20`,
                          borderColor: `${statusColor}40`,
                        },
                      ]}
                    >
                      <View style={[s.dot, { backgroundColor: statusColor }]} />
                      <Text style={[s.statusText, { color: statusColor }]}>
                        {l.status}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function makeStyles(t: any) {
  return StyleSheet.create({
    scroll: { flex: 1, backgroundColor: t.background },
    content: { paddingBottom: 40 },

    banner: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      margin: 20,
      padding: 20,
      borderRadius: 20,
      backgroundColor: t.card,
      borderWidth: 1,
      borderColor: t.border,
    },
    bannerGreet: { fontSize: 12, color: t.textMuted, fontWeight: "600" },
    bannerName: {
      fontSize: 20,
      fontWeight: "800",
      color: t.text,
      marginTop: 2,
    },
    adminChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      backgroundColor: t.primary,
      borderRadius: 8,
      paddingHorizontal: 7,
      paddingVertical: 3,
      marginTop: 6,
      alignSelf: "flex-start",
    },
    adminChipText: {
      color: "#fff",
      fontSize: 9,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    coinsBadge: {
      alignItems: "center",
      gap: 2,
      backgroundColor: `${t.primary}10`,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: `${t.primary}20`,
    },
    coinsValue: { fontSize: 22, fontWeight: "800", color: t.primary },
    coinsUnit: { fontSize: 10, color: t.textMuted, fontWeight: "600" },

    statsScroll: { marginBottom: 8 },
    statCard: {
      width: 90,
      alignItems: "center",
      padding: 14,
      borderRadius: 16,
      backgroundColor: t.card,
      borderWidth: 1,
      gap: 6,
    },
    statIcon: {
      width: 38,
      height: 38,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    statValue: { fontSize: 22, fontWeight: "800" },
    statLabel: { fontSize: 10, color: t.textMuted, fontWeight: "600" },

    sectionTitle: {
      fontSize: 13,
      fontWeight: "800",
      color: t.textMuted,
      textTransform: "uppercase",
      letterSpacing: 1,
      marginHorizontal: 20,
      marginTop: 24,
      marginBottom: 12,
    },
    sectionRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginHorizontal: 20,
      marginTop: 24,
      marginBottom: 12,
    },
    seeAll: { fontSize: 13, fontWeight: "700" },

    actionsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginHorizontal: 20,
      gap: 10,
    },
    actionCard: {
      width: "47%",
      padding: 16,
      borderRadius: 16,
      backgroundColor: t.card,
      borderWidth: 1,
      alignItems: "center",
      gap: 10,
    },
    actionIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    actionLabel: {
      fontSize: 13,
      fontWeight: "700",
      color: t.text,
      textAlign: "center",
    },

    adminRow: { flexDirection: "row", marginHorizontal: 20, gap: 10 },
    adminCard: {
      flex: 1,
      padding: 14,
      borderRadius: 14,
      backgroundColor: t.card,
      borderWidth: 1,
      alignItems: "center",
      gap: 8,
    },
    adminCardText: { fontSize: 11, fontWeight: "700", textAlign: "center" },

    listingsCard: {
      marginHorizontal: 20,
      backgroundColor: t.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.border,
      overflow: "hidden",
    },
    listingRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      gap: 12,
    },
    listingBorder: { borderBottomWidth: 1, borderBottomColor: t.border },
    listingThumb: {
      width: 44,
      height: 44,
      borderRadius: 10,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
    },
    listingTitle: { fontSize: 14, fontWeight: "600", color: t.text },
    listingLocation: { fontSize: 11, color: t.textMuted, marginTop: 2 },
    listingPrice: { fontSize: 13, fontWeight: "700", color: t.text },
    statusDot: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderRadius: 10,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderWidth: 1,
    },
    dot: { width: 5, height: 5, borderRadius: 3 },
    statusText: {
      fontSize: 10,
      fontWeight: "700",
      textTransform: "capitalize",
    },
  });
}
