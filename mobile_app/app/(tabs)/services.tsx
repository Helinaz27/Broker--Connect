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

const SERVICE_TYPES = [
  "all",
  "cleaning",
  "repair",
  "plumbing",
  "electrical",
  "painting",
  "moving",
  "gardening",
  "security",
  "catering",
  "other",
];

export default function ServicesScreen() {
  const t = useTheme();
  const s = makeStyles(t);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [serviceType, setServiceType] = useState("all");
  const [page, setPage] = useState(1);
  const [applied, setApplied] = useState({
    search: "",
    city: "",
    serviceType: "all",
  });
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useSearchListingsQuery({
    listingType: "service",
    page,
    limit: 10,
    ...(applied.search && { search: applied.search }),
    ...(applied.city && { city: applied.city }),
    ...(applied.serviceType !== "all" && { serviceType: applied.serviceType }),
  });

  const listings = data?.data?.listings ?? [];
  const total = data?.data?.pagination?.total ?? 0;
  const totalPages = data?.data?.pagination?.pages ?? 1;

  const applyFilters = () => {
    setApplied({ search, city, serviceType });
    setPage(1);
  };
  const reset = () => {
    setSearch("");
    setCity("");
    setServiceType("all");
    setApplied({ search: "", city: "", serviceType: "all" });
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
              <Ionicons name="grid-outline" size={48} color={t.border} />
              <Text style={[s.emptyText, { color: t.textMuted }]}>
                No services found
              </Text>
            </View>
          ) : null
        }
        ListHeaderComponent={
          <>
            <View style={s.header}>
              <Text style={[s.headerTitle, { color: t.text }]}>Services</Text>
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
                  placeholder="Search services..."
                  placeholderTextColor={t.textMuted}
                  value={search}
                  onChangeText={setSearch}
                  onSubmitEditing={applyFilters}
                  returnKeyType="search"
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
                  onSubmitEditing={applyFilters}
                  returnKeyType="search"
                />
              </View>
              <Text style={[s.filterLabel, { color: t.textMuted }]}>
                Service Type
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {SERVICE_TYPES.map((st) => (
                  <TouchableOpacity
                    key={st}
                    style={[
                      s.chip,
                      {
                        borderColor: serviceType === st ? t.primary : t.border,
                        backgroundColor:
                          serviceType === st ? t.primary : t.background,
                      },
                    ]}
                    onPress={() => setServiceType(st)}
                  >
                    <Text
                      style={[
                        s.chipText,
                        { color: serviceType === st ? "#fff" : t.textMuted },
                      ]}
                    >
                      {st === "all"
                        ? "All Types"
                        : st.charAt(0).toUpperCase() + st.slice(1)}
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
            category="service"
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
      gap: 8,
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
    empty: { alignItems: "center", paddingTop: 60, gap: 12 },
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
