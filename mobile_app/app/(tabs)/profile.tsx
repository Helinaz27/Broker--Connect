// app/(tabs)/profile.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import { RootState } from "../../store/store";
import { clearUser, updateUser } from "../../store/slices/userSlice";
import {
  clearAll,
  getToken,
  getSavedUser,
  saveToken,
  saveUser,
} from "../../lib/storage";
import { useGetMyKYCStatusQuery } from "../../store/apis/kycApi";
import { useGetMyAccessesQuery } from "../../store/apis/accessApi";
import { useGetCoinBalanceQuery } from "../../store/apis/paymentApi";
import {
  useUpdateProfileMutation,
  useChangePasswordMutation,
} from "../../store/apis/userApi";
import { useTheme, useThemeContext } from "../../hooks/useTheme";

export default function ProfileScreen() {
  const t = useTheme();
  const { isDark, toggleTheme } = useThemeContext();
  const dispatch = useDispatch();
  const router = useRouter();
  const currentUser = useSelector((s: RootState) => s.user.currentUser);
  const token = useSelector((s: RootState) => s.user.token);
  const [refreshing, setRefreshing] = useState(false);

  // Edit profile state
  const [editVisible, setEditVisible] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation();

  // Change password state
  const [pwVisible, setPwVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changePassword, { isLoading: changingPw }] =
    useChangePasswordMutation();

  useEffect(() => {
    if (!currentUser) {
      (async () => {
        const tk = await getToken();
        const u = await getSavedUser();
        if (tk && u) dispatch(updateUser(u));
      })();
    } else {
      setFirstName(currentUser.firstName ?? "");
      setLastName(currentUser.lastName ?? "");
      setPhone(currentUser.phone ?? "");
    }
  }, [currentUser]);

  const { data: kycData, refetch: refetchKYC } = useGetMyKYCStatusQuery(
    undefined,
    { skip: !token },
  );
  const { data: accessData, refetch: refetchAccess } = useGetMyAccessesQuery(
    { page: 1, limit: 3 },
    { skip: !token },
  );
  const { data: balanceData, refetch: refetchBalance } = useGetCoinBalanceQuery(
    undefined,
    { skip: !token },
  );

  const kyc = kycData?.data;
  const accesses = accessData?.data?.accesses ?? [];
  const coins = balanceData?.data?.coins ?? currentUser?.coins ?? 0;

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchKYC(), refetchAccess(), refetchBalance()]);
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await clearAll();
          dispatch(clearUser());
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const handleEditProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert("Required", "First and last name are required.");
      return;
    }
    try {
      const res = await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      }).unwrap();
      if (res.success && res.data?.user) {
        dispatch(updateUser(res.data.user));
        await saveUser(res.data.user);
        setEditVisible(false);
        Alert.alert("Success", "Profile updated.");
      }
    } catch (e: any) {
      Alert.alert("Error", e?.data?.message ?? "Could not update profile.");
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Required", "All fields are required.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Mismatch", "New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Too Short", "New password must be at least 6 characters.");
      return;
    }
    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
      }).unwrap();
      if (res.success) {
        setPwVisible(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        Alert.alert("Success", "Password changed successfully.");
      }
    } catch (e: any) {
      Alert.alert("Error", e?.data?.message ?? "Could not change password.");
    }
  };

  const s = makeStyles(t);

  if (!currentUser) {
    useEffect(() => {
      router.replace("/(auth)/login");
    }, []);
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
        <ActivityIndicator color={t.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  const initials =
    `${currentUser.firstName?.[0] ?? ""}${currentUser.lastName?.[0] ?? ""}`.toUpperCase();
  const kycStatus = currentUser.isKYCVerified
    ? "approved"
    : (kyc?.status ?? null);
  const kycColor =
    kycStatus === "approved"
      ? t.success
      : kycStatus === "pending"
        ? t.warning
        : t.textMuted;
  const kycLabel =
    kycStatus === "approved"
      ? "Verified"
      : kycStatus === "pending"
        ? "Under Review"
        : "Not Verified";
  const kycIcon =
    kycStatus === "approved"
      ? "shield-checkmark"
      : kycStatus === "pending"
        ? "time"
        : "shield-outline";

  return (
    <SafeAreaView style={s.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={t.primary}
          />
        }
      >
        {/* Avatar & name */}
        <View style={s.avatarSection}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <Text style={s.name}>
            {currentUser.firstName} {currentUser.lastName}
          </Text>
          <Text style={s.email}>{currentUser.email}</Text>
          <View style={s.coinsRow}>
            <Ionicons name="logo-bitcoin" size={14} color={t.primary} />
            <Text style={s.coinsText}>{coins.toLocaleString()} coins</Text>
          </View>
        </View>

        {/* KYC status */}
        <TouchableOpacity
          style={[
            s.kycBanner,
            { backgroundColor: `${kycColor}10`, borderColor: `${kycColor}30` },
          ]}
          onPress={() => router.push("/kyc")}
        >
          <Ionicons name={kycIcon as any} size={20} color={kycColor} />
          <View style={{ flex: 1 }}>
            <Text style={[s.kycLabel, { color: kycColor }]}>
              KYC: {kycLabel}
            </Text>
            {kycStatus !== "approved" && (
              <Text style={s.kycSub}>Tap to verify your identity</Text>
            )}
          </View>
          <Ionicons name="chevron-forward" size={16} color={kycColor} />
        </TouchableOpacity>

        {/* Settings rows */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>Account</Text>

          <SettingRow
            icon="person-outline"
            label="Edit Profile"
            t={t}
            onPress={() => setEditVisible(true)}
          />
          <SettingRow
            icon="lock-closed-outline"
            label="Change Password"
            t={t}
            onPress={() => setPwVisible(true)}
          />
          <SettingRow
            icon="grid-outline"
            label="My Dashboard"
            t={t}
            onPress={() => router.push("/dashboard" as any)}
          />
          <SettingRow
            icon="list-outline"
            label="My Listings"
            t={t}
            onPress={() => router.push("/dashboard/my-listings" as any)}
          />
          <SettingRow
            icon="heart-outline"
            label="Unlocked Contacts"
            t={t}
            onPress={() => router.push("/unlocked-listings" as any)}
            last
          />
        </View>

        <View style={s.section}>
          <Text style={s.sectionLabel}>Preferences</Text>

          {/* Dark mode toggle */}
          <View style={[s.settingRow, s.settingRowLast]}>
            <View
              style={[s.settingIcon, { backgroundColor: `${t.primary}12` }]}
            >
              <Ionicons
                name={isDark ? "moon" : "sunny-outline"}
                size={18}
                color={t.primary}
              />
            </View>
            <Text style={s.settingLabel}>
              {isDark ? "Dark Mode" : "Light Mode"}
            </Text>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: t.border, true: `${t.primary}60` }}
              thumbColor={isDark ? t.primary : "#fff"}
            />
          </View>
        </View>

        {/* Sign out */}
        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={t.destructive} />
          <Text style={[s.logoutText, { color: t.destructive }]}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Edit Profile Modal ────────────────────────────────────── */}
      {editVisible && (
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Edit Profile</Text>
              <TouchableOpacity
                onPress={() => setEditVisible(false)}
                style={s.closeBtn}
              >
                <Ionicons name="close" size={20} color={t.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={s.fieldLabel}>First Name</Text>
            <View style={s.inputWrap}>
              <TextInput
                style={s.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="First name"
                placeholderTextColor={t.textMuted}
              />
            </View>

            <Text style={s.fieldLabel}>Last Name</Text>
            <View style={s.inputWrap}>
              <TextInput
                style={s.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Last name"
                placeholderTextColor={t.textMuted}
              />
            </View>

            <Text style={s.fieldLabel}>Phone</Text>
            <View style={s.inputWrap}>
              <TextInput
                style={s.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+251..."
                placeholderTextColor={t.textMuted}
                keyboardType="phone-pad"
              />
            </View>

            <View style={s.sheetActions}>
              <TouchableOpacity
                style={s.cancelBtn}
                onPress={() => setEditVisible(false)}
              >
                <Text style={[s.cancelText, { color: t.textMuted }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  s.saveBtn,
                  { backgroundColor: t.primary },
                  updating && { opacity: 0.6 },
                ]}
                onPress={handleEditProfile}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={s.saveBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* ── Change Password Modal ─────────────────────────────────── */}
      {pwVisible && (
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Change Password</Text>
              <TouchableOpacity
                onPress={() => setPwVisible(false)}
                style={s.closeBtn}
              >
                <Ionicons name="close" size={20} color={t.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={s.fieldLabel}>Current Password</Text>
            <View style={s.inputWrap}>
              <TextInput
                style={[s.input, { flex: 1 }]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Current password"
                placeholderTextColor={t.textMuted}
                secureTextEntry={!showCurrent}
              />
              <TouchableOpacity onPress={() => setShowCurrent((v) => !v)}>
                <Ionicons
                  name={showCurrent ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={t.textMuted}
                />
              </TouchableOpacity>
            </View>

            <Text style={s.fieldLabel}>New Password</Text>
            <View style={s.inputWrap}>
              <TextInput
                style={[s.input, { flex: 1 }]}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="New password"
                placeholderTextColor={t.textMuted}
                secureTextEntry={!showNew}
              />
              <TouchableOpacity onPress={() => setShowNew((v) => !v)}>
                <Ionicons
                  name={showNew ? "eye-off-outline" : "eye-outline"}
                  size={18}
                  color={t.textMuted}
                />
              </TouchableOpacity>
            </View>

            <Text style={s.fieldLabel}>Confirm New Password</Text>
            <View style={s.inputWrap}>
              <TextInput
                style={s.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor={t.textMuted}
                secureTextEntry
              />
            </View>

            <View style={s.sheetActions}>
              <TouchableOpacity
                style={s.cancelBtn}
                onPress={() => setPwVisible(false)}
              >
                <Text style={[s.cancelText, { color: t.textMuted }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  s.saveBtn,
                  { backgroundColor: t.primary },
                  changingPw && { opacity: 0.6 },
                ]}
                onPress={handleChangePassword}
                disabled={changingPw}
              >
                {changingPw ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={s.saveBtnText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

function SettingRow({ icon, label, t, onPress, last }: any) {
  return (
    <TouchableOpacity
      style={[styles.settingRow, last && styles.settingRowLast]}
      onPress={onPress}
    >
      <View style={[styles.settingIcon, { backgroundColor: `${t.primary}12` }]}>
        <Ionicons name={icon} size={18} color={t.primary} />
      </View>
      <Text style={[styles.settingLabel, { color: t.text }]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={t.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  settingRowLast: { borderBottomWidth: 0 },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  settingLabel: { flex: 1, fontSize: 15, fontWeight: "500" },
});

function makeStyles(t: any) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    avatarSection: {
      alignItems: "center",
      paddingVertical: 32,
      paddingHorizontal: 20,
    },
    avatar: {
      width: 84,
      height: 84,
      borderRadius: 42,
      backgroundColor: t.primary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    avatarText: { color: "#fff", fontSize: 28, fontWeight: "800" },
    name: { fontSize: 22, fontWeight: "800", color: t.text },
    email: { fontSize: 13, color: t.textMuted, marginTop: 4 },
    coinsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginTop: 10,
      backgroundColor: `${t.primary}10`,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 5,
    },
    coinsText: { fontSize: 13, fontWeight: "700", color: t.primary },
    kycBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginHorizontal: 20,
      marginBottom: 16,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
    },
    kycLabel: { fontSize: 14, fontWeight: "700" },
    kycSub: { fontSize: 12, color: "#94A3B8", marginTop: 1 },
    section: {
      marginHorizontal: 20,
      marginBottom: 16,
      backgroundColor: t.card,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.border,
      overflow: "hidden",
    },
    sectionLabel: {
      fontSize: 10,
      fontWeight: "800",
      color: "#94A3B8",
      textTransform: "uppercase",
      letterSpacing: 1.2,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 4,
    },
    settingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
    },
    settingRowLast: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      paddingVertical: 14,
      paddingHorizontal: 16,
    },
    settingIcon: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
    },
    settingLabel: { flex: 1, fontSize: 15, fontWeight: "500", color: t.text },
    logoutBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      marginHorizontal: 20,
      marginTop: 8,
      padding: 16,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: `${t.destructive}30`,
    },
    logoutText: { fontSize: 15, fontWeight: "700" },

    // Modal
    overlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.55)",
      justifyContent: "flex-end",
    },
    sheet: {
      backgroundColor: t.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      gap: 12,
    },
    sheetHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    sheetTitle: { fontSize: 18, fontWeight: "800", color: t.text },
    closeBtn: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: t.inputBg,
      alignItems: "center",
      justifyContent: "center",
    },
    fieldLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: t.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.8,
    },
    inputWrap: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: t.inputBg,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 4,
      borderWidth: 1.5,
      borderColor: t.border,
    },
    input: { flex: 1, fontSize: 14, color: t.text, paddingVertical: 12 },
    sheetActions: { flexDirection: "row", gap: 10, marginTop: 8 },
    cancelBtn: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 13,
      borderWidth: 1.5,
      borderColor: t.border,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelText: { fontSize: 14, fontWeight: "700" },
    saveBtn: {
      flex: 2,
      borderRadius: 12,
      paddingVertical: 13,
      alignItems: "center",
      justifyContent: "center",
    },
    saveBtnText: { color: "#fff", fontWeight: "800", fontSize: 14 },
  });
}
