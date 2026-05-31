// app/dashboard/admin-kyc.tsx
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
  Image,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  useGetAllKYCQuery,
  useApproveKYCMutation,
  useRejectKYCMutation,
  KYCRequest,
} from "../../store/apis/adminApi";
import { useTheme } from "../../hooks/useTheme";

const STATUS_COLORS: Record<string, string> = {
  pending: "#F59E0B",
  approved: "#22C55E",
  rejected: "#EF4444",
};

export default function AdminKYCScreen() {
  const t = useTheme();
  const s = makeStyles(t);
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selected, setSelected] = useState<KYCRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectMode, setRejectMode] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch } = useGetAllKYCQuery({
    status: statusFilter,
    limit: 50,
  });
  const [approve, { isLoading: approving }] = useApproveKYCMutation();
  const [reject, { isLoading: rejecting }] = useRejectKYCMutation();

  const requests = data?.data?.kycRequests ?? [];

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleApprove = async (id: string) => {
    Alert.alert("Approve KYC", "Approve this KYC request?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Approve",
        onPress: async () => {
          try {
            await approve(id).unwrap();
            setSelected(null);
            refetch();
          } catch (e: any) {
            Alert.alert("Error", e?.data?.message ?? "Failed.");
          }
        },
      },
    ]);
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      Alert.alert("Required", "Please enter a rejection reason.");
      return;
    }
    try {
      await reject({ id, reason: rejectReason.trim() }).unwrap();
      setSelected(null);
      setRejectReason("");
      setRejectMode(false);
      refetch();
    } catch (e: any) {
      Alert.alert("Error", e?.data?.message ?? "Failed.");
    }
  };

  return (
    <View style={s.root}>
      {/* Filter */}
      <View style={s.filterRow}>
        {["pending", "approved", "rejected"].map((f) => (
          <TouchableOpacity
            key={f}
            style={[
              s.filterTab,
              statusFilter === f && { backgroundColor: STATUS_COLORS[f] },
            ]}
            onPress={() => setStatusFilter(f)}
          >
            <Text
              style={[s.filterText, statusFilter === f && { color: "#fff" }]}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <ActivityIndicator color={t.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(r) => r.id}
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
              <Text style={s.emptyText}>No {statusFilter} requests</Text>
            </View>
          }
          renderItem={({ item: r }) => {
            const color = STATUS_COLORS[r.status] ?? t.textMuted;
            return (
              <TouchableOpacity
                style={s.card}
                onPress={() => {
                  setSelected(r);
                  setRejectMode(false);
                  setRejectReason("");
                }}
              >
                <View style={[s.avatar, { backgroundColor: `${color}20` }]}>
                  <Ionicons name="person-outline" size={20} color={color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.cardName}>
                    {r.user?.firstName} {r.user?.lastName}
                  </Text>
                  <Text style={s.cardEmail}>{r.user?.email}</Text>
                  <Text style={s.cardDoc}>
                    {(r.documentType ?? "").replace(/_/g, " ")} ·{" "}
                    {r.documentNumber}
                  </Text>
                </View>
                <View>
                  <View
                    style={[
                      s.statusBadge,
                      {
                        backgroundColor: `${color}15`,
                        borderColor: `${color}30`,
                      },
                    ]}
                  >
                    <Text style={[s.statusText, { color }]}>{r.status}</Text>
                  </View>
                  <Text style={s.dateText}>
                    {r.submittedAt
                      ? new Date(r.submittedAt).toLocaleDateString()
                      : "—"}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Detail bottom sheet */}
      {selected && (
        <View style={s.overlay}>
          <TouchableOpacity
            style={s.backdrop}
            onPress={() => setSelected(null)}
          />
          <View style={[s.sheet, { backgroundColor: t.card }]}>
            <View style={s.sheetHeader}>
              <Text style={[s.sheetTitle, { color: t.text }]}>KYC Review</Text>
              <TouchableOpacity
                onPress={() => setSelected(null)}
                style={[s.closeBtn, { backgroundColor: t.inputBg }]}
              >
                <Ionicons name="close" size={18} color={t.textMuted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Row
                label="Name"
                value={`${selected.user?.firstName} ${selected.user?.lastName}`}
                t={t}
              />
              <Row label="Email" value={selected.user?.email ?? "—"} t={t} />
              <Row label="Phone" value={selected.user?.phone ?? "—"} t={t} />
              <Row
                label="Doc Type"
                value={(selected.documentType ?? "").replace(/_/g, " ")}
                t={t}
              />
              <Row
                label="Doc Number"
                value={selected.documentNumber ?? "—"}
                t={t}
              />
              <Row
                label="Submitted"
                value={
                  selected.submittedAt
                    ? new Date(selected.submittedAt).toLocaleDateString()
                    : "—"
                }
                t={t}
              />

              {selected.frontSideImage && (
                <Image
                  source={{ uri: selected.frontSideImage }}
                  style={s.docImage}
                  resizeMode="contain"
                />
              )}
              {selected.backSideImage && (
                <Image
                  source={{ uri: selected.backSideImage }}
                  style={s.docImage}
                  resizeMode="contain"
                />
              )}

              {rejectMode ? (
                <>
                  <TextInput
                    style={[
                      s.rejectInput,
                      {
                        backgroundColor: t.inputBg,
                        borderColor: t.border,
                        color: t.text,
                      },
                    ]}
                    placeholder="Rejection reason..."
                    placeholderTextColor={t.textMuted}
                    value={rejectReason}
                    onChangeText={setRejectReason}
                    multiline
                  />
                  <View style={s.btnRow}>
                    <TouchableOpacity
                      style={[s.btn, { backgroundColor: t.inputBg }]}
                      onPress={() => setRejectMode(false)}
                    >
                      <Text style={{ color: t.textMuted, fontWeight: "700" }}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        s.btn,
                        { backgroundColor: "#EF4444" },
                        rejecting && { opacity: 0.6 },
                      ]}
                      onPress={() => handleReject(selected.id)}
                      disabled={rejecting}
                    >
                      {rejecting ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={{ color: "#fff", fontWeight: "700" }}>
                          Confirm Reject
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              ) : selected.status === "pending" ? (
                <View style={s.btnRow}>
                  <TouchableOpacity
                    style={[
                      s.btn,
                      { backgroundColor: "#22C55E" },
                      approving && { opacity: 0.6 },
                    ]}
                    onPress={() => handleApprove(selected.id)}
                    disabled={approving}
                  >
                    {approving ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons name="checkmark" size={16} color="#fff" />
                        <Text style={{ color: "#fff", fontWeight: "700" }}>
                          Approve
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      s.btn,
                      {
                        backgroundColor: "#EF444420",
                        borderWidth: 1,
                        borderColor: "#EF444440",
                      },
                    ]}
                    onPress={() => setRejectMode(true)}
                  >
                    <Ionicons name="close" size={16} color="#EF4444" />
                    <Text style={{ color: "#EF4444", fontWeight: "700" }}>
                      Reject
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View
                  style={[
                    s.resolvedBadge,
                    { backgroundColor: `${STATUS_COLORS[selected.status]}15` },
                  ]}
                >
                  <Text
                    style={{
                      color: STATUS_COLORS[selected.status],
                      fontWeight: "700",
                      textTransform: "capitalize",
                    }}
                  >
                    {selected.status}
                  </Text>
                  {selected.reason && (
                    <Text
                      style={{ color: t.textMuted, fontSize: 12, marginTop: 4 }}
                    >
                      Reason: {selected.reason}
                    </Text>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}
    </View>
  );
}

function Row({ label, value, t }: any) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: t.border,
      }}
    >
      <Text style={{ fontSize: 12, color: t.textMuted, fontWeight: "600" }}>
        {label}
      </Text>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "700",
          color: t.text,
          maxWidth: "60%",
          textAlign: "right",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function makeStyles(t: any) {
  return StyleSheet.create({
    root: { flex: 1, backgroundColor: t.background },
    filterRow: {
      flexDirection: "row",
      padding: 12,
      gap: 8,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
      backgroundColor: t.card,
    },
    filterTab: {
      flex: 1,
      paddingVertical: 8,
      borderRadius: 10,
      alignItems: "center",
      backgroundColor: t.inputBg,
    },
    filterText: { fontSize: 12, fontWeight: "600", color: t.textMuted },
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
      padding: 14,
    },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: "center",
      justifyContent: "center",
    },
    cardName: { fontSize: 14, fontWeight: "700", color: t.text },
    cardEmail: { fontSize: 11, color: t.textMuted, marginTop: 1 },
    cardDoc: {
      fontSize: 11,
      color: t.textMuted,
      marginTop: 2,
      textTransform: "capitalize",
    },
    statusBadge: {
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderWidth: 1,
      alignSelf: "flex-end",
    },
    statusText: {
      fontSize: 10,
      fontWeight: "700",
      textTransform: "capitalize",
    },
    dateText: {
      fontSize: 10,
      color: t.textMuted,
      marginTop: 4,
      textAlign: "right",
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
      maxHeight: "85%",
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
    docImage: {
      width: "100%",
      height: 180,
      borderRadius: 12,
      marginVertical: 8,
    },
    rejectInput: {
      borderRadius: 12,
      borderWidth: 1.5,
      padding: 12,
      fontSize: 14,
      height: 88,
      textAlignVertical: "top",
      marginVertical: 8,
    },
    btnRow: { flexDirection: "row", gap: 10, marginTop: 12, marginBottom: 8 },
    btn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderRadius: 12,
      paddingVertical: 13,
    },
    resolvedBadge: {
      borderRadius: 12,
      padding: 14,
      alignItems: "center",
      marginTop: 8,
    },
  });
}
