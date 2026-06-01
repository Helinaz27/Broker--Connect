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

const BRANDS = [
  "Toyota",
  "Hyundai",
  "Kia",
  "Suzuki",
  "Nissan",
  "Honda",
  "BMW",
  "Mercedes",
  "Land Rover",
  "Ford",
  "Other",
];
const CAR_TYPES = [
  "sedan",
  "suv",
  "pickup",
  "hatchback",
  "coupe",
  "minivan",
  "truck",
  "electric",
];
const CONDITIONS = ["new", "used", "refurbished"];
const CITIES = [
  "Addis Ababa",
  "Dire Dawa",
  "Hawassa",
  "Bahir Dar",
  "Mekelle",
  "Gondar",
  "Adama",
];
const RENTAL_PERIODS = ["daily", "weekly", "monthly"];
const TRANSMISSIONS = ["automatic", "manual"];
const FUEL_TYPES = ["petrol", "diesel", "electric", "hybrid"];

export default function CreateCarScreen() {
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
  const [mode, setMode] = useState<"rent" | "sell">("sell");
  const [brand, setBrand] = useState("Toyota");
  const [carModel, setCarModel] = useState("");
  const [carType, setCarType] = useState("sedan");
  const [condition, setCondition] = useState("used");
  const [year, setYear] = useState("");
  const [mileage, setMileage] = useState("");
  const [color, setColor] = useState("");
  const [transmission, setTransmission] = useState("automatic");
  const [fuelType, setFuelType] = useState("petrol");
  const [seats, setSeats] = useState("");
  const [rentalPeriod, setRentalPeriod] = useState("daily");
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
    if (images.length === 0) {
      Alert.alert("Required", "Please upload at least one image.");
      return;
    }
    try {
      const fd = new FormData();
      fd.append("listingType", "car");
      fd.append("title", title.trim());
      fd.append("description", description.trim());
      fd.append("price", price);
      fd.append("listingMode", mode);
      fd.append("city", city);
      if (subCity) fd.append("subCity", subCity.trim());
      if (placeName) fd.append("placeName", placeName.trim());
      fd.append("brand", brand);
      if (carModel) fd.append("carModel", carModel.trim());
      fd.append("carType", carType);
      fd.append("condition", condition);
      if (year) fd.append("year", year);
      if (mileage) fd.append("mileage", mileage);
      if (color) fd.append("color", color.trim());
      fd.append("transmission", transmission);
      fd.append("fuelType", fuelType);
      if (seats) fd.append("seats", seats);
      fd.append("contactCoinLimit", coinLimit);
      if (mode === "rent") {
        fd.append("rentalPeriod", rentalPeriod);
        if (duration) fd.append("duration", duration);
      }
      images.forEach((uri, i) =>
        fd.append("images", {
          uri,
          name: `image_${i}.jpg`,
          type: "image/jpeg",
        } as any),
      );
      const res = await create(fd).unwrap();
      if (res.success) {
        Alert.alert("Posted!", "Your car listing is live.", [
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
      <FL label="Listing Mode" />
      <Segment
        options={[
          { value: "rent", label: "For Rent" },
          { value: "sell", label: "For Sale" },
        ]}
        value={mode}
        onChange={(v) => setMode(v as any)}
        t={t}
      />

      <FL label="Title *" />
      <TI
        value={title}
        onChange={setTitle}
        placeholder="e.g. Toyota Corolla 2020"
        t={t}
      />

      <FL label="Description" />
      <TI
        value={description}
        onChange={setDescription}
        placeholder="Describe the car..."
        t={t}
        multiline
      />

      <FL label="Price (ETB) *" />
      <TI
        value={price}
        onChange={setPrice}
        placeholder="e.g. 2500000"
        t={t}
        numeric
      />

      <FL label="City" />
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

      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <FL label="Sub-City" />
          <TI
            value={subCity}
            onChange={setSubCity}
            placeholder="e.g. Bole"
            t={t}
          />
        </View>
        <View style={{ flex: 1 }}>
          <FL label="Place Name" />
          <TI
            value={placeName}
            onChange={setPlaceName}
            placeholder="e.g. CMC"
            t={t}
          />
        </View>
      </View>

      <FL label="Brand" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16 }}
        contentContainerStyle={{ gap: 8 }}
      >
        {BRANDS.map((b) => (
          <TouchableOpacity
            key={b}
            style={[s.chip, brand === b && s.chipActive]}
            onPress={() => setBrand(b)}
          >
            <Text style={[s.chipText, brand === b && s.chipTextActive]}>
              {b}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <FL label="Model" />
          <TI
            value={carModel}
            onChange={setCarModel}
            placeholder="Corolla"
            t={t}
          />
        </View>
        <View style={{ flex: 1 }}>
          <FL label="Year" />
          <TI
            value={year}
            onChange={setYear}
            placeholder="2020"
            t={t}
            numeric
          />
        </View>
      </View>

      <View style={s.row}>
        <View style={{ flex: 1 }}>
          <FL label="Mileage (km)" />
          <TI
            value={mileage}
            onChange={setMileage}
            placeholder="50000"
            t={t}
            numeric
          />
        </View>
        <View style={{ flex: 1 }}>
          <FL label="Color" />
          <TI value={color} onChange={setColor} placeholder="White" t={t} />
        </View>
        <View style={{ flex: 1 }}>
          <FL label="Seats" />
          <TI value={seats} onChange={setSeats} placeholder="5" t={t} numeric />
        </View>
      </View>

      <FL label="Car Type" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16 }}
        contentContainerStyle={{ gap: 8 }}
      >
        {CAR_TYPES.map((ct) => (
          <TouchableOpacity
            key={ct}
            style={[s.chip, carType === ct && s.chipActive]}
            onPress={() => setCarType(ct)}
          >
            <Text
              style={[
                s.chipText,
                carType === ct && s.chipTextActive,
                { textTransform: "capitalize" },
              ]}
            >
              {ct}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FL label="Condition" />
      <Segment
        options={CONDITIONS.map((c) => ({
          value: c,
          label: c.charAt(0).toUpperCase() + c.slice(1),
        }))}
        value={condition}
        onChange={setCondition}
        t={t}
      />

      <FL label="Transmission" />
      <Segment
        options={TRANSMISSIONS.map((tr) => ({
          value: tr,
          label: tr.charAt(0).toUpperCase() + tr.slice(1),
        }))}
        value={transmission}
        onChange={setTransmission}
        t={t}
      />

      <FL label="Fuel Type" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginBottom: 16 }}
        contentContainerStyle={{ gap: 8 }}
      >
        {FUEL_TYPES.map((f) => (
          <TouchableOpacity
            key={f}
            style={[s.chip, fuelType === f && s.chipActive]}
            onPress={() => setFuelType(f)}
          >
            <Text
              style={[
                s.chipText,
                fuelType === f && s.chipTextActive,
                { textTransform: "capitalize" },
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {mode === "rent" && (
        <>
          <FL label="Rental Period" />
          <Segment
            options={RENTAL_PERIODS.map((r) => ({
              value: r,
              label: r.charAt(0).toUpperCase() + r.slice(1),
            }))}
            value={rentalPeriod}
            onChange={setRentalPeriod}
            t={t}
          />
          <FL label="Duration (days)" />
          <TI
            value={duration}
            onChange={setDuration}
            placeholder="7"
            t={t}
            numeric
          />
        </>
      )}

      <FL label="Coins to Unlock Contact" />
      <TI
        value={coinLimit}
        onChange={setCoinLimit}
        placeholder="5"
        t={t}
        numeric
      />

      <FL label="Images *" />
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
            <Text style={s.submitText}>Post Car Listing</Text>
          </>
        )}
      </TouchableOpacity>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function FL({ label }: { label: string }) {
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

function TI({ value, onChange, placeholder, t, multiline, numeric }: any) {
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

function Segment({ options, value, onChange, t }: any) {
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
