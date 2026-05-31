import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, ActivityIndicator, FlatList, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { useSearchListingsQuery } from '../../store/apis/listingsApi';
import ListingCard from '../../components/ListingCard';
import { useTheme } from '../../hooks/useTheme';
import { RootState } from '../../store/store';

const CATEGORIES = ['all', 'house', 'car', 'service'] as const;
type Cat = typeof CATEGORIES[number];

export default function HomeScreen() {
  const t = useTheme();
  const s = makeStyles(t);
  const router = useRouter();
  const currentUser = useSelector((st: RootState) => st.user.currentUser);

  const [search, setSearch] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState<Cat>('all');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [appliedCity, setAppliedCity] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const applySearch = useCallback(() => { setAppliedSearch(search); setAppliedCity(city); }, [search, city]);
  const reset = () => { setSearch(''); setCity(''); setCategory('all'); setAppliedSearch(''); setAppliedCity(''); };

  const base = { limit: 8, page: 1, ...(appliedSearch && { search: appliedSearch }), ...(appliedCity && { city: appliedCity }) };
  const showH = category === 'all' || category === 'house';
  const showC = category === 'all' || category === 'car';
  const showS = category === 'all' || category === 'service';

  const { data: hD, isLoading: hL, refetch: hR } = useSearchListingsQuery({ ...base, listingType: 'house' }, { skip: !showH });
  const { data: cD, isLoading: cL, refetch: cR } = useSearchListingsQuery({ ...base, listingType: 'car' }, { skip: !showC });
  const { data: sD, isLoading: sL, refetch: sR } = useSearchListingsQuery({ ...base, listingType: 'service' }, { skip: !showS });

  const houses = hD?.data?.listings ?? [];
  const cars = cD?.data?.listings ?? [];
  const services = sD?.data?.listings ?? [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([hR(), cR(), sR()]);
    setRefreshing(false);
  }, [hR, cR, sR]);

  const toCard = (l: any, cat: 'house' | 'car' | 'service') => ({
    id: l.id, title: l.title, price: l.price,
    location: l.location?.fullAddress ?? l.location?.city ?? '',
    image: l.images?.[0] ?? '', category: cat, listingMode: l.listingMode,
  });

  const Section = ({ title, total, items, cat, loading, route }: any) => (
    <View style={s.section}>
      <View style={s.secHeader}>
        <View>
          <Text style={s.secTitle}>{title}</Text>
          {!loading && <Text style={s.secCount}>{total} available</Text>}
        </View>
        <TouchableOpacity onPress={() => router.push(route)}>
          <Text style={s.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <ActivityIndicator color={t.primary} style={{ marginVertical: 24 }} />
      ) : items.length === 0 ? (
        <Text style={s.emptyText}>No results found.</Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i: any) => i.id}
          renderItem={({ item }) => <ListingCard {...toCard(item, cat)} />}
          horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 20, paddingRight: 4 }}
        />
      )}
    </View>
  );

  const firstName = currentUser?.firstName;

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={t.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerTop}>
            <View>
              <Text style={s.appName}>DigitalBroker</Text>
              <Text style={s.headline}>{firstName ? `Hello, ${firstName} 👋` : 'Find Your Perfect Match'}</Text>
              <Text style={s.subline}>Browse houses, cars & services.</Text>
            </View>
            <TouchableOpacity style={s.notifBtn} onPress={() => router.push('/notifications' as any)}>
              <Ionicons name="notifications-outline" size={22} color={t.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search box */}
        <View style={s.searchBox}>
          <View style={s.searchRow}>
            <Ionicons name="search-outline" size={18} color={t.textMuted} />
            <TextInput
              style={s.searchInput}
              placeholder="Search listings..."
              placeholderTextColor={t.textMuted}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={applySearch}
              returnKeyType="search"
            />
          </View>
          <View style={s.searchRow}>
            <Ionicons name="location-outline" size={18} color={t.textMuted} />
            <TextInput
              style={s.searchInput}
              placeholder="City (e.g. Addis Ababa)"
              placeholderTextColor={t.textMuted}
              value={city}
              onChangeText={setCity}
              onSubmitEditing={applySearch}
              returnKeyType="search"
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {CATEGORIES.map(c => (
              <TouchableOpacity
                key={c}
                style={[s.pill, category === c && s.pillActive]}
                onPress={() => setCategory(c)}
              >
                <Text style={[s.pillText, category === c && s.pillTextActive]}>
                  {c === 'all' ? 'All' : c === 'house' ? 'Houses' : c === 'car' ? 'Cars' : 'Services'}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={s.btnRow}>
            <TouchableOpacity style={s.searchBtn} onPress={applySearch}>
              <Ionicons name="search" size={15} color="#fff" />
              <Text style={s.searchBtnText}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.resetBtn} onPress={reset}>
              <Text style={s.resetBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick nav */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.quickNav}>
          {[
            { icon: 'chatbubbles-outline', label: 'Messages', route: '/chat' },
            { icon: 'notifications-outline', label: 'Notifications', route: '/notifications' },
            { icon: 'logo-bitcoin', label: 'Coins', route: '/(tabs)/coins' },
            { icon: 'shield-checkmark-outline', label: 'KYC', route: '/kyc' },
          ].map(item => (
            <TouchableOpacity key={item.label} style={s.quickItem} onPress={() => router.push(item.route as any)}>
              <View style={s.quickIcon}>
                <Ionicons name={item.icon as any} size={22} color={t.primary} />
              </View>
              <Text style={s.quickLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {showH && <Section title="Houses" total={hD?.data?.pagination?.total ?? 0} items={houses} cat="house" loading={hL} route="/(tabs)/houses" />}
        {showC && <Section title="Cars" total={cD?.data?.pagination?.total ?? 0} items={cars} cat="car" loading={cL} route="/(tabs)/cars" />}
        {showS && <Section title="Services" total={sD?.data?.pagination?.total ?? 0} items={services} cat="service" loading={sL} route="/(tabs)/services" />}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(t: any) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    header: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 16 },
    headerTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    appName: { fontSize: 13, fontWeight: '800', color: t.primary, marginBottom: 4, letterSpacing: 0.5 },
    headline: { fontSize: 24, fontWeight: '800', color: t.text, marginBottom: 4 },
    subline: { fontSize: 14, color: t.textMuted },
    notifBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: t.card, borderWidth: 1, borderColor: t.border, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
    searchBox: { marginHorizontal: 16, backgroundColor: t.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: t.border, marginBottom: 20, gap: 10 },
    searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: t.inputBg, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: t.border },
    searchInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: t.text },
    pill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5, borderColor: t.border, marginRight: 8, backgroundColor: t.background },
    pillActive: { borderColor: t.primary, backgroundColor: t.primary },
    pillText: { fontSize: 13, fontWeight: '600', color: t.textMuted },
    pillTextActive: { color: '#fff' },
    btnRow: { flexDirection: 'row', gap: 10 },
    searchBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: t.primary, paddingVertical: 12, borderRadius: 12 },
    searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    resetBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: t.border, alignItems: 'center', justifyContent: 'center' },
    resetBtnText: { fontWeight: '600', color: t.textMuted, fontSize: 14 },
    quickNav: { paddingHorizontal: 16, paddingBottom: 20, gap: 12 },
    quickItem: { alignItems: 'center', gap: 6, width: 72 },
    quickIcon: { width: 52, height: 52, borderRadius: 16, backgroundColor: `${t.primary}12`, borderWidth: 1, borderColor: `${t.primary}25`, alignItems: 'center', justifyContent: 'center' },
    quickLabel: { fontSize: 11, fontWeight: '600', color: t.textMuted, textAlign: 'center' },
    section: { marginBottom: 20 },
    secHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20, marginBottom: 14 },
    secTitle: { fontSize: 20, fontWeight: '800', color: t.text },
    secCount: { fontSize: 13, color: t.textMuted, marginTop: 2 },
    viewAll: { color: t.primary, fontWeight: '700', fontSize: 14 },
    emptyText: { paddingHorizontal: 20, color: t.textMuted, fontSize: 14 },
  });
}
