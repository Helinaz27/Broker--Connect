// app/dashboard/my-listings.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  useGetMyListingsQuery,
  useUpdateListingStatusMutation,
  ListingStatus,
} from "../../store/apis/listingsApi";
import { useTheme } from "../../hooks/useTheme";

const STATUS_OPTIONS: { value: ListingStatus; label: string; color: string }[] =
  [
    { value: "active", label: "Active", color: "#22C55E" },
    { value: "inactive", label: "Inactive", color: "#F59E0B" },
    { value: "occupied", label: "Occupied", color: "#6366F1" },
    { value: "sold", label: "Sold", color: "#94A3B8" },
  ];

const TYPE_ICON: Record<string, string> = {
  house: "home-outline",
  car: "car-outline",
  service: "construct-outline",
};

export default function MyListingsScreen() {
  const t = useTheme();
  const s = makeStyles(t);
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "house" | "car" | "service">(
    "all",
  );
  const [statusTarget, setStatusTarget] = useState<{
    id: string;
    current: ListingStatus;
  } | null>(null);

  const { data, isLoading, refetch } = useGetMyListingsQuery();
  const [updateStatus, { isLoading: updating }] =
    useUpdateListingStatusMutation();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const listings = (data?.data?.listings ?? []).filter(
    (l) => filter === "all" || l.listingType === filter,
  );

  const handleStatusChange = (id: string, newStatus: ListingStatus) => {
    Alert.alert("Change Status", `Set listing to "${newStatus}"?`, [
      { text: "Cancel", style: "cancel", onPress: () => setStatusTarget(null) },
      {
        text: "Confirm",
        onPress: async () => {
          try {
            await updateStatus({ id, status: newStatus }).unwrap();
            setStatusTarget(null);
            refetch();
          } catch (e: any) {
            Alert.alert(
              "Error",
              e?.data?.message ?? "Could not update status.",
            );
          }
        },
      },
    ]);
  };

  const statusInfo = (status: string) =>
    STATUS_OPTIONS.find((s) => s.value === status) ?? {
      color: "#94A3B8",
      label: status,
    };

  return (
    <View style={s.root}>
      {/* Filter tabs */}
      <View style={s.filterRow}>
        {(["all", "house", "car", "service"] as const).map((f) => (
          <TouchableOpacity
            key={f}
            style={[s.filterTab, filter === f && s.filterTabActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[s.filterText, filter === f && s.filterTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator color={t.primary} style={{ marginTop: 40 }} />
      ) : listings.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="list-outline" size={48} color={t.textMuted} />
          <Text style={s.emptyText}>No listings yet</Text>
          <TouchableOpacity
            style={[s.postBtn, { backgroundColor: t.primary }]}
            onPress={() => router.push("/dashboard/create-house" as any)}
          >
            <Text style={s.postBtnText}>Post Your First Listing</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(l) => l.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={t.primary}
            />
          }
          renderItem={({ item: l }) => {
            const st = statusInfo(l.status);
            const icon = TYPE_ICON[l.listingType] ?? "grid-outline";
            return (
              <View style={s.card}>
                {/* Thumbnail */}
                <View style={s.thumb}>
                  {l.images?.[0] ? (
                    <Image
                      source={{ uri: l.images[0] }}
                      style={StyleSheet.absoluteFill}
                      resizeMode="cover"
                    />
                  ) : (
                    <Ionicons name={icon as any} size={22} color={t.primary} />
                  )}
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <Text style={s.cardTitle} numberOfLines={1}>
                    {l.title}
                  </Text>
                  <Text style={s.cardCity} numberOfLines={1}>
                    {l.location?.city ?? "—"}
                  </Text>
                  <View style={s.cardMeta}>
                    <Text style={s.cardPrice}>
                      {l.price.toLocaleString()} Br
                    </Text>
                    <View
                      style={[
                        s.statusBadge,
                        {
                          backgroundColor: `${st.color}15`,
                          borderColor: `${st.color}30`,
                        },
                      ]}
                    >
                      <View
                        style={[s.statusDot, { backgroundColor: st.color }]}
                      />
                      <Text style={[s.statusText, { color: st.color }]}>
                        {st.label}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Actions */}
                <View style={s.actions}>
                  <TouchableOpacity
                    style={s.actionBtn}
                    onPress={() =>
                      setStatusTarget({
                        id: l.id,
                        current: l.status as ListingStatus,
                      })
                    }
                  >
                    <Ionicons
                      name="refresh-circle-outline"
                      size={22}
                      color={t.primary}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Status picker bottom sheet */}
      {statusTarget && (
        <View style={s.statusOverlay}>
          <TouchableOpacity
            style={s.statusBackdrop}
            onPress={() => setStatusTarget(null)}
          />
          <View style={[s.statusSheet, { backgroundColor: t.card }]}>
            <Text style={[s.statusSheetTitle, { color: t.text }]}>
              Change Status
            </Text>
            {STATUS_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  s.statusOption,
                  statusTarget.current === opt.value && {
                    backgroundColor: `${opt.color}12`,
                  },
                ]}
                onPress={() => handleStatusChange(statusTarget.id, opt.value)}
                disabled={updating}
              >
                <View
                  style={[
                    s.statusDot,
                    {
                      backgroundColor: opt.color,
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                    },
                  ]}
                />
                <Text style={[s.statusOptionText, { color: opt.color }]}>
                  {opt.label}
                </Text>
                {statusTarget.current === opt.value && (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={opt.color}
                    style={{ marginLeft: "auto" }}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function makeStyles(t: any) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: t.background },
    filterRow: {
      flexDirection: "row",
      padding: 12,
      gap: 8,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
      backgroundColor: t.card,
    },
    filterTab: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 10,
      alignItems: "center",
      backgroundColor: t.inputBg,
    },
    filterTabActive: { backgroundColor: t.primary },
    filterText: { fontSize: 12, fontWeight: "600", color: t.textMuted },
    filterTextActive: { color: "#fff", fontWeight: "700" },
    empty: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      padding: 40,
    },
    emptyText: { fontSize: 16, color: t.textMuted, fontWeight: "600" },
    postBtn: { borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
    postBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: t.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.border,
      padding: 12,
    },
    thumb: {
      width: 56,
      height: 56,
      borderRadius: 12,
      backgroundColor: `${t.primary}10`,
      overflow: "hidden",
      alignItems: "center",
      justifyContent: "center",
    },
    cardTitle: { fontSize: 14, fontWeight: "700", color: t.text },
    cardCity: { fontSize: 12, color: t.textMuted, marginTop: 2 },
    cardMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 6,
    },
    cardPrice: { fontSize: 13, fontWeight: "700", color: t.primary },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderRadius: 8,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderWidth: 1,
    },
    statusDot: { width: 5, height: 5, borderRadius: 3 },
    statusText: {
      fontSize: 10,
      fontWeight: "700",
      textTransform: "capitalize",
    },
    actions: { gap: 6 },
    actionBtn: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: `${t.primary}10`,
      alignItems: "center",
      justifyContent: "center",
    },
    statusOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    statusBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.45)",
    },
    statusSheet: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      gap: 4,
    },
    statusSheetTitle: { fontSize: 16, fontWeight: "800", marginBottom: 8 },
    statusOption: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      padding: 14,
      borderRadius: 12,
    },
    statusOptionText: { fontSize: 15, fontWeight: "600" },
  });
}
