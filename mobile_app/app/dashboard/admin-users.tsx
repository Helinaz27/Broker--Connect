// app/dashboard/admin-users.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  Switch,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useGetAllUsersQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
} from "../../store/apis/adminApi";
import { useTheme } from "../../hooks/useTheme";

export default function AdminUsersScreen() {
  const t = useTheme();
  const s = makeStyles(t);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useGetAllUsersQuery({
    page,
    limit: 20,
    search: search || undefined,
  });
  const [updateStatus] = useUpdateUserStatusMutation();
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation();

  const users = data?.data?.users ?? [];
  const total = data?.data?.pagination?.total ?? 0;

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleToggleStatus = async (
    userId: string,
    currentlyActive: boolean,
  ) => {
    try {
      await updateStatus({ userId, isActive: !currentlyActive }).unwrap();
      refetch();
    } catch (e: any) {
      Alert.alert("Error", e?.data?.message ?? "Failed.");
    }
  };

  const handleDelete = (userId: string, name: string) => {
    Alert.alert("Delete User", `Delete ${name}? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteUser(userId).unwrap();
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
      {/* Search */}
      <View
        style={[
          s.searchBar,
          { backgroundColor: t.card, borderColor: t.border },
        ]}
      >
        <Ionicons name="search-outline" size={18} color={t.textMuted} />
        <TextInput
          style={[s.searchInput, { color: t.text }]}
          placeholder="Search users..."
          placeholderTextColor={t.textMuted}
          value={search}
          onChangeText={(v) => {
            setSearch(v);
            setPage(1);
          }}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Ionicons name="close-circle" size={18} color={t.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={s.totalText}>{total} users total</Text>

      {isLoading ? (
        <ActivityIndicator color={t.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => u.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={t.primary}
            />
          }
          ListEmptyComponent={
            <View style={s.empty}>
              <Text style={s.emptyText}>No users found</Text>
            </View>
          }
          renderItem={({ item: u }) => (
            <View style={s.card}>
              <View
                style={[
                  s.avatar,
                  {
                    backgroundColor: u.isActive
                      ? `${t.primary}15`
                      : `${t.textMuted}15`,
                  },
                ]}
              >
                <Text
                  style={[
                    s.avatarText,
                    { color: u.isActive ? t.primary : t.textMuted },
                  ]}
                >
                  {u.firstName?.[0]}
                  {u.lastName?.[0]}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.nameRow}>
                  <Text style={s.name}>
                    {u.firstName} {u.lastName}
                  </Text>
                  {u.roles?.includes("admin") && (
                    <View
                      style={[
                        s.adminBadge,
                        { backgroundColor: `${t.primary}15` },
                      ]}
                    >
                      <Text style={[s.adminText, { color: t.primary }]}>
                        Admin
                      </Text>
                    </View>
                  )}
                  {u.isKYCVerified && (
                    <Ionicons
                      name="shield-checkmark"
                      size={14}
                      color={t.success}
                    />
                  )}
                </View>
                <Text style={s.email}>{u.email}</Text>
                <View style={s.metaRow}>
                  <Ionicons name="logo-bitcoin" size={12} color={t.primary} />
                  <Text style={s.metaText}>{u.coins ?? 0} coins</Text>
                  <Text style={[s.metaText, { color: t.border }]}>·</Text>
                  <Text style={s.metaText}>
                    {u.createdAt
                      ? new Date(u.createdAt).toLocaleDateString()
                      : "—"}
                  </Text>
                </View>
              </View>
              <View style={s.actions}>
                <Switch
                  value={u.isActive}
                  onValueChange={() => handleToggleStatus(u.id, u.isActive)}
                  trackColor={{ false: t.border, true: `${t.success}60` }}
                  thumbColor={u.isActive ? t.success : "#fff"}
                  style={{ transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }] }}
                />
                <TouchableOpacity
                  style={[
                    s.deleteBtn,
                    { backgroundColor: `${t.destructive}10` },
                  ]}
                  onPress={() =>
                    handleDelete(u.id, `${u.firstName} ${u.lastName}`)
                  }
                  disabled={deleting}
                >
                  <Ionicons
                    name="trash-outline"
                    size={15}
                    color={t.destructive}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

function makeStyles(t: any) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: t.background },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      margin: 12,
      padding: 12,
      borderRadius: 12,
      borderWidth: 1,
    },
    searchInput: { flex: 1, fontSize: 14 },
    totalText: {
      fontSize: 12,
      color: t.textMuted,
      fontWeight: "600",
      paddingHorizontal: 16,
      marginBottom: 4,
    },
    empty: { flex: 1, alignItems: "center", paddingTop: 60 },
    emptyText: { color: t.textMuted, fontWeight: "600" },
    card: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: t.card,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.border,
      padding: 12,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { fontSize: 16, fontWeight: "800" },
    nameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    name: { fontSize: 14, fontWeight: "700", color: t.text },
    adminBadge: { borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1 },
    adminText: { fontSize: 9, fontWeight: "800", textTransform: "uppercase" },
    email: { fontSize: 11, color: t.textMuted, marginTop: 2 },
    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      marginTop: 4,
    },
    metaText: { fontSize: 11, color: t.textMuted },
    actions: { alignItems: "center", gap: 8 },
    deleteBtn: {
      width: 30,
      height: 30,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}
