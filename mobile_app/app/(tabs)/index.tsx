import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { useSearchListingsQuery } from "../../store/apis/listingsApi";
import ListingCard from "../../components/ListingCard";
import { useTheme } from "../../hooks/useTheme";
import { RootState } from "../../store/store";

const CATEGORIES = ["all", "house", "car", "service"] as const;
type Cat = (typeof CATEGORIES)[number];

export default function HomeScreen() {
  const t = useTheme();
  const s = makeStyles(t);
  const router = useRouter();
  const currentUser = useSelector((st: RootState) => st.user.currentUser);

  const [search, setSearch] = useState("");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState<Cat>("all");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedCity, setAppliedCity] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const applySearch = useCallback(() => {
    setAppliedSearch(search);
    setAppliedCity(city);
  }, [search, city]);
  const reset = () => {
    setSearch("");
    setCity("");
    setCategory("all");
    setAppliedSearch("");
    setAppliedCity("");
  };

  const base = {
    limit: 6,
    page: 1,
    ...(appliedSearch && { search: appliedSearch }),
    ...(appliedCity && { city: appliedCity }),
  };
  const showH = category === "all" || category === "house";
  const showC = category === "all" || category === "car";
  const showS = category === "all" || category === "service";

  const {
    data: hD,
    isLoading: hL,
    refetch: hR,
  } = useSearchListingsQuery(
    { ...base, listingType: "house" },
    { skip: !showH },
  );
  const {
    data: cD,
    isLoading: cL,
    refetch: cR,
  } = useSearchListingsQuery({ ...base, listingType: "car" }, { skip: !showC });
  const {
    data: sD,
    isLoading: sL,
    refetch: sR,
  } = useSearchListingsQuery(
    { ...base, listingType: "service" },
    { skip: !showS },
  );

  const houses = hD?.data?.listings ?? [];
  const cars = cD?.data?.listings ?? [];
  const services = sD?.data?.listings ?? [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([hR(), cR(), sR()]);
    setRefreshing(false);
  }, [hR, cR, sR]);

  const firstName = currentUser?.firstName;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={t.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={s.header}>
          <View style={s.headerTop}>
            <View>
              <Text style={[s.appName, { color: t.primary }]}>
                DigitalBroker
              </Text>
              <Text style={[s.headline, { color: t.text }]}>
                {firstName
                  ? `Hello, ${firstName} 👋`
                  : "Find Your Perfect Match"}
              </Text>
              <Text style={[s.subline, { color: t.textMuted }]}>
                Browse houses, cars & services.
              </Text>
            </View>
            <TouchableOpacity
              style={[
                s.notifBtn,
                { backgroundColor: t.card, borderColor: t.border },
              ]}
              onPress={() => router.push("/notifications" as any)}
            >
              <Ionicons name="notifications-outline" size={22} color={t.text} />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[
            s.searchBox,
            { backgroundColor: t.card, borderColor: t.border },
          ]}
        >
          <View
            style={[
              s.searchRow,
              { backgroundColor: t.inputBg, borderColor: t.border },
            ]}
          >
            <Ionicons name="search-outline" size={18} color={t.textMuted} />
            <TextInput
              style={[s.searchInput, { color: t.text }]}
              placeholder="Search listings..."
              placeholderTextColor={t.textMuted}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={applySearch}
              returnKeyType="search"
            />
          </View>
          <View
            style={[
              s.searchRow,
              { backgroundColor: t.inputBg, borderColor: t.border },
            ]}
          >
            <Ionicons name="location-outline" size={18} color={t.textMuted} />
            <TextInput
              style={[s.searchInput, { color: t.text }]}
              placeholder="City (e.g. Addis Ababa)"
              placeholderTextColor={t.textMuted}
              value={city}
              onChangeText={setCity}
              onSubmitEditing={applySearch}
              returnKeyType="search"
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  s.pill,
                  {
                    borderColor: category === c ? t.primary : t.border,
                    backgroundColor: category === c ? t.primary : t.background,
                  },
                ]}
                onPress={() => setCategory(c)}
              >
                <Text
                  style={[
                    s.pillText,
                    { color: category === c ? "#fff" : t.textMuted },
                  ]}
                >
                  {c === "all"
                    ? "All"
                    : c === "house"
                      ? "Houses"
                      : c === "car"
                        ? "Cars"
                        : "Services"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={s.btnRow}>
            <TouchableOpacity
              style={[s.searchBtn, { backgroundColor: t.primary }]}
              onPress={applySearch}
            >
              <Ionicons name="search" size={15} color="#fff" />
              <Text style={s.searchBtnText}>Search</Text>
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.quickNav}
        >
          {[
            { icon: "chatbubbles-outline", label: "Messages", route: "/chat" },
            {
              icon: "notifications-outline",
              label: "Alerts",
              route: "/notifications",
            },
            { icon: "logo-bitcoin", label: "Coins", route: "/(tabs)/coins" },
            { icon: "shield-checkmark-outline", label: "KYC", route: "/kyc" },
            {
              icon: "list-outline",
              label: "Unlocked",
              route: "/unlocked-listings",
            },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              style={s.quickItem}
              onPress={() => router.push(item.route as any)}
            >
              <View
                style={[
                  s.quickIcon,
                  {
                    backgroundColor: `${t.primary}12`,
                    borderColor: `${t.primary}25`,
                  },
                ]}
              >
                <Ionicons name={item.icon as any} size={22} color={t.primary} />
              </View>
              <Text style={[s.quickLabel, { color: t.textMuted }]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {showH && (
          <View style={s.section}>
            <View style={s.secHeader}>
              <View>
                <Text style={[s.secTitle, { color: t.text }]}>Houses</Text>
                {!hL && (
                  <Text style={[s.secCount, { color: t.textMuted }]}>
                    {hD?.data?.pagination?.total ?? 0} available
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => router.push("/(tabs)/houses")}>
                <Text style={[s.viewAll, { color: t.primary }]}>View All</Text>
              </TouchableOpacity>
            </View>
            {hL ? (
              <ActivityIndicator
                color={t.primary}
                style={{ marginVertical: 24 }}
              />
            ) : houses.length === 0 ? (
              <Text style={[s.emptyText, { color: t.textMuted }]}>
                No results found.
              </Text>
            ) : (
              <FlatList
                data={houses}
                keyExtractor={(i) => i.id}
                renderItem={({ item }) => (
                  <ListingCard
                    id={item.id}
                    title={item.title}
                    price={item.price}
                    location={item.location?.city ?? ""}
                    image={item.images?.[0] ?? ""}
                    category="house"
                    listingMode={item.listingMode}
                  />
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
              />
            )}
          </View>
        )}

        {showC && (
          <View style={s.section}>
            <View style={s.secHeader}>
              <View>
                <Text style={[s.secTitle, { color: t.text }]}>Cars</Text>
                {!cL && (
                  <Text style={[s.secCount, { color: t.textMuted }]}>
                    {cD?.data?.pagination?.total ?? 0} available
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => router.push("/(tabs)/cars")}>
                <Text style={[s.viewAll, { color: t.primary }]}>View All</Text>
              </TouchableOpacity>
            </View>
            {cL ? (
              <ActivityIndicator
                color={t.primary}
                style={{ marginVertical: 24 }}
              />
            ) : cars.length === 0 ? (
              <Text style={[s.emptyText, { color: t.textMuted }]}>
                No results found.
              </Text>
            ) : (
              <FlatList
                data={cars}
                keyExtractor={(i) => i.id}
                renderItem={({ item }) => (
                  <ListingCard
                    id={item.id}
                    title={item.title}
                    price={item.price}
                    location={item.location?.city ?? ""}
                    image={item.images?.[0] ?? ""}
                    category="car"
                    listingMode={item.listingMode}
                  />
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
              />
            )}
          </View>
        )}

        {showS && (
          <View style={s.section}>
            <View style={s.secHeader}>
              <View>
                <Text style={[s.secTitle, { color: t.text }]}>Services</Text>
                {!sL && (
                  <Text style={[s.secCount, { color: t.textMuted }]}>
                    {sD?.data?.pagination?.total ?? 0} available
                  </Text>
                )}
              </View>
              <TouchableOpacity onPress={() => router.push("/(tabs)/services")}>
                <Text style={[s.viewAll, { color: t.primary }]}>View All</Text>
              </TouchableOpacity>
            </View>
            {sL ? (
              <ActivityIndicator
                color={t.primary}
                style={{ marginVertical: 24 }}
              />
            ) : services.length === 0 ? (
              <Text style={[s.emptyText, { color: t.textMuted }]}>
                No results found.
              </Text>
            ) : (
              <FlatList
                data={services}
                keyExtractor={(i) => i.id}
                renderItem={({ item }) => (
                  <ListingCard
                    id={item.id}
                    title={item.title}
                    price={item.price}
                    location={item.location?.city ?? ""}
                    image={item.images?.[0] ?? ""}
                    category="service"
                    listingMode={item.listingMode}
                  />
                )}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20, gap: 14 }}
              />
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(t: any) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    header: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 16 },
    headerTop: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
    },
    appName: {
      fontSize: 12,
      fontWeight: "800",
      marginBottom: 4,
      letterSpacing: 0.5,
    },
    headline: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
    subline: { fontSize: 13 },
    notifBtn: {
      width: 42,
      height: 42,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 2,
    },
    searchBox: {
      marginHorizontal: 16,
      borderRadius: 18,
      padding: 14,
      borderWidth: 1,
      marginBottom: 20,
      gap: 10,
    },
    searchRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderRadius: 12,
      paddingHorizontal: 12,
      borderWidth: 1,
    },
    searchInput: { flex: 1, paddingVertical: 12, fontSize: 14 },
    pill: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 20,
      borderWidth: 1.5,
      marginRight: 8,
    },
    pillText: { fontSize: 13, fontWeight: "600" },
    btnRow: { flexDirection: "row", gap: 10 },
    searchBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 12,
      borderRadius: 12,
    },
    searchBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
    resetBtn: {
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
    },
    resetBtnText: { fontWeight: "600", fontSize: 14 },
    quickNav: { paddingHorizontal: 16, paddingBottom: 20, gap: 12 },
    quickItem: { alignItems: "center", gap: 6, width: 68 },
    quickIcon: {
      width: 50,
      height: 50,
      borderRadius: 15,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    quickLabel: { fontSize: 10, fontWeight: "600", textAlign: "center" },
    section: { marginBottom: 20 },
    secHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingHorizontal: 20,
      marginBottom: 14,
    },
    secTitle: { fontSize: 20, fontWeight: "800" },
    secCount: { fontSize: 12, marginTop: 2 },
    viewAll: { fontWeight: "700", fontSize: 14 },
    emptyText: { paddingHorizontal: 20, fontSize: 14 },
  });
}
