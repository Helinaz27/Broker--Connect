import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../hooks/useTheme";
import { addFavorite, removeFavorite, isFavorite } from "../lib/favorites";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

interface ListingCardProps {
  id: string;
  title: string;
  image: string;
  price: number;
  location: string;
  category: "house" | "car" | "service";
  listingMode?: "rent" | "sell";
  fullWidth?: boolean;
}

export default function ListingCard({
  id,
  title,
  image,
  price,
  location,
  category,
  listingMode,
  fullWidth,
}: ListingCardProps) {
  const t = useTheme();
  const router = useRouter();
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    isFavorite(id).then(setLiked);
  }, [id]);

  const handleLike = async () => {
    if (liked) {
      await removeFavorite(id);
      setLiked(false);
      Toast.show({ type: "info", text1: "Removed from saved" });
    } else {
      await addFavorite({ id, title, image, price, location, category });
      setLiked(true);
      Toast.show({ type: "success", text1: "Saved!" });
    }
  };

  const handlePress = () => {
    const path =
      category === "house"
        ? `/house-listings/${id}`
        : category === "car"
          ? `/car-listings/${id}`
          : `/service-listings/${id}`;
    router.push(path as any);
  };

  const CARD_WIDTH = fullWidth ? width - 32 : width * 0.68;

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: t.card,
          borderColor: t.border,
          width: CARD_WIDTH,
          marginRight: fullWidth ? 0 : 14,
        },
      ]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.imageWrap}>
        <Image
          source={{ uri: image || "https://via.placeholder.com/300x200" }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.badgeRow}>
          <View style={styles.catBadge}>
            <Text style={styles.catBadgeText}>
              {category === "car"
                ? "Car"
                : category === "service"
                  ? "Service"
                  : "House"}
            </Text>
          </View>
          {listingMode && (
            <View
              style={[
                styles.modeBadge,
                {
                  backgroundColor:
                    listingMode === "rent" ? "#3B82F6" : "#22C55E",
                },
              ]}
            >
              <Text style={styles.modeBadgeText}>{listingMode}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.heartBtn}
          onPress={handleLike}
          activeOpacity={0.8}
        >
          <Ionicons
            name={liked ? "heart" : "heart-outline"}
            size={18}
            color={liked ? "#ef4444" : "#64748B"}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.info}>
        <View style={styles.locRow}>
          <Ionicons name="location-outline" size={12} color={t.primary} />
          <Text
            style={[styles.locText, { color: t.textMuted }]}
            numberOfLines={1}
          >
            {location}
          </Text>
        </View>
        <Text style={[styles.title, { color: t.text }]} numberOfLines={2}>
          {title}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: t.text }]}>
            {price.toLocaleString()} ETB
          </Text>
          <Ionicons
            name="arrow-forward-circle-outline"
            size={18}
            color={t.textMuted}
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    marginBottom: 14,
  },
  imageWrap: { height: 175, position: "relative" },
  image: { width: "100%", height: "100%" },
  badgeRow: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    gap: 6,
  },
  catBadge: {
    backgroundColor: "rgba(255,255,255,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 7,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#0F1117",
    letterSpacing: 0.5,
  },
  modeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 7 },
  modeBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    color: "#fff",
    letterSpacing: 0.5,
  },
  heartBtn: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.9)",
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  info: { padding: 14 },
  locRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 5,
  },
  locText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    flex: 1,
  },
  title: { fontSize: 14, fontWeight: "700", marginBottom: 10, lineHeight: 20 },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  price: { fontSize: 17, fontWeight: "800" },
});
