// app/dashboard/create-service.tsx
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

const SERVICE_TYPES = [
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
const CITIES = [
  "Addis Ababa",
  "Dire Dawa",
  "Hawassa",
  "Bahir Dar",
  "Mekelle",
  "Gondar",
  "Adama",
];

export default function CreateServiceScreen() {
  const t = useTheme();
  const s = makeStyles(t);
  const router = useRouter();
  const [create, { isLoading }] = useCreateListingMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("Addis Ababa");
  const [serviceType, setServiceType] = useState("cleaning");
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
    if (!res.canceled && res.assets?.[0])
      setImages((prev) => [...prev, res.assets[0].uri]);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !price.trim()) {
      Alert.alert("Required", "Title and price are required.");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("listingType", "service");
      fd.append("title", title.trim());
      fd.append("description", description.trim());
      fd.append("price", price);
      fd.append("city", city);
      fd.append("serviceType", serviceType);
      fd.append("duration", duration);
      fd.append("contactCoinLimit", coinLimit);
      images.forEach((uri, i) => {
        fd.append("images", {
          uri,
          name: `image_${i}.jpg`,
          type: "image/jpeg",
        } as any);
      });

      const res = await create(fd).unwrap();
      if (res.success) {
        Alert.alert("Posted!", "Your service listing is live.", [
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
      <FieldLabel label="Title *" />
      <InputField
        value={title}
        onChange={setTitle}
        placeholder="e.g. Professional House Cleaning"
        t={t}
      />

      <FieldLabel label="Description" />
      <InputField
        value={description}
        onChange={setDescription}
        placeholder="Describe your service..."
        t={t}
        multiline
      />

      <FieldLabel label="Price (ETB) *" />
      <InputField
        value={price}
        onChange={setPrice}
        placeholder="e.g. 500"
        t={t}
        numeric
      />

      <FieldLabel label="City" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16 }}
        contentContainerStyle={{ gap: 8 }}
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

      <FieldLabel label="Service Type" />
      <View style={s.typeGrid}>
        {SERVICE_TYPES.map((st) => (
          <TouchableOpacity
            key={st}
            style={[s.chip, serviceType === st && s.chipActive]}
            onPress={() => setServiceType(st)}
          >
            <Text
              style={[
                s.chipText,
                serviceType === st && s.chipTextActive,
                { textTransform: "capitalize" },
              ]}
            >
              {st}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FieldLabel label="Duration (days)" />
      <InputField
        value={duration}
        onChange={setDuration}
        placeholder="30"
        t={t}
        numeric
      />

      <FieldLabel label="Coins to Unlock Contact" />
      <InputField
        value={coinLimit}
        onChange={setCoinLimit}
        placeholder="5"
        t={t}
        numeric
      />

      <FieldLabel label="Images" />
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
            <Text style={s.submitText}>Post Service Listing</Text>
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
function makeStyles(t: any) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: t.background },
    content: { padding: 20 },
    typeGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
    },
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
