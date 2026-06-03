import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSearchListingsQuery } from "../../store/apis/listingsApi";
import ListingCard from "../../components/ListingCard";
import { useTheme } from "../../hooks/useTheme";

const HOUSE_TYPES = [
  "all",
  "apartment",
  "villa",
  "condominium",
  "business",
  "studio",
  "townhouse",
  "duplex",
  "others",
];
const MODES = ["all", "rent", "sell"] as const;

export default function HousesScreen() {
  const t = useTheme();
  const s = makeStyles(t);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [houseType, setHouseType] = useState("all");
  const [mode, setMode] = useState<(typeof MODES)[number]>("all");
  const [page, setPage] = useState(1);
  const [applied, setApplied] = useState({
    search: "",
    city: "",
    houseType: "all",
    mode: "all",
  });
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useSearchListingsQuery({
    listingType: "house",
    page,
    limit: 10,
    ...(applied.search && { search: applied.search }),
    ...(applied.city && { city: applied.city }),
    ...(applied.houseType !== "all" && { houseType: applied.houseType }),
    ...(applied.mode !== "all" && { listingMode: applied.mode as any }),
  });

  const listings = data?.data?.listings ?? [];
  const total = data?.data?.pagination?.total ?? 0;
  const totalPages = data?.data?.pagination?.pages ?? 1;

  const applyFilters = () => {
    setApplied({ search, city, houseType, mode });
    setPage(1);
  };
  const reset = () => {
    setSearch("");
    setCity("");
    setHouseType("all");
    setMode("all");
    setApplied({ search: "", city: "", houseType: "all", mode: "all" });
    setPage(1);
  };
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={s.safe}>
      <FlatList
        data={listings}
        keyExtractor={(i) => i.id}
        contentContainerStyle={s.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={t.primary}
          />
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={s.empty}>
              <Ionicons name="business-outline" size={48} color={t.border} />
              <Text style={[s.emptyText, { color: t.textMuted }]}>
                No houses found
              </Text>
            </View>
          ) : null
        }
        ListHeaderComponent={
          <>
            <View style={s.header}>
              <Text style={[s.headerTitle, { color: t.text }]}>Houses</Text>
              {!isLoading && (
                <Text style={[s.headerCount, { color: t.textMuted }]}>
                  {total} listings
                </Text>
              )}
            </View>
            <View
              style={[
                s.filterBox,
                { backgroundColor: t.card, borderColor: t.border },
              ]}
            >
              <View
                style={[
                  s.inputRow,
                  { backgroundColor: t.inputBg, borderColor: t.border },
                ]}
              >
                <Ionicons name="search-outline" size={17} color={t.textMuted} />
                <TextInput
                  style={[s.input, { color: t.text }]}
                  placeholder="Search houses..."
                  placeholderTextColor={t.textMuted}
                  value={search}
                  onChangeText={setSearch}
                  returnKeyType="search"
                  onSubmitEditing={applyFilters}
                />
              </View>
              <View
                style={[
                  s.inputRow,
                  { backgroundColor: t.inputBg, borderColor: t.border },
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={17}
                  color={t.textMuted}
                />
                <TextInput
                  style={[s.input, { color: t.text }]}
                  placeholder="City..."
                  placeholderTextColor={t.textMuted}
                  value={city}
                  onChangeText={setCity}
                  returnKeyType="search"
                  onSubmitEditing={applyFilters}
                />
              </View>
              <Text style={[s.filterLabel, { color: t.textMuted }]}>
                House Type
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {HOUSE_TYPES.map((h) => (
                  <TouchableOpacity
                    key={h}
                    style={[
                      s.chip,
                      {
                        borderColor: houseType === h ? t.primary : t.border,
                        backgroundColor:
                          houseType === h ? t.primary : t.background,
                      },
                    ]}
                    onPress={() => setHouseType(h)}
                  >
                    <Text
                      style={[
                        s.chipText,
                        { color: houseType === h ? "#fff" : t.textMuted },
                      ]}
                    >
                      {h === "all"
                        ? "All Types"
                        : h.charAt(0).toUpperCase() + h.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={[s.filterLabel, { color: t.textMuted }]}>
                Listing Mode
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {MODES.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[
                      s.chip,
                      {
                        borderColor: mode === m ? t.primary : t.border,
                        backgroundColor: mode === m ? t.primary : t.background,
                      },
                    ]}
                    onPress={() => setMode(m)}
                  >
                    <Text
                      style={[
                        s.chipText,
                        { color: mode === m ? "#fff" : t.textMuted },
                      ]}
                    >
                      {m === "all"
                        ? "All Modes"
                        : m.charAt(0).toUpperCase() + m.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={s.btnRow}>
                <TouchableOpacity
                  style={[s.applyBtn, { backgroundColor: t.primary }]}
                  onPress={applyFilters}
                >
                  <Ionicons name="search" size={14} color="#fff" />
                  <Text style={s.applyBtnText}>Search</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.resetBtn, { borderColor: t.border }]}
                  onPress={reset}
                >
                  <Text style={[s.resetBtnText, { color: t.textMuted }]}>
                    Reset
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            {isLoading && (
              <ActivityIndicator color={t.primary} style={{ marginTop: 40 }} />
            )}
          </>
        }
        renderItem={({ item }) => (
          <ListingCard
            id={item.id}
            title={item.title}
            price={item.price}
            location={item.location?.city ?? ""}
            image={item.images?.[0] ?? ""}
            category="house"
            listingMode={item.listingMode}
            fullWidth
          />
        )}
        ListFooterComponent={
          totalPages > 1 ? (
            <View style={s.pagination}>
              <TouchableOpacity
                style={[
                  s.pageBtn,
                  { borderColor: t.border, backgroundColor: t.card },
                  page === 1 && s.pageBtnDisabled,
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
                {page} / {totalPages}
              </Text>
              <TouchableOpacity
                style={[
                  s.pageBtn,
                  { borderColor: t.border, backgroundColor: t.card },
                  page === totalPages && s.pageBtnDisabled,
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
    </SafeAreaView>
  );
}

function makeStyles(t: any) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    header: {
      flexDirection: "row",
      alignItems: "baseline",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 18,
      paddingBottom: 10,
    },
    headerTitle: { fontSize: 26, fontWeight: "800" },
    headerCount: { fontSize: 13, fontWeight: "600" },
    filterBox: {
      marginHorizontal: 16,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      marginBottom: 16,
      gap: 10,
    },
    filterLabel: {
      fontSize: 10,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderRadius: 10,
      paddingHorizontal: 12,
      borderWidth: 1,
    },
    input: { flex: 1, paddingVertical: 11, fontSize: 14 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      borderWidth: 1.5,
      marginRight: 8,
    },
    chipText: { fontSize: 12, fontWeight: "600" },
    btnRow: { flexDirection: "row", gap: 10 },
    applyBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 11,
      borderRadius: 10,
    },
    applyBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
    resetBtn: {
      paddingHorizontal: 18,
      paddingVertical: 11,
      borderRadius: 10,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
    },
    resetBtnText: { fontWeight: "600", fontSize: 13 },
    list: { paddingHorizontal: 16, paddingBottom: 30 },
    empty: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 60,
      gap: 12,
    },
    emptyText: { fontSize: 16 },
    pagination: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 20,
      paddingVertical: 20,
    },
    pageBtn: {
      width: 40,
      height: 40,
      borderRadius: 10,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
    },
    pageBtnDisabled: { opacity: 0.4 },
    pageText: { fontSize: 14, fontWeight: "700" },
  });
}
