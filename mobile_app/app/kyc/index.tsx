import React, { useState, useEffect } from "react";
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
import * as ImagePicker from "expo-image-picker";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import {
  useGetMyKYCStatusQuery,
  useSubmitKYCMutation,
} from "../../store/apis/kycApi";
import { useTheme } from "../../hooks/useTheme";
import { API_BASE_URL } from "../../constants/api";
import Toast from "react-native-toast-message";

type DocType = "national_id" | "passport" | "driving_license";

export default function KYCScreen() {
  const t = useTheme();
  const s = makeStyles(t);
  const router = useRouter();
  const token = useSelector((st: RootState) => st.user.token);
  const currentUser = useSelector((st: RootState) => st.user.currentUser);
  const isKYCVerified = currentUser?.isKYCVerified ?? false;

  const {
    data: kycData,
    isLoading,
    refetch,
  } = useGetMyKYCStatusQuery(undefined, { skip: !token });
  const kyc = kycData?.data;
  const currentStatus = isKYCVerified ? "approved" : (kyc?.status ?? null);
  const alreadySubmitted = kyc?.kycSubmitted ?? false;

  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [docType, setDocType] = useState<DocType>(
    kyc?.documentType ?? "national_id",
  );
  const [docNumber, setDocNumber] = useState("");
  const [frontUri, setFrontUri] = useState<string | null>(null);
  const [backUri, setBackUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (kyc?.documentType) setDocType(kyc.documentType);
  }, [kyc?.documentType]);

  const pickImage = async (side: "front" | "back") => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission required", "Please allow photo access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      side === "front"
        ? setFrontUri(result.assets[0].uri)
        : setBackUri(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!docNumber.trim()) {
      Toast.show({ type: "error", text1: "Document number is required." });
      return;
    }
    if (!frontUri) {
      Toast.show({
        type: "error",
        text1: "Please upload the front side image.",
      });
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
      if (backUri)
        formData.append("backSideImage", {
          uri: backUri,
          name: "back.jpg",
          type: "image/jpeg",
        } as any);

      const res = await fetch(`${API_BASE_URL}/kyc/submit`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const json = await res.json();
      if (json.success) {
        Toast.show({
          type: "success",
          text1: isEditing
            ? "KYC updated successfully!"
            : "KYC submitted successfully!",
        });
        setShowForm(false);
        setIsEditing(false);
        setDocNumber("");
        setFrontUri(null);
        setBackUri(null);
        refetch();
      } else {
        Toast.show({
          type: "error",
          text1: json.message ?? "Submission failed.",
        });
      }
    } catch {
      Toast.show({
        type: "error",
        text1: "Could not submit KYC. Check your connection.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowForm(true);
    setDocNumber("");
    setFrontUri(null);
    setBackUri(null);
  };
  const handleCancel = () => {
    setShowForm(false);
    setIsEditing(false);
    setDocNumber("");
    setFrontUri(null);
    setBackUri(null);
  };

  const statusInfo = {
    approved: {
      color: t.success,
      icon: "checkmark-circle",
      bg: "#d1fae5",
      borderColor: "#10b981",
      title: "Identity Verified",
      desc: "Your KYC has been approved. You can post listings.",
    },
    pending: {
      color: t.warning,
      icon: "time",
      bg: "#fef3c7",
      borderColor: "#f59e0b",
      title: "KYC Under Review",
      desc: "Your documents have been submitted and are awaiting admin review.",
    },
    rejected: {
      color: t.destructive,
      icon: "close-circle",
      bg: "#fee2e2",
      borderColor: "#ef4444",
      title: "KYC Rejected",
      desc: `Reason: ${kyc?.reason ?? "Document was unclear. Please resubmit."}`,
    },
  }[currentStatus ?? ""] ?? {
    color: "#3B82F6",
    icon: "alert-circle",
    bg: "#dbeafe",
    borderColor: "#3b82f6",
    title: "KYC Not Submitted",
    desc: "Submit your identity documents to unlock listing creation.",
  };

  const DOC_TYPES: { value: DocType; label: string }[] = [
    { value: "national_id", label: "National ID" },
    { value: "passport", label: "Passport" },
    { value: "driving_license", label: "Driving License" },
  ];

  return (
    <SafeAreaView style={s.safe}>
      <View style={[s.header, { borderBottomColor: t.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
          <Ionicons name="chevron-back" size={22} color={t.text} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: t.text }]}>
          Identity Verification
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {isLoading ? (
          <ActivityIndicator color={t.primary} style={{ marginTop: 60 }} />
        ) : (
          <>
            <View
              style={[
                s.statusBanner,
                {
                  backgroundColor: statusInfo.bg,
                  borderColor: statusInfo.borderColor,
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
                <Text style={[s.statusTitle, { color: statusInfo.color }]}>
                  {statusInfo.title}
                </Text>
                <Text
                  style={[
                    s.statusDesc,
                    { color: statusInfo.color, opacity: 0.8 },
                  ]}
                >
                  {statusInfo.desc}
                </Text>
              </View>
            </View>

            {alreadySubmitted && !showForm && (
              <View
                style={[
                  s.infoGrid,
                  { backgroundColor: t.card, borderColor: t.border },
                ]}
              >
                <View style={s.infoCell}>
                  <Text style={[s.infoCellLabel, { color: t.textMuted }]}>
                    Document Type
                  </Text>
                  <Text style={[s.infoCellValue, { color: t.text }]}>
                    {kyc?.documentType?.replace(/_/g, " ") ?? "—"}
                  </Text>
                </View>
                <View
                  style={[
                    s.infoCell,
                    { borderLeftWidth: 1, borderLeftColor: t.border },
                  ]}
                >
                  <Text style={[s.infoCellLabel, { color: t.textMuted }]}>
                    Submitted At
                  </Text>
                  <Text style={[s.infoCellValue, { color: t.text }]}>
                    {kyc?.submittedAt
                      ? new Date(kyc.submittedAt).toLocaleDateString()
                      : "—"}
                  </Text>
                </View>
              </View>
            )}

            {!showForm && (
              <View style={s.actions}>
                {!alreadySubmitted && (
                  <TouchableOpacity
                    style={[s.primaryBtn, { backgroundColor: t.primary }]}
                    onPress={() => setShowForm(true)}
                  >
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={16}
                      color="#fff"
                    />
                    <Text style={s.primaryBtnText}>Submit KYC</Text>
                  </TouchableOpacity>
                )}
                {currentStatus === "rejected" && (
                  <TouchableOpacity
                    style={[s.primaryBtn, { backgroundColor: t.primary }]}
                    onPress={() => setShowForm(true)}
                  >
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={16}
                      color="#fff"
                    />
                    <Text style={s.primaryBtnText}>Resubmit KYC</Text>
                  </TouchableOpacity>
                )}
                {currentStatus === "pending" && (
                  <TouchableOpacity
                    style={[s.outlineBtn, { borderColor: t.border }]}
                    onPress={handleEdit}
                  >
                    <Ionicons name="pencil-outline" size={16} color={t.text} />
                    <Text style={[s.outlineBtnText, { color: t.text }]}>
                      Edit Submission
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {showForm && (
              <View
                style={[
                  s.form,
                  { backgroundColor: t.card, borderColor: t.border },
                ]}
              >
                <View style={s.formHeader}>
                  <Text style={[s.formTitle, { color: t.textMuted }]}>
                    {isEditing ? "Edit KYC Submission" : "Identity Documents"}
                  </Text>
                  <TouchableOpacity
                    onPress={handleCancel}
                    style={[s.closeBtn, { backgroundColor: t.inputBg }]}
                  >
                    <Ionicons name="close" size={18} color={t.textMuted} />
                  </TouchableOpacity>
                </View>

                {isEditing && currentStatus === "pending" && (
                  <View
                    style={[
                      s.warningBox,
                      {
                        backgroundColor: `${t.warning}12`,
                        borderColor: `${t.warning}30`,
                      },
                    ]}
                  >
                    <Ionicons name="time-outline" size={14} color={t.warning} />
                    <Text style={[s.warningText, { color: t.warning }]}>
                      Editing will resubmit for review again.
                    </Text>
                  </View>
                )}

                <FL label="Document Type" />
                <View
                  style={[
                    s.selectBox,
                    { backgroundColor: t.inputBg, borderColor: t.border },
                  ]}
                >
                  {DOC_TYPES.map((dt) => (
                    <TouchableOpacity
                      key={dt.value}
                      style={[
                        s.selectOption,
                        docType === dt.value && {
                          borderColor: t.primary,
                          backgroundColor: `${t.primary}10`,
                        },
                        { borderColor: t.border },
                      ]}
                      onPress={() => setDocType(dt.value)}
                    >
                      <Text
                        style={[
                          s.selectOptionText,
                          {
                            color:
                              docType === dt.value ? t.primary : t.textMuted,
                          },
                          docType === dt.value && { fontWeight: "700" },
                        ]}
                      >
                        {dt.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <FL label="Document Number" />
                <TextInput
                  style={[
                    s.textInput,
                    {
                      backgroundColor: t.inputBg,
                      borderColor: t.border,
                      color: t.text,
                    },
                  ]}
                  placeholder={
                    isEditing
                      ? "Enter updated document number"
                      : "e.g. ET-1234567"
                  }
                  placeholderTextColor={t.textMuted}
                  value={docNumber}
                  onChangeText={setDocNumber}
                />

                <FL label="Document Images" />
                <View style={s.imagesRow}>
                  <ImageUpload
                    label="Front Side *"
                    uri={frontUri}
                    onPick={() => pickImage("front")}
                    onClear={() => setFrontUri(null)}
                    t={t}
                  />
                  <ImageUpload
                    label="Back Side"
                    uri={backUri}
                    onPick={() => pickImage("back")}
                    onClear={() => setBackUri(null)}
                    t={t}
                  />
                </View>

                <View style={s.formActions}>
                  <TouchableOpacity
                    style={[s.cancelBtn, { borderColor: t.border }]}
                    onPress={handleCancel}
                  >
                    <Text style={[s.cancelBtnText, { color: t.textMuted }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      s.submitBtn,
                      { backgroundColor: t.primary },
                      submitting && { opacity: 0.6 },
                    ]}
                    onPress={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <>
                        <Ionicons
                          name="shield-checkmark-outline"
                          size={15}
                          color="#fff"
                        />
                        <Text style={s.submitBtnText}>
                          {submitting
                            ? "Submitting..."
                            : isEditing
                              ? "Update & Resubmit"
                              : "Submit for Review"}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}

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
              <Text style={[s.infoText, { color: t.textMuted }]}>
                KYC verification is required to post listings. Documents are
                reviewed within 24–48 hours.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function FL({ label }: { label: string }) {
  return (
    <Text
      style={{
        fontSize: 10,
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

function ImageUpload({
  label,
  uri,
  onPick,
  onClear,
  t,
}: {
  label: string;
  uri: string | null;
  onPick: () => void;
  onClear: () => void;
  t: any;
}) {
  return (
    <View style={{ flex: 1 }}>
      <FL label={label} />
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
              width: 26,
              height: 26,
              alignItems: "center",
              justifyContent: "center",
            }}
            onPress={onClear}
          >
            <Ionicons name="close" size={14} color="#fff" />
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
            gap: 4,
          }}
          onPress={onPick}
        >
          <Ionicons name="cloud-upload-outline" size={22} color={t.textMuted} />
          <Text style={{ fontSize: 10, color: t.textMuted, fontWeight: "600" }}>
            Upload
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function makeStyles(t: any) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
    },
    backBtn: { marginRight: 10, padding: 2 },
    headerTitle: { fontSize: 20, fontWeight: "800" },
    scroll: { padding: 16, paddingBottom: 60 },
    statusBanner: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 12,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1.5,
      marginBottom: 18,
    },
    statusIconWrap: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    statusTitle: { fontSize: 14, fontWeight: "800", marginBottom: 3 },
    statusDesc: { fontSize: 12, lineHeight: 17 },
    infoGrid: {
      flexDirection: "row",
      borderRadius: 14,
      borderWidth: 1,
      overflow: "hidden",
      marginBottom: 18,
    },
    infoCell: { flex: 1, padding: 14 },
    infoCellLabel: {
      fontSize: 9,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 4,
    },
    infoCellValue: {
      fontSize: 14,
      fontWeight: "700",
      textTransform: "capitalize",
    },
    actions: { gap: 10, marginBottom: 18 },
    primaryBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: 14,
      paddingVertical: 14,
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
    },
    outlineBtnText: { fontWeight: "700", fontSize: 14 },
    form: {
      borderRadius: 18,
      borderWidth: 1,
      padding: 18,
      marginBottom: 18,
      gap: 14,
    },
    formHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    formTitle: {
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    closeBtn: {
      width: 30,
      height: 30,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    warningBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 10,
      borderRadius: 10,
      borderWidth: 1,
    },
    warningText: { fontSize: 12, fontWeight: "600", flex: 1 },
    selectBox: {
      flexDirection: "row",
      borderRadius: 10,
      overflow: "hidden",
      marginBottom: 4,
    },
    selectOption: {
      flex: 1,
      paddingVertical: 10,
      alignItems: "center",
      borderWidth: 1.5,
    },
    selectOptionText: {
      fontSize: 11,
      fontWeight: "600",
      textTransform: "capitalize",
    },
    textInput: {
      borderRadius: 12,
      borderWidth: 1.5,
      paddingHorizontal: 14,
      paddingVertical: 13,
      fontSize: 14,
    },
    imagesRow: { flexDirection: "row", gap: 12 },
    formActions: { flexDirection: "row", gap: 10 },
    cancelBtn: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 13,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelBtnText: { fontSize: 14, fontWeight: "700" },
    submitBtn: {
      flex: 2,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
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
    infoText: { flex: 1, fontSize: 13, lineHeight: 18 },
  });
}
