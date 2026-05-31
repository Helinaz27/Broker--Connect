// app/dashboard/create-house.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { useCreateListingMutation } from "../../store/apis/listingsApi";
import { useTheme } from "../../hooks/useTheme";

const HOUSE_TYPES = [
  "apartment",
  "villa",
  "condominium",
  "studio",
  "townhouse",
  "duplex",
  "penthouse",
];
const CITIES = [
  "Addis Ababa",
  "Dire Dawa",
  "Hawassa",
  "Bahir Dar",
  "Mekelle",
  "Gondar",
  "Jimma",
  "Adama",
];
const RENTAL_PERIODS = ["daily", "weekly", "monthly", "yearly"];

export default function CreateHouseScreen() {
  const t = useTheme();
  const s = makeStyles(t);
  const router = useRouter();
  const [create, { isLoading }] = useCreateListingMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("Addis Ababa");
  const [subCity, setSubCity] = useState("");
  const [placeName, setPlaceName] = useState("");
  const [mode, setMode] = useState<"rent" | "sell">("rent");
  const [houseType, setHouseType] = useState("apartment");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [area, setArea] = useState("");
  const [rentalPeriod, setRentalPeriod] = useState("monthly");
  const [duration, setDuration] = useState("");
  const [coinLimit, setCoinLimit] = useState("5");
  const [images, setImages] = useState<string[]>([]);

  const pickImages = async () => {
    if (images.length >= 5) {
      Alert.alert("Limit", "Maximum 5 images.");
      return;
    }
    const res = await DocumentPicker.getDocumentAsync({
      type: "image/*",
      copyToCacheDirectory: true,
    });
    if (!res.canceled && res.assets?.[0]) {
      setImages((prev) => [...prev, res.assets[0].uri]);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !price.trim() || !placeName.trim()) {
      Alert.alert("Required", "Title, price, and place name are required.");
      return;
    }
    if (images.length === 0) {
      Alert.alert("Required", "Please upload at least one image.");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("listingType", "house");
      fd.append("title", title.trim());
      fd.append("description", description.trim());
      fd.append("price", price);
      fd.append("listingMode", mode);
      fd.append("city", city);
      fd.append("subCity", subCity.trim());
      fd.append("placeName", placeName.trim());
      fd.append("houseType", houseType);
      fd.append("bedrooms", bedrooms);
      fd.append("bathrooms", bathrooms);
      fd.append("area_sqm", area);
      fd.append("contactCoinLimit", coinLimit);
      if (mode === "rent") {
        fd.append("rentalPeriod", rentalPeriod);
        fd.append("duration", duration);
      }
      images.forEach((uri, i) => {
        fd.append("images", {
          uri,
          name: `image_${i}.jpg`,
          type: "image/jpeg",
        } as any);
      });

      const res = await create(fd).unwrap();
      if (res.success) {
        Alert.alert("Posted!", "Your house listing is live.", [
          {
            text: "OK",
            onPress: () => router.push("/dashboard/my-listings" as any),
          },
        ]);
      } else {
        Alert.alert("Error", res.message ?? "Submission failed.");
      }
    } catch (e: any) {
      Alert.alert("Error", e?.data?.message ?? "Could not post listing.");
    }
  };

  return (
    <ScrollView
      style={s.root}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Mode */}
      <FieldLabel label="Listing Mode" />
      <SegmentControl
        options={[
          { value: "rent", label: "For Rent" },
          { value: "sell", label: "For Sale" },
        ]}
        value={mode}
        onChange={(v) => setMode(v as any)}
        t={t}
      />

      {/* Title */}
      <FieldLabel label="Title *" />
      <InputField
        value={title}
        onChange={setTitle}
        placeholder="e.g. Modern 3BR Apartment in Bole"
        t={t}
      />

      {/* Description */}
      <FieldLabel label="Description" />
      <InputField
        value={description}
        onChange={setDescription}
        placeholder="Describe the property..."
        t={t}
        multiline
      />

      {/* Price */}
      <FieldLabel label="Price (ETB) *" />
      <InputField
        value={price}
        onChange={setPrice}
        placeholder="e.g. 15000"
        t={t}
        numeric
      />

      {/* City */}
      <FieldLabel label="City" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16 }}
        contentContainerStyle={{ gap: 8, paddingHorizontal: 0 }}
      >
        {CITIES.map((c) => (
          <TouchableOpacity
            key={c}
            style={[s.chip, city === c && s.chipActive]}
            onPress={() => setCity(c)}
          >
            <Text style={[s.chipText, city === c && s.chipTextActive]}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sub-city / place */}
      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <FieldLabel label="Sub-City" />
          <InputField
            value={subCity}
            onChange={setSubCity}
            placeholder="e.g. Bole"
            t={t}
          />
        </View>
        <View style={{ flex: 1 }}>
          <FieldLabel label="Place Name *" />
          <InputField
            value={placeName}
            onChange={setPlaceName}
            placeholder="e.g. Edna Mall"
            t={t}
          />
        </View>
      </View>

      {/* House type */}
      <FieldLabel label="House Type" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16 }}
        contentContainerStyle={{ gap: 8 }}
      >
        {HOUSE_TYPES.map((ht) => (
          <TouchableOpacity
            key={ht}
            style={[s.chip, houseType === ht && s.chipActive]}
            onPress={() => setHouseType(ht)}
          >
            <Text
              style={[
                s.chipText,
                houseType === ht && s.chipTextActive,
                { textTransform: "capitalize" },
              ]}
            >
              {ht}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Beds / baths / area */}
      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <FieldLabel label="Bedrooms" />
          <InputField
            value={bedrooms}
            onChange={setBedrooms}
            placeholder="3"
            t={t}
            numeric
          />
        </View>
        <View style={{ flex: 1 }}>
          <FieldLabel label="Bathrooms" />
          <InputField
            value={bathrooms}
            onChange={setBathrooms}
            placeholder="2"
            t={t}
            numeric
          />
        </View>
        <View style={{ flex: 1 }}>
          <FieldLabel label="Area m²" />
          <InputField
            value={area}
            onChange={setArea}
            placeholder="120"
            t={t}
            numeric
          />
        </View>
      </View>

      {/* Rental period (rent only) */}
      {mode === "rent" && (
        <>
          <FieldLabel label="Rental Period" />
          <SegmentControl
            options={RENTAL_PERIODS.map((r) => ({
              value: r,
              label: r.charAt(0).toUpperCase() + r.slice(1),
            }))}
            value={rentalPeriod}
            onChange={setRentalPeriod}
            t={t}
          />
          <FieldLabel label="Duration (months)" />
          <InputField
            value={duration}
            onChange={setDuration}
            placeholder="12"
            t={t}
            numeric
          />
        </>
      )}

      {/* Coin limit */}
      <FieldLabel label="Coins to Unlock Contact" />
      <InputField
        value={coinLimit}
        onChange={setCoinLimit}
        placeholder="5"
        t={t}
        numeric
      />

      {/* Images */}
      <FieldLabel label="Images *" />
      <View style={s.imagesWrap}>
        {images.map((uri, i) => (
          <View key={i} style={s.imageThumb}>
            <Image
              source={{ uri }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={s.removeImg}
              onPress={() =>
                setImages((prev) => prev.filter((_, j) => j !== i))
              }
            >
              <Ionicons name="close" size={13} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
        {images.length < 5 && (
          <TouchableOpacity
            style={[s.addImageBtn, { borderColor: t.border }]}
            onPress={pickImages}
          >
            <Ionicons name="add" size={26} color={t.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Submit */}
      <TouchableOpacity
        style={[
          s.submitBtn,
          { backgroundColor: t.primary },
          isLoading && { opacity: 0.6 },
        ]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="cloud-upload-outline" size={18} color="#fff" />
            <Text style={s.submitText}>Post House Listing</Text>
          </>
        )}
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function FieldLabel({ label }: { label: string }) {
  return (
    <Text
      style={{
        fontSize: 11,
        fontWeight: "700",
        color: "#94A3B8",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 6,
      }}
    >
      {label}
    </Text>
  );
}
function InputField({
  value,
  onChange,
  placeholder,
  t,
  multiline,
  numeric,
}: any) {
  return (
    <TextInput
      style={{
        backgroundColor: t.inputBg,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: t.border,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: t.text,
        marginBottom: 16,
        height: multiline ? 88 : undefined,
        textAlignVertical: multiline ? "top" : "auto",
      }}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={t.textMuted}
      multiline={multiline}
      keyboardType={numeric ? "numeric" : "default"}
    />
  );
}
function SegmentControl({ options, value, onChange, t }: any) {
  return (
    <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
      {options.map((o: any) => (
        <TouchableOpacity
          key={o.value}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 10,
            alignItems: "center",
            borderWidth: 1.5,
            borderColor: value === o.value ? t.primary : t.border,
            backgroundColor: value === o.value ? `${t.primary}12` : t.inputBg,
          }}
          onPress={() => onChange(o.value)}
        >
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              color: value === o.value ? t.primary : t.textMuted,
            }}
          >
            {o.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function makeStyles(t: any) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: t.background },
    content: { padding: 20 },
    row: { flexDirection: "row", gap: 10 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: t.border,
      backgroundColor: t.inputBg,
    },
    chipActive: { borderColor: t.primary, backgroundColor: `${t.primary}12` },
    chipText: { fontSize: 12, fontWeight: "600", color: t.textMuted },
    chipTextActive: { color: t.primary, fontWeight: "700" },
    imagesWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10,
      marginBottom: 24,
    },
    imageThumb: { width: 80, height: 80, borderRadius: 12, overflow: "hidden" },
    removeImg: {
      position: "absolute",
      top: 4,
      right: 4,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: "rgba(0,0,0,0.6)",
      alignItems: "center",
      justifyContent: "center",
    },
    addImageBtn: {
      width: 80,
      height: 80,
      borderRadius: 12,
      borderWidth: 2,
      borderStyle: "dashed",
      alignItems: "center",
      justifyContent: "center",
    },
    submitBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      borderRadius: 14,
      paddingVertical: 16,
    },
    submitText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  });
}
