import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRegisterMutation } from "../../store/apis/userApi";
import { setUser } from "../../store/slices/userSlice";
import { useAppDispatch } from "../../store/hooks";
import { saveToken, saveUser } from "../../lib/storage";
import Toast from "react-native-toast-message";
import { useTheme } from "../../hooks/useTheme";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreeToTerms: boolean;
}

export default function RegisterScreen() {
  const t = useTheme();
  const s = makeStyles(t);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [register, { isLoading }] = useRegisterMutation();

  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPass, setShowPass] = useState(false);
  const [showConfPass, setShowConfPass] = useState(false);

  const set = useCallback(
    (k: keyof FormData) => (v: string | boolean) => {
      setForm((p) => ({ ...p, [k]: v }));
      setErrors((e) => {
        const n = { ...e };
        delete n[k];
        return n;
      });
    },
    [],
  );

  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Valid email required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "At least 6 characters";
    if (!form.confirmPassword)
      e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    if (!form.agreeToTerms) e.agreeToTerms = "You must agree to the terms";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) {
      setErrors(e);
      Toast.show({ type: "error", text1: Object.values(e)[0] });
      return;
    }
    try {
      const { confirmPassword, agreeToTerms, ...registerData } = form;
      const res = await register(registerData).unwrap();
      if (res.success && res.data) {
        await saveToken(res.data.token);
        await saveUser(res.data.user);
        dispatch(setUser({ user: res.data.user, token: res.data.token }));
        Toast.show({ type: "success", text1: "Account created successfully!" });
        router.replace("/(tabs)/");
      }
    } catch (err: any) {
      const msg =
        err?.data?.message ?? "Registration failed. Please try again.";
      Toast.show({ type: "error", text1: msg });
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color={t.text} />
          </TouchableOpacity>

          <Text style={[s.title, { color: t.text }]}>Create account</Text>
          <Text style={[s.subtitle, { color: t.textMuted }]}>
            Join Our Digital Broker Services
          </Text>

          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Field
                label="First name"
                placeholder="Abebe"
                icon="person-outline"
                value={form.firstName}
                onChange={set("firstName")}
                error={errors.firstName}
                t={t}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Field
                label="Last name"
                placeholder="Kebede"
                icon="person-outline"
                value={form.lastName}
                onChange={set("lastName")}
                error={errors.lastName}
                t={t}
              />
            </View>
          </View>

          <Field
            label="Email address"
            placeholder="abebe@example.com"
            icon="mail-outline"
            value={form.email}
            onChange={set("email")}
            error={errors.email}
            keyboardType="email-address"
            t={t}
          />
          <Field
            label="Phone number"
            placeholder="+251 912 345 678"
            icon="call-outline"
            value={form.phone}
            onChange={set("phone")}
            error={errors.phone}
            keyboardType="phone-pad"
            t={t}
          />
          <Field
            label="Password"
            placeholder="Create a password"
            icon="lock-closed-outline"
            value={form.password}
            onChange={set("password")}
            error={errors.password}
            secureTextEntry={!showPass}
            rightIcon={showPass ? "eye-off-outline" : "eye-outline"}
            onRightIconPress={() => setShowPass((p) => !p)}
            t={t}
          />
          <Field
            label="Confirm password"
            placeholder="Confirm your password"
            icon="lock-closed-outline"
            value={form.confirmPassword}
            onChange={set("confirmPassword")}
            error={errors.confirmPassword}
            secureTextEntry={!showConfPass}
            rightIcon={showConfPass ? "eye-off-outline" : "eye-outline"}
            onRightIconPress={() => setShowConfPass((p) => !p)}
            t={t}
          />

          <TouchableOpacity
            style={s.termsRow}
            onPress={() => set("agreeToTerms")(!form.agreeToTerms)}
          >
            <View
              style={[
                s.checkbox,
                {
                  borderColor: errors.agreeToTerms ? t.destructive : t.border,
                  backgroundColor: form.agreeToTerms
                    ? t.primary
                    : "transparent",
                },
              ]}
            >
              {form.agreeToTerms && (
                <Ionicons name="checkmark" size={13} color="#fff" />
              )}
            </View>
            <Text style={[s.termsText, { color: t.textMuted }]}>
              I agree to the{" "}
              <Text style={{ color: t.primary, fontWeight: "600" }}>
                Terms of Service
              </Text>{" "}
              and{" "}
              <Text style={{ color: t.primary, fontWeight: "600" }}>
                Privacy Policy
              </Text>
            </Text>
          </TouchableOpacity>
          {errors.agreeToTerms && (
            <Text style={[s.errorText, { color: t.destructive }]}>
              {errors.agreeToTerms}
            </Text>
          )}

          <TouchableOpacity
            style={[
              s.submitBtn,
              { backgroundColor: t.primary },
              isLoading && { opacity: 0.7 },
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.submitBtnText}>Create account</Text>
            )}
          </TouchableOpacity>

          <View style={s.footer}>
            <Text style={[s.footerText, { color: t.textMuted }]}>
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
              <Text style={[s.footerLink, { color: t.primary }]}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({
  label,
  placeholder,
  icon,
  value,
  onChange,
  error,
  secureTextEntry,
  keyboardType,
  rightIcon,
  onRightIconPress,
  t,
}: any) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 13,
          fontWeight: "500",
          color: t.textMuted,
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1.5,
          borderColor: error ? t.destructive : t.border,
          borderRadius: 10,
          backgroundColor: t.inputBg,
          paddingHorizontal: 12,
        }}
      >
        <Ionicons
          name={icon}
          size={18}
          color={t.textMuted}
          style={{ marginRight: 8 }}
        />
        <TextInput
          style={{ flex: 1, paddingVertical: 13, fontSize: 14, color: t.text }}
          placeholder={placeholder}
          placeholderTextColor={t.textMuted}
          value={value}
          onChangeText={onChange}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress}>
            <Ionicons name={rightIcon} size={18} color={t.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={{ color: t.destructive, fontSize: 12, marginTop: 3 }}>
          {error}
        </Text>
      )}
    </View>
  );
}

function makeStyles(t: any) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    scroll: { padding: 24, paddingBottom: 40 },
    backBtn: { alignSelf: "flex-start", padding: 2, marginBottom: 20 },
    title: { fontSize: 28, fontWeight: "800", marginBottom: 6 },
    subtitle: { fontSize: 15, marginBottom: 28 },
    row: { flexDirection: "row", gap: 12 },
    termsRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
      marginBottom: 8,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 5,
      borderWidth: 1.5,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 1,
    },
    termsText: { flex: 1, fontSize: 13, lineHeight: 20 },
    errorText: { fontSize: 12, marginBottom: 10 },
    submitBtn: {
      borderRadius: 12,
      paddingVertical: 15,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 16,
    },
    submitBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    footer: { flexDirection: "row", justifyContent: "center", marginTop: 24 },
    footerText: { fontSize: 14 },
    footerLink: { fontSize: 14, fontWeight: "700" },
  });
}
