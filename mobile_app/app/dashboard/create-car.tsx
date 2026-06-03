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
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { useCreateListingMutation } from "../../store/apis/listingsApi";
import { useTheme } from "../../hooks/useTheme";

const CAR_TYPES = ["fuel", "electric"];
const CONDITIONS = ["new", "used"];
const LISTING_MODES = ["rent", "sell"];
const RENTAL_PERIODS = ["daily", "weekly", "monthly", "yearly"];
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
  "Isuzu",
  "Mitsubishi",
  "Volkswagen",
  "Audi",
  "Other",
];

function FL({ label }: { label: string }) {
  return <Text style={styles.fieldLabel}>{label}</Text>;
}

function TI({ value, onChange, placeholder, t, multiline, numeric }: any) {
  return (
    <TextInput
      style={[
        styles.textInput,
        {
          backgroundColor: t.inputBg,
          borderColor: t.border,
          color: t.text,
          height: multiline ? 90 : undefined,
          textAlignVertical: multiline ? "top" : "auto",
        },
      ]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={t.textMuted}
      multiline={multiline}
      keyboardType={numeric ? "numeric" : "default"}
    />
  );
}

function DropdownSelect({
  label,
  value,
  options,
  onChange,
  t,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  t: any;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <>
      <FL label={label} />
      <TouchableOpacity
        style={[
          styles.dropdownBtn,
          { backgroundColor: t.inputBg, borderColor: t.border },
        ]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text
          style={[
            styles.dropdownBtnText,
            { color: selected ? t.text : t.textMuted },
          ]}
        >
          {selected ? selected.label : "Select..."}
        </Text>
        <Ionicons name="chevron-down" size={16} color={t.textMuted} />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: t.card, borderColor: t.border },
            ]}
          >
            <Text style={[styles.modalTitle, { color: t.text }]}>{label}</Text>
            <FlatList
              data={options}
              keyExtractor={(i) => i.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.modalOption,
                    { borderBottomColor: t.border },
                    item.value === value && {
                      backgroundColor: `${t.primary}12`,
                    },
                  ]}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      { color: item.value === value ? t.primary : t.text },
                    ]}
                  >
                    {item.label}
                  </Text>
                  {item.value === value && (
                    <Ionicons name="checkmark" size={16} color={t.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export default function CreateCarScreen() {
  const t = useTheme();
  const router = useRouter();
  const [create, { isLoading }] = useCreateListingMutation();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [locationCity, setLocationCity] = useState("");
  const [locationSubCity, setLocationSubCity] = useState("");
  const [locationPlaceName, setLocationPlaceName] = useState("");
  const [listingMode, setListingMode] = useState("rent");
  const [rentalPeriod, setRentalPeriod] = useState("daily");
  const [durationDays, setDurationDays] = useState("");
  const [brand, setBrand] = useState("Toyota");
  const [carModel, setCarModel] = useState("");
  const [carType, setCarType] = useState("fuel");
  const [condition, setCondition] = useState("used");
  const [contactCoinLimit, setContactCoinLimit] = useState("");
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
    if (!title.trim() || !price.trim() || !locationCity.trim()) {
      Alert.alert("Required", "Title, price, and city are required.");
      return;
    }
    if (!durationDays.trim()) {
      Alert.alert("Required", "Duration (days) is required.");
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
      fd.append("listingMode", listingMode);
      fd.append("location[city]", locationCity.trim());
      if (locationPlaceName)
        fd.append("location[placeName]", locationPlaceName.trim());
      if (locationSubCity)
        fd.append("location[subCity]", locationSubCity.trim());
      fd.append("brand", brand);
      if (carModel) fd.append("carModel", carModel.trim());
      fd.append("carType", carType);
      fd.append("condition", condition);
      fd.append("durationDays", durationDays);
      if (contactCoinLimit) fd.append("contactCoinLimit", contactCoinLimit);
      if (listingMode === "rent") fd.append("rentalPeriod", rentalPeriod);
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
      style={[styles.root, { backgroundColor: t.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <DropdownSelect
        label="LISTING MODE *"
        value={listingMode}
        options={LISTING_MODES.map((m) => ({
          value: m,
          label: m === "rent" ? "For Rent" : "For Sale",
        }))}
        onChange={setListingMode}
        t={t}
      />

      {listingMode === "rent" && (
        <DropdownSelect
          label="RENTAL PERIOD *"
          value={rentalPeriod}
          options={RENTAL_PERIODS.map((r) => ({
            value: r,
            label: r.charAt(0).toUpperCase() + r.slice(1),
          }))}
          onChange={setRentalPeriod}
          t={t}
        />
      )}

      <FL label="TITLE *" />
      <TI
        value={title}
        onChange={setTitle}
        placeholder="e.g. Toyota Corolla 2020"
        t={t}
      />

      <FL label="DESCRIPTION" />
      <TI
        value={description}
        onChange={setDescription}
        placeholder="Describe the car..."
        t={t}
        multiline
      />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <FL label="PRICE (ETB) *" />
          <TI
            value={price}
            onChange={setPrice}
            placeholder="0.00"
            t={t}
            numeric
          />
        </View>
        <View style={{ flex: 1 }}>
          <FL label="DURATION (DAYS) *" />
          <TI
            value={durationDays}
            onChange={setDurationDays}
            placeholder="30"
            t={t}
            numeric
          />
        </View>
      </View>

      <View style={[styles.sectionDivider, { borderTopColor: t.border }]}>
        <Text style={[styles.sectionTitle, { color: t.text }]}>Location</Text>
      </View>

      <FL label="CITY *" />
      <TI
        value={locationCity}
        onChange={setLocationCity}
        placeholder="e.g. Addis Ababa"
        t={t}
      />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <FL label="PLACE NAME" />
          <TI
            value={locationPlaceName}
            onChange={setLocationPlaceName}
            placeholder="e.g. CMC"
            t={t}
          />
        </View>
        <View style={{ flex: 1 }}>
          <FL label="SUB-CITY" />
          <TI
            value={locationSubCity}
            onChange={setLocationSubCity}
            placeholder="e.g. Bole"
            t={t}
          />
        </View>
      </View>

      <View style={[styles.sectionDivider, { borderTopColor: t.border }]}>
        <Text style={[styles.sectionTitle, { color: t.text }]}>
          Car Details
        </Text>
      </View>

      <DropdownSelect
        label="BRAND"
        value={brand}
        options={BRANDS.map((b) => ({ value: b, label: b }))}
        onChange={setBrand}
        t={t}
      />

      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <FL label="MODEL" />
          <TI
            value={carModel}
            onChange={setCarModel}
            placeholder="e.g. Land Cruiser"
            t={t}
          />
        </View>
      </View>

      <DropdownSelect
        label="CAR TYPE *"
        value={carType}
        options={CAR_TYPES.map((c) => ({
          value: c,
          label: c === "fuel" ? "Fuel / ICE" : "Electric / EV",
        }))}
        onChange={setCarType}
        t={t}
      />

      <DropdownSelect
        label="CONDITION *"
        value={condition}
        options={CONDITIONS.map((c) => ({
          value: c,
          label: c === "new" ? "Brand New" : "Used",
        }))}
        onChange={setCondition}
        t={t}
      />

      <FL label="CONTACT COIN LIMIT" />
      <TI
        value={contactCoinLimit}
        onChange={setContactCoinLimit}
        placeholder="e.g. 20"
        t={t}
        numeric
      />

      <View style={[styles.sectionDivider, { borderTopColor: t.border }]}>
        <Text style={[styles.sectionTitle, { color: t.text }]}>Images *</Text>
      </View>

      <View style={styles.imagesWrap}>
        {images.map((uri, i) => (
          <View key={i} style={styles.imageThumb}>
            <Image
              source={{ uri }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.removeImg}
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
            style={[styles.addImageBtn, { borderColor: t.border }]}
            onPress={pickImages}
          >
            <Ionicons name="add" size={26} color={t.textMuted} />
            <Text style={[styles.addImageText, { color: t.textMuted }]}>
              Upload
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity
        style={[
          styles.submitBtn,
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
            <Text style={styles.submitText}>Post Car Listing</Text>
          </>
        )}
      </TouchableOpacity>
      <View style={{ height: 48 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20 },
  row: { flexDirection: "row", gap: 10 },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  textInput: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 16,
  },
  dropdownBtn: {
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  dropdownBtnText: { fontSize: 14, fontWeight: "500", flex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalSheet: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    maxHeight: 420,
  },
  modalTitle: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  modalOption: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalOptionText: { fontSize: 15, fontWeight: "500" },
  sectionDivider: {
    borderTopWidth: 1,
    paddingTop: 16,
    marginBottom: 16,
    marginTop: 4,
  },
  sectionTitle: { fontSize: 13, fontWeight: "800", fontStyle: "italic" },
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
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "rgba(0,0,0,0.65)",
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
    gap: 4,
  },
  addImageText: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
