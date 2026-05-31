import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import Toast from 'react-native-toast-message';
import { getFavorites, removeFavorite, FavoriteItem } from '../../lib/favorites';
import { useTheme } from '../../hooks/useTheme';

export default function FavoritesScreen() {
  const t = useTheme();
  const s = makeStyles(t);
  const router = useRouter();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useFocusEffect(useCallback(() => { getFavorites().then(setFavorites); }, []));

  const handleRemove = async (id: string) => {
    await removeFavorite(id);
    setFavorites(p => p.filter(f => f.id !== id));
    Toast.show({ type: 'info', text1: 'Removed from saved' });
  };

  const handlePress = (item: FavoriteItem) => {
    const path = item.category === 'house' ? `/house-listings/${item.id}` : item.category === 'car' ? `/car-listings/${item.id}` : `/service-listings/${item.id}`;
    router.push(path as any);
  };

  if (favorites.length === 0) {
    return (
      <SafeAreaView style={s.safe}>
        <Text style={s.headerTitle}>Saved</Text>
        <View style={s.empty}>
          <Ionicons name="heart-outline" size={64} color={t.border} />
          <Text style={s.emptyTitle}>No saved listings</Text>
          <Text style={s.emptySub}>Tap the heart icon on any listing to save it here.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Saved</Text>
        <Text style={s.count}>{favorites.length} saved</Text>
      </View>
      <FlatList
        data={favorites}
        keyExtractor={i => i.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={s.card} onPress={() => handlePress(item)} activeOpacity={0.85}>
            {item.image
              ? <Image source={{ uri: item.image }} style={s.image} />
              : <View style={[s.image, s.imagePlaceholder]}><Ionicons name="image-outline" size={28} color={t.textMuted} /></View>
            }
            <View style={s.info}>
              <View style={s.badge}>
                <Text style={s.badgeText}>{item.category === 'car' ? 'Car' : item.category === 'service' ? 'Service' : 'House'}</Text>
              </View>
              <Text style={s.cardTitle} numberOfLines={1}>{item.title}</Text>
              <View style={s.locationRow}>
                <Ionicons name="location-outline" size={12} color={t.primary} />
                <Text style={s.location} numberOfLines={1}>{item.location}</Text>
              </View>
              <Text style={s.price}>{item.price.toLocaleString()} ETB</Text>
            </View>
            <TouchableOpacity style={s.heartBtn} onPress={() => handleRemove(item.id)}>
              <Ionicons name="heart" size={22} color="#ef4444" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

function makeStyles(t: any) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
    headerTitle: { fontSize: 26, fontWeight: '800', color: t.text, paddingHorizontal: 20, paddingTop: 20 },
    count: { fontSize: 13, color: t.textMuted, fontWeight: '600' },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 12 },
    emptyTitle: { fontSize: 18, fontWeight: '700', color: t.text },
    emptySub: { fontSize: 14, color: t.textMuted, textAlign: 'center', lineHeight: 20 },
    card: { flexDirection: 'row', backgroundColor: t.card, borderRadius: 16, borderWidth: 1, borderColor: t.border, marginBottom: 12, overflow: 'hidden', alignItems: 'center' },
    image: { width: 90, height: 90 },
    imagePlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: t.inputBg },
    info: { flex: 1, padding: 12, gap: 3 },
    badge: { alignSelf: 'flex-start', backgroundColor: `${t.primary}15`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginBottom: 2 },
    badgeText: { fontSize: 10, fontWeight: '700', color: t.primary, textTransform: 'uppercase' },
    cardTitle: { fontSize: 14, fontWeight: '700', color: t.text },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    location: { fontSize: 12, color: t.textMuted, flex: 1 },
    price: { fontSize: 15, fontWeight: '800', color: t.text },
    heartBtn: { padding: 14 },
  });
}
