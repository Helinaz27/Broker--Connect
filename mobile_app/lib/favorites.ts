// lib/favorites.ts
// Stores favorite listings locally on the device using SecureStore

import * as SecureStore from 'expo-secure-store';

const FAVORITES_KEY = 'favorites';

export interface FavoriteItem {
  id: string;
  title: string;
  image: string;
  price: number;
  location: string;
  category: string;
}

export async function getFavorites(): Promise<FavoriteItem[]> {
  const raw = await SecureStore.getItemAsync(FAVORITES_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function addFavorite(item: FavoriteItem): Promise<void> {
  const current = await getFavorites();
  const exists = current.find((f) => f.id === item.id);
  if (!exists) {
    const updated = [...current, item];
    await SecureStore.setItemAsync(FAVORITES_KEY, JSON.stringify(updated));
  }
}

export async function removeFavorite(id: string): Promise<void> {
  const current = await getFavorites();
  const updated = current.filter((f) => f.id !== id);
  await SecureStore.setItemAsync(FAVORITES_KEY, JSON.stringify(updated));
}

export async function isFavorite(id: string): Promise<boolean> {
  const current = await getFavorites();
  return current.some((f) => f.id === id);
}
