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

const CAR_TYPES = ["all", "electric", "fuel"] as const;
const CONDITIONS = ["all", "new", "used"] as const;
const MODES = ["all", "rent", "sell"] as const;

export default function CarsScreen() {
  const t = useTheme();
  const s = makeStyles(t);
  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [brand, setBrand] = useState("");
  const [carType, setCarType] = useState<string>("all");
  const [condition, setCondition] = useState<string>("all");
  const [mode, setMode] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [applied, setApplied] = useState({
    search: "",
    city: "",
    brand: "",
    carType: "all",
    condition: "all",
    mode: "all",
  });
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useSearchListingsQuery({
    listingType: "car",
    page,
    limit: 10,
    ...(applied.search && { search: applied.search }),
    ...(applied.city && { city: applied.city }),
    ...(applied.brand && { brand: applied.brand }),
    ...(applied.carType !== "all" && { carType: applied.carType }),
    ...(applied.condition !== "all" && { condition: applied.condition }),
    ...(applied.mode !== "all" && { listingMode: applied.mode as any }),
  });

  const listings = data?.data?.listings ?? [];
  const total = data?.data?.pagination?.total ?? 0;
  const totalPages = data?.data?.pagination?.pages ?? 1;

  const applyFilters = () => {
    setApplied({ search, city, brand, carType, condition, mode });
    setPage(1);
  };
  const reset = () => {
    setSearch("");
    setCity("");
    setBrand("");
    setCarType("all");
    setCondition("all");
    setMode("all");
    setApplied({
      search: "",
      city: "",
      brand: "",
      carType: "all",
      condition: "all",
      mode: "all",
    });
    setPage(1);
  };
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const Chips = ({
    label,
    items,
    value,
    onChange,
  }: {
    label: string;
    items: readonly string[];
    value: string;
    onChange: (v: string) => void;
  }) => (
    <>
      <Text style={[s.filterLabel, { color: t.textMuted }]}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {items.map((i) => (
          <TouchableOpacity
            key={i}
            style={[
              s.chip,
              {
                borderColor: value === i ? t.primary : t.border,
                backgroundColor: value === i ? t.primary : t.background,
              },
            ]}
            onPress={() => onChange(i)}
          >
            <Text
              style={[
                s.chipText,
                { color: value === i ? "#fff" : t.textMuted },
              ]}
            >
              {i === "all" ? "All" : i.charAt(0).toUpperCase() + i.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );

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
              <Ionicons name="car-outline" size={48} color={t.border} />
              <Text style={[s.emptyText, { color: t.textMuted }]}>
                No cars found
              </Text>
            </View>
          ) : null
        }
        ListHeaderComponent={
          <>
            <View style={s.header}>
              <Text style={[s.headerTitle, { color: t.text }]}>Cars</Text>
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
                  placeholder="Search cars..."
                  placeholderTextColor={t.textMuted}
                  value={search}
                  onChangeText={setSearch}
                  onSubmitEditing={applyFilters}
                  returnKeyType="search"
                />
              </View>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <View
                  style={[
                    s.inputRow,
                    {
                      flex: 1,
                      backgroundColor: t.inputBg,
                      borderColor: t.border,
                    },
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
                <View
                  style={[
                    s.inputRow,
                    {
                      flex: 1,
                      backgroundColor: t.inputBg,
                      borderColor: t.border,
                    },
                  ]}
                >
                  <Ionicons name="car-outline" size={17} color={t.textMuted} />
                  <TextInput
                    style={[s.input, { color: t.text }]}
                    placeholder="Brand..."
                    placeholderTextColor={t.textMuted}
                    value={brand}
                    onChangeText={setBrand}
                    returnKeyType="search"
                    onSubmitEditing={applyFilters}
                  />
                </View>
              </View>
              <Chips
                label="Car Type"
                items={CAR_TYPES}
                value={carType}
                onChange={setCarType}
              />
              <Chips
                label="Condition"
                items={CONDITIONS}
                value={condition}
                onChange={setCondition}
              />
              <Chips
                label="Mode"
                items={MODES}
                value={mode}
                onChange={setMode}
              />
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
            category="car"
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
