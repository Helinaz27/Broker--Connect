import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useForgotPasswordMutation } from '../../store/apis/userApi';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../hooks/useTheme';

export default function ForgotPasswordScreen() {
  const t = useTheme();
  const s = makeStyles(t);
  const router = useRouter();
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Toast.show({ type: 'error', text1: 'Please enter a valid email.' });
      return;
    }
    try {
      await forgotPassword({ email }).unwrap();
      setSent(true);
    } catch (e: any) {
      Toast.show({ type: 'error', text1: e?.data?.message ?? 'Failed. Please try again.' });
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="chevron-back" size={22} color={t.text} />
          </TouchableOpacity>

          <View style={s.iconWrap}>
            <Ionicons name="lock-open-outline" size={36} color={t.primary} />
          </View>

          {sent ? (
            <View style={s.sentBox}>
              <Ionicons name="checkmark-circle" size={56} color={t.success} />
              <Text style={s.sentTitle}>Email Sent!</Text>
              <Text style={s.sentDesc}>Check your inbox for a password reset link. It may take a few minutes.</Text>
              <TouchableOpacity style={s.backToLogin} onPress={() => router.replace('/(auth)/login')}>
                <Text style={s.backToLoginText}>Back to Sign In</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={s.title}>Forgot Password</Text>
              <Text style={s.subtitle}>Enter your email and we'll send you a reset link.</Text>

              <View style={s.form}>
                <Text style={s.label}>Email Address</Text>
                <View style={s.inputWrap}>
                  <Ionicons name="mail-outline" size={18} color={t.textMuted} />
                  <TextInput
                    style={s.input}
                    placeholder="name@example.com"
                    placeholderTextColor={t.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onSubmitEditing={handleSubmit}
                    returnKeyType="send"
                  />
                </View>

                <TouchableOpacity style={[s.submitBtn, isLoading && { opacity: 0.7 }]} onPress={handleSubmit} disabled={isLoading}>
                  {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.submitBtnText}>Send Reset Link</Text>}
                </TouchableOpacity>
              </View>

              <View style={s.footer}>
                <Text style={s.footerText}>Remember your password? </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
                  <Text style={[s.footerLink, { color: t.primary }]}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function makeStyles(t: any) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    scroll: { padding: 24, paddingTop: 16, flexGrow: 1 },
    backBtn: { alignSelf: 'flex-start', padding: 2, marginBottom: 32 },
    iconWrap: { width: 72, height: 72, borderRadius: 22, backgroundColor: `${t.primary}15`, alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1, borderColor: `${t.primary}25` },
    title: { fontSize: 28, fontWeight: '800', color: t.text, marginBottom: 8 },
    subtitle: { fontSize: 15, color: t.textMuted, lineHeight: 22, marginBottom: 32 },
    form: { gap: 16 },
    label: { fontSize: 12, fontWeight: '700', color: t.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
    inputWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: t.inputBg, borderRadius: 14, paddingHorizontal: 14, borderWidth: 1.5, borderColor: t.border },
    input: { flex: 1, paddingVertical: 14, fontSize: 15, color: t.text },
    submitBtn: { backgroundColor: t.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
    submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 28 },
    footerText: { fontSize: 14, color: t.textMuted },
    footerLink: { fontSize: 14, fontWeight: '700' },
    sentBox: { alignItems: 'center', gap: 16, paddingTop: 40 },
    sentTitle: { fontSize: 24, fontWeight: '800', color: t.text },
    sentDesc: { fontSize: 15, color: t.textMuted, textAlign: 'center', lineHeight: 22, paddingHorizontal: 20 },
    backToLogin: { backgroundColor: t.primary, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 14, marginTop: 12 },
    backToLoginText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  });
}
