import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import {
  useGetMyKYCStatusQuery,
  useSubmitKYCMutation,
} from "../../store/apis/kycApi";
import { useTheme } from "../../hooks/useTheme";
import { API_BASE_URL } from "../../constants/api";

const DOC_TYPES = [
  { value: "national_id", label: "National ID" },
  { value: "passport", label: "Passport" },
  { value: "driving_license", label: "Driving License" },
];

export default function KYCScreen() {
  const t = useTheme();
  const s = makeStyles(t);
  const router = useRouter();
  const token = useSelector((st: RootState) => st.user.token);

  const {
    data: kycData,
    isLoading,
    refetch,
  } = useGetMyKYCStatusQuery(undefined, { skip: !token });
  const kyc = kycData?.data;
  const status = kyc?.status ?? null;

  const [showForm, setShowForm] = useState(false);
  const [docType, setDocType] = useState<string>("national_id");
  const [docNumber, setDocNumber] = useState("");
  const [frontUri, setFrontUri] = useState<string | null>(null);
  const [backUri, setBackUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // ─── Pick image using DocumentPicker (works in Expo Go) ───────────────────
  const pickImage = async (side: "front" | "back") => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        const uri = result.assets[0].uri;
        side === "front" ? setFrontUri(uri) : setBackUri(uri);
      }
    } catch {
      Alert.alert("Error", "Could not open file picker. Please try again.");
    }
  };

  // ─── Submit KYC ──────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!docNumber.trim()) {
      Alert.alert("Required", "Please enter your document number.");
      return;
    }
    if (!frontUri) {
      Alert.alert("Required", "Please upload the front side image.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("documentType", docType);
      formData.append("documentNumber", docNumber.trim());
      formData.append("frontSideImage", {
        uri: frontUri,
        name: "front.jpg",
        type: "image/jpeg",
      } as any);
      if (backUri) {
        formData.append("backSideImage", {
          uri: backUri,
          name: "back.jpg",
          type: "image/jpeg",
        } as any);
      }

      const res = await fetch(`${API_BASE_URL}/kyc/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        Alert.alert(
          "Submitted",
          "Your KYC documents have been submitted for review.",
          [
            {
              text: "OK",
              onPress: () => {
                setShowForm(false);
                refetch();
              },
            },
          ],
        );
      } else {
        Alert.alert(
          "Error",
          json.message ?? "Submission failed. Please try again.",
        );
      }
    } catch {
      Alert.alert("Error", "Could not submit KYC. Check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const statusInfo = {
    approved: {
      color: t.success,
      icon: "shield-checkmark",
      bg: "#d1fae5",
      label: "Identity Verified",
      desc: "Your KYC has been approved. You can now post listings.",
    },
    pending: {
      color: t.warning,
      icon: "time",
      bg: "#fef3c7",
      label: "Under Review",
      desc: "Your documents have been submitted and are awaiting admin review.",
    },
    rejected: {
      color: t.destructive,
      icon: "close-circle",
      bg: "#fee2e2",
      label: "KYC Rejected",
      desc: `Reason: ${kyc?.reason ?? "Document was unclear. Please resubmit."}`,
    },
  }[status ?? ""] ?? {
    color: t.primary,
    icon: "shield-outline",
    bg: `${t.primary}15`,
    label: "Not Submitted",
    desc: "Submit your government-issued ID to unlock listing creation.",
  };

  return (
    <SafeAreaView style={s.safe}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={t.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>KYC Verification</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {isLoading ? (
          <ActivityIndicator color={t.primary} style={{ marginTop: 60 }} />
        ) : (
          <>
            {/* Status banner */}
            <View
              style={[
                s.statusBanner,
                {
                  backgroundColor: statusInfo.bg,
                  borderColor: statusInfo.color,
                },
              ]}
            >
              <View
                style={[
                  s.statusIconWrap,
                  { backgroundColor: `${statusInfo.color}20` },
                ]}
              >
                <Ionicons
                  name={statusInfo.icon as any}
                  size={24}
                  color={statusInfo.color}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.statusLabel, { color: statusInfo.color }]}>
                  {statusInfo.label}
                </Text>
                <Text style={s.statusDesc}>{statusInfo.desc}</Text>
              </View>
            </View>

            {/* Existing submission info */}
            {kyc?.kycSubmitted && !showForm && (
              <View style={s.card}>
                <Row
                  label="Document Type"
                  value={(kyc.documentType ?? "").replace(/_/g, " ")}
                  t={t}
                />
                <Row
                  label="Submitted At"
                  value={
                    kyc.submittedAt
                      ? new Date(kyc.submittedAt).toLocaleDateString()
                      : "—"
                  }
                  t={t}
                  last
                />
              </View>
            )}

            {/* Action buttons */}
            {!showForm && (
              <View style={s.actions}>
                {(!kyc?.kycSubmitted || status === "rejected") && (
                  <TouchableOpacity
                    style={s.primaryBtn}
                    onPress={() => setShowForm(true)}
                  >
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={18}
                      color="#fff"
                    />
                    <Text style={s.primaryBtnText}>
                      {status === "rejected" ? "Resubmit KYC" : "Submit KYC"}
                    </Text>
                  </TouchableOpacity>
                )}
                {status === "pending" && (
                  <TouchableOpacity
                    style={s.outlineBtn}
                    onPress={() => setShowForm(true)}
                  >
                    <Ionicons
                      name="pencil-outline"
                      size={18}
                      color={t.primary}
                    />
                    <Text style={s.outlineBtnText}>Edit Submission</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Submission form */}
            {showForm && (
              <View style={s.form}>
                <View style={s.formHeader}>
                  <Text style={s.formTitle}>Identity Documents</Text>
                  <TouchableOpacity
                    onPress={() => setShowForm(false)}
                    style={s.closeBtn}
                  >
                    <Ionicons name="close" size={20} color={t.textMuted} />
                  </TouchableOpacity>
                </View>

                {status === "pending" && (
                  <View
                    style={[
                      s.warningBox,
                      {
                        backgroundColor: `${t.warning}15`,
                        borderColor: `${t.warning}40`,
                      },
                    ]}
                  >
                    <Ionicons
                      name="warning-outline"
                      size={16}
                      color={t.warning}
                    />
                    <Text style={[s.warningText, { color: t.warning }]}>
                      Editing will resubmit for review again.
                    </Text>
                  </View>
                )}

                {/* Document type */}
                <Text style={s.fieldLabel}>Document Type</Text>
                <View style={s.docTypeRow}>
                  {DOC_TYPES.map((dt) => (
                    <TouchableOpacity
                      key={dt.value}
                      style={[
                        s.docTypeBtn,
                        docType === dt.value && s.docTypeBtnActive,
                      ]}
                      onPress={() => setDocType(dt.value)}
                    >
                      <Text
                        style={[
                          s.docTypeBtnText,
                          docType === dt.value && {
                            color: t.primary,
                            fontWeight: "700",
                          },
                        ]}
                      >
                        {dt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Document number */}
                <Text style={s.fieldLabel}>Document Number</Text>
                <View
                  style={[
                    s.textInputWrap,
                    docNumber ? s.textInputFocused : null,
                  ]}
                >
                  <Ionicons
                    name="card-outline"
                    size={18}
                    color={docNumber ? t.primary : t.textMuted}
                  />
                  <TextInput
                    style={[s.textInput, { color: t.text }]}
                    placeholder="e.g. ET-1234567"
                    placeholderTextColor={t.textMuted}
                    value={docNumber}
                    onChangeText={setDocNumber}
                    autoCapitalize="characters"
                  />
                </View>

                {/* Image uploads */}
                <View style={s.imagesRow}>
                  <ImageUpload
                    label="Front Side"
                    uri={frontUri}
                    onPick={() => pickImage("front")}
                    onClear={() => setFrontUri(null)}
                    t={t}
                    required
                  />
                  <ImageUpload
                    label="Back Side"
                    uri={backUri}
                    onPick={() => pickImage("back")}
                    onClear={() => setBackUri(null)}
                    t={t}
                  />
                </View>

                {/* Form actions */}
                <View style={s.formActions}>
                  <TouchableOpacity
                    style={s.cancelBtn}
                    onPress={() => setShowForm(false)}
                  >
                    <Text style={s.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.submitBtn, submitting && { opacity: 0.6 }]}
                    onPress={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons
                          name="shield-checkmark-outline"
                          size={16}
                          color="#fff"
                        />
                        <Text style={s.submitBtnText}>
                          {status === "pending"
                            ? "Update & Resubmit"
                            : "Submit for Review"}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Info note */}
            <View
              style={[
                s.infoBox,
                { backgroundColor: t.card, borderColor: t.border },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={t.textMuted}
              />
              <Text style={s.infoText}>
                KYC verification is required to post listings on DigitalBroker.
                Documents are reviewed within 24–48 hours.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Row({
  label,
  value,
  t,
  last,
}: {
  label: string;
  value: string;
  t: any;
  last?: boolean;
}) {
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingVertical: 13,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: t.border,
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <Text style={{ fontSize: 13, color: t.textMuted, fontWeight: "600" }}>
        {label}
      </Text>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "700",
          color: t.text,
          textTransform: "capitalize",
        }}
      >
        {value || "—"}
      </Text>
    </View>
  );
}

function ImageUpload({
  label,
  uri,
  onPick,
  onClear,
  t,
  required,
}: {
  label: string;
  uri: string | null;
  onPick: () => void;
  onClear: () => void;
  t: any;
  required?: boolean;
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: "700",
          color: t.textMuted,
          textTransform: "uppercase",
          letterSpacing: 0.8,
          marginBottom: 8,
        }}
      >
        {label}
        {required && <Text style={{ color: t.destructive }}> *</Text>}
      </Text>

      {uri ? (
        <View
          style={{
            borderRadius: 12,
            overflow: "hidden",
            borderWidth: 1,
            borderColor: t.border,
          }}
        >
          <Image
            source={{ uri }}
            style={{ width: "100%", aspectRatio: 16 / 10 }}
          />
          <TouchableOpacity
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              backgroundColor: t.destructive,
              borderRadius: 14,
              width: 28,
              height: 28,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={onClear}
          >
            <Ionicons name="close" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={{
            aspectRatio: 16 / 10,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: t.border,
            borderStyle: "dashed",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: t.inputBg,
            gap: 6,
          }}
          onPress={onPick}
        >
          <Ionicons name="cloud-upload-outline" size={24} color={t.textMuted} />
          <Text style={{ fontSize: 11, color: t.textMuted, fontWeight: "600" }}>
            Upload {label}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(t: any) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
    },
    backBtn: { marginRight: 8, padding: 2 },
    headerTitle: { fontSize: 22, fontWeight: "800", color: t.text },
    scroll: { padding: 16, paddingBottom: 60 },
    statusBanner: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1.5,
      marginBottom: 20,
    },
    statusIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    statusLabel: { fontSize: 15, fontWeight: "800", marginBottom: 3 },
    statusDesc: { fontSize: 13, color: t.textMuted, lineHeight: 18 },
    card: {
      backgroundColor: t.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.border,
      overflow: "hidden",
      marginBottom: 20,
    },
    actions: { gap: 10, marginBottom: 20 },
    primaryBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: t.primary,
      borderRadius: 14,
      paddingVertical: 15,
    },
    primaryBtnText: {
      color: "#fff",
      fontWeight: "800",
      fontSize: 14,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    outlineBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: 14,
      paddingVertical: 14,
      borderWidth: 1.5,
      borderColor: t.primary,
    },
    outlineBtnText: { color: t.primary, fontWeight: "700", fontSize: 14 },
    form: {
      backgroundColor: t.card,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: t.border,
      padding: 20,
      marginBottom: 20,
      gap: 16,
    },
    formHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    formTitle: { fontSize: 16, fontWeight: "800", color: t.text },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: t.inputBg,
      alignItems: "center",
      justifyContent: "center",
    },
    warningBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
    },
    warningText: { fontSize: 13, fontWeight: "600", flex: 1 },
    fieldLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: t.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    docTypeRow: { flexDirection: "row", gap: 8 },
    docTypeBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: t.border,
      backgroundColor: t.inputBg,
      alignItems: "center",
    },
    docTypeBtnActive: {
      borderColor: t.primary,
      backgroundColor: `${t.primary}10`,
    },
    docTypeBtnText: {
      fontSize: 11,
      fontWeight: "600",
      color: t.textMuted,
      textAlign: "center",
    },
    textInputWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: t.inputBg,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 4,
      borderWidth: 1.5,
      borderColor: t.border,
    },
    textInputFocused: { borderColor: t.primary },
    textInput: { flex: 1, fontSize: 14, paddingVertical: 10 },
    imagesRow: { flexDirection: "row", gap: 12 },
    formActions: { flexDirection: "row", gap: 10 },
    cancelBtn: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 13,
      borderWidth: 1.5,
      borderColor: t.border,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelBtnText: { fontSize: 14, fontWeight: "700", color: t.textMuted },
    submitBtn: {
      flex: 2,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: t.primary,
      borderRadius: 12,
      paddingVertical: 13,
    },
    submitBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },
    infoBox: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
    },
    infoText: { flex: 1, fontSize: 13, color: t.textMuted, lineHeight: 18 },
  });
}
