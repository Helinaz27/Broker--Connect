// app/dashboard/admin-fees.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  ScrollView,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useGetAllFeesQuery,
  useCreateFeeMutation,
  useUpdateFeeMutation,
  useDeleteFeeMutation,
  PlatformFee,
} from "../../store/apis/adminApi";
import { useTheme } from "../../hooks/useTheme";

const CATEGORIES = ["house", "car", "otherService"];
const FEE_TYPES = ["listing", "renewal", "promotion"];

type FeeForm = {
  name: string;
  description: string;
  feeType: string;
  category: string;
  listingMode: string;
  coinAmount: string;
  durationDays: string;
  isActive: boolean;
};

const EMPTY_FORM: FeeForm = {
  name: "",
  description: "",
  feeType: "listing",
  category: "house",
  listingMode: "rent",
  coinAmount: "",
  durationDays: "",
  isActive: true,
};

export default function AdminFeesScreen() {
  const t = useTheme();
  const s = makeStyles(t);
  const [form, setForm] = useState<FeeForm>(EMPTY_FORM);
  const [editing, setEditing] = useState<PlatformFee | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data, isLoading, refetch } = useGetAllFeesQuery();
  const [createFee, { isLoading: creating }] = useCreateFeeMutation();
  const [updateFee, { isLoading: updating }] = useUpdateFeeMutation();
  const [deleteFee] = useDeleteFeeMutation();

  const fees = data?.data?.platformFees ?? [];

  const openEdit = (fee: PlatformFee) => {
    setEditing(fee);
    setForm({
      name: fee.name,
      description: fee.description ?? "",
      feeType: fee.feeType,
      category: fee.category,
      listingMode: fee.listingMode ?? "rent",
      coinAmount: String(fee.coinAmount),
      durationDays: String(fee.durationDays),
      isActive: fee.isActive,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.coinAmount || !form.durationDays) {
      Alert.alert("Required", "Name, coin amount, and duration are required.");
      return;
    }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      feeType: form.feeType,
      category: form.category,
      listingMode: form.listingMode,
      coinAmount: parseInt(form.coinAmount),
      durationDays: parseInt(form.durationDays),
      isActive: form.isActive,
    };
    try {
      if (editing) {
        await updateFee({ id: editing.id, ...payload }).unwrap();
      } else {
        await createFee(payload).unwrap();
      }
      setShowForm(false);
      setEditing(null);
      setForm(EMPTY_FORM);
      refetch();
    } catch (e: any) {
      Alert.alert("Error", e?.data?.message ?? "Failed.");
    }
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Delete Fee", `Delete "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteFee(id).unwrap();
            refetch();
          } catch (e: any) {
            Alert.alert("Error", e?.data?.message ?? "Failed.");
          }
        },
      },
    ]);
  };

  return (
    <View style={s.root}>
      <TouchableOpacity
        style={[s.addBtn, { backgroundColor: t.primary }]}
        onPress={() => {
          setEditing(null);
          setForm(EMPTY_FORM);
          setShowForm(true);
        }}
      >
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={s.addBtnText}>New Platform Fee</Text>
      </TouchableOpacity>

      {isLoading ? (
        <ActivityIndicator color={t.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={fees}
          keyExtractor={(f) => f.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyText}>No fees configured</Text>
            </View>
          }
          renderItem={({ item: fee }) => (
            <View style={s.card}>
              <View style={{ flex: 1 }}>
                <View style={s.cardHeader}>
                  <Text style={s.cardName}>{fee.name}</Text>
                  <View
                    style={[
                      s.activeBadge,
                      {
                        backgroundColor: fee.isActive
                          ? `${t.success}15`
                          : `${t.textMuted}15`,
                      },
                    ]}
                  >
                    <View
                      style={[
                        s.activeDot,
                        {
                          backgroundColor: fee.isActive
                            ? t.success
                            : t.textMuted,
                        },
                      ]}
                    />
                    <Text
                      style={[
                        s.activeText,
                        { color: fee.isActive ? t.success : t.textMuted },
                      ]}
                    >
                      {fee.isActive ? "Active" : "Inactive"}
                    </Text>
                  </View>
                </View>
                {fee.description && (
                  <Text style={s.cardDesc} numberOfLines={1}>
                    {fee.description}
                  </Text>
                )}
                <View style={s.cardMeta}>
                  <Chip label={fee.category} color="#6366F1" />
                  <Chip label={fee.feeType} color={t.primary} />
                  <Chip label={`${fee.coinAmount} coins`} color="#F59E0B" />
                  <Chip label={`${fee.durationDays}d`} color="#22C55E" />
                </View>
              </View>
              <View style={s.actions}>
                <TouchableOpacity
                  style={[s.actionBtn, { backgroundColor: `${t.primary}10` }]}
                  onPress={() => openEdit(fee)}
                >
                  <Ionicons name="pencil-outline" size={16} color={t.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    s.actionBtn,
                    { backgroundColor: `${t.destructive}10` },
                  ]}
                  onPress={() => handleDelete(fee.id, fee.name)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={16}
                    color={t.destructive}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Form sheet */}
      {showForm && (
        <View style={s.overlay}>
          <TouchableOpacity
            style={s.backdrop}
            onPress={() => setShowForm(false)}
          />
          <View style={[s.sheet, { backgroundColor: t.card }]}>
            <View style={s.sheetHeader}>
              <Text style={[s.sheetTitle, { color: t.text }]}>
                {editing ? "Edit Fee" : "New Fee"}
              </Text>
              <TouchableOpacity
                onPress={() => setShowForm(false)}
                style={[s.closeBtn, { backgroundColor: t.inputBg }]}
              >
                <Ionicons name="close" size={18} color={t.textMuted} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <FL label="Name" />
              <Input
                value={form.name}
                onChange={(v) => setForm((p) => ({ ...p, name: v }))}
                t={t}
                placeholder="e.g. House Rent Listing"
              />
              <FL label="Description" />
              <Input
                value={form.description}
                onChange={(v) => setForm((p) => ({ ...p, description: v }))}
                t={t}
                placeholder="Optional..."
                multiline
              />

              <FL label="Fee Type" />
              <Seg
                options={FEE_TYPES.map((f) => ({
                  value: f,
                  label: f.charAt(0).toUpperCase() + f.slice(1),
                }))}
                value={form.feeType}
                onChange={(v) => setForm((p) => ({ ...p, feeType: v }))}
                t={t}
              />

              <FL label="Category" />
              <Seg
                options={CATEGORIES.map((c) => ({
                  value: c,
                  label:
                    c === "otherService"
                      ? "Service"
                      : c.charAt(0).toUpperCase() + c.slice(1),
                }))}
                value={form.category}
                onChange={(v) => setForm((p) => ({ ...p, category: v }))}
                t={t}
              />

              <View style={{ flexDirection: "row", gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <FL label="Coins" />
                  <Input
                    value={form.coinAmount}
                    onChange={(v) => setForm((p) => ({ ...p, coinAmount: v }))}
                    t={t}
                    placeholder="50"
                    numeric
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <FL label="Duration (days)" />
                  <Input
                    value={form.durationDays}
                    onChange={(v) =>
                      setForm((p) => ({ ...p, durationDays: v }))
                    }
                    t={t}
                    placeholder="30"
                    numeric
                  />
                </View>
              </View>

              <View style={[s.toggleRow, { borderColor: t.border }]}>
                <Text style={[s.toggleLabel, { color: t.text }]}>Active</Text>
                <Switch
                  value={form.isActive}
                  onValueChange={(v) => setForm((p) => ({ ...p, isActive: v }))}
                  trackColor={{ false: t.border, true: `${t.primary}60` }}
                  thumbColor={form.isActive ? t.primary : "#fff"}
                />
              </View>

              <TouchableOpacity
                style={[
                  s.saveBtn,
                  { backgroundColor: t.primary },
                  (creating || updating) && { opacity: 0.6 },
                ]}
                onPress={handleSave}
                disabled={creating || updating}
              >
                {creating || updating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={s.saveBtnText}>
                    {editing ? "Update Fee" : "Create Fee"}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

function Chip({ label, color }: any) {
  return (
    <View
      style={{
        backgroundColor: `${color}12`,
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 2,
      }}
    >
      <Text
        style={{
          fontSize: 10,
          fontWeight: "700",
          color,
          textTransform: "capitalize",
        }}
      >
        {label}
      </Text>
    </View>
  );
}
function FL({ label }: any) {
  return (
    <Text
      style={{
        fontSize: 10,
        fontWeight: "700",
        color: "#94A3B8",
        textTransform: "uppercase",
        letterSpacing: 0.8,
        marginBottom: 5,
      }}
    >
      {label}
    </Text>
  );
}
function Input({ value, onChange, t, placeholder, multiline, numeric }: any) {
  return (
    <TextInput
      style={{
        backgroundColor: t.inputBg,
        borderRadius: 10,
        borderWidth: 1.5,
        borderColor: t.border,
        paddingHorizontal: 12,
        paddingVertical: 11,
        fontSize: 14,
        color: t.text,
        marginBottom: 14,
        height: multiline ? 72 : undefined,
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
function Seg({ options, value, onChange, t }: any) {
  return (
    <View style={{ flexDirection: "row", gap: 6, marginBottom: 14 }}>
      {options.map((o: any) => (
        <TouchableOpacity
          key={o.value}
          style={{
            flex: 1,
            paddingVertical: 9,
            borderRadius: 9,
            alignItems: "center",
            borderWidth: 1.5,
            borderColor: value === o.value ? t.primary : t.border,
            backgroundColor: value === o.value ? `${t.primary}12` : t.inputBg,
          }}
          onPress={() => onChange(o.value)}
        >
          <Text
            style={{
              fontSize: 11,
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
    addBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      margin: 16,
      borderRadius: 12,
      paddingVertical: 13,
    },
    addBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
    empty: { flex: 1, alignItems: "center", paddingTop: 60 },
    emptyText: { color: t.textMuted, fontWeight: "600" },
    card: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      backgroundColor: t.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.border,
      padding: 14,
    },
    cardHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 3,
    },
    cardName: { fontSize: 14, fontWeight: "700", color: t.text, flex: 1 },
    activeBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      borderRadius: 8,
      paddingHorizontal: 7,
      paddingVertical: 3,
    },
    activeDot: { width: 5, height: 5, borderRadius: 3 },
    activeText: { fontSize: 10, fontWeight: "700" },
    cardDesc: { fontSize: 12, color: t.textMuted, marginBottom: 6 },
    cardMeta: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 4 },
    actions: { gap: 6 },
    actionBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.5)",
    },
    sheet: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 20,
      maxHeight: "88%",
    },
    sheetHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    sheetTitle: { fontSize: 18, fontWeight: "800" },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    toggleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 14,
    },
    toggleLabel: { fontSize: 14, fontWeight: "600" },
    saveBtn: {
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
      marginTop: 4,
      marginBottom: 20,
    },
    saveBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  });
}
