import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useLoginMutation } from '../../store/apis/userApi';
import { setUser } from '../../store/slices/userSlice';
import { useAppDispatch } from '../../store/hooks';
import { saveToken, saveUser } from '../../lib/storage';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../hooks/useTheme';

export default function LoginScreen() {
  const t = useTheme();
  const s = makeStyles(t);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Invalid email';
    if (!password) e.password = 'Password is required';
    return e;
  };

  const handleLogin = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    try {
      const res = await login({ email, password }).unwrap();
      if (res.success && res.data) {
        await saveToken(res.data.token);
        await saveUser(res.data.user);
        dispatch(setUser({ user: res.data.user, token: res.data.token }));
        Toast.show({ type: 'success', text1: 'Signed in successfully!' });
        router.replace('/(tabs)/');
      }
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err?.data?.message ?? 'Sign in failed. Please try again.' });
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Logo area */}
          <View style={s.logoArea}>
            <View style={s.logoIcon}>
              <Ionicons name="business" size={32} color="#fff" />
            </View>
            <Text style={s.appName}>DigitalBroker</Text>
          </View>

          {/* Heading */}
          <View style={s.heading}>
            <Text style={s.title}>Welcome back</Text>
            <Text style={s.subtitle}>Sign in to your account to continue</Text>
          </View>

          {/* Form */}
          <View style={s.form}>
            <Field
              label="Email" icon="mail-outline" placeholder="name@example.com"
              value={email} onChangeText={v => { setEmail(v); setErrors(e => ({ ...e, email: undefined })); }}
              error={errors.email} keyboardType="email-address" autoCapitalize="none" t={t}
            />
            <Field
              label="Password" icon="lock-closed-outline" placeholder="••••••••"
              value={password} onChangeText={v => { setPassword(v); setErrors(e => ({ ...e, password: undefined })); }}
              error={errors.password} secureTextEntry={!showPass}
              rightIcon={showPass ? 'eye-off-outline' : 'eye-outline'}
              onRightIconPress={() => setShowPass(p => !p)} t={t}
            />

            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={s.forgotRow}>
              <Text style={[s.forgotText, { color: t.primary }]}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[s.submitBtn, isLoading && { opacity: 0.7 }]} onPress={handleLogin} disabled={isLoading}>
              {isLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={s.submitBtnText}>Sign In</Text>
              }
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={s.footer}>
            <Text style={s.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={[s.footerLink, { color: t.primary }]}>Create account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, icon, placeholder, value, onChangeText, error, secureTextEntry, keyboardType, autoCapitalize, rightIcon, onRightIconPress, t }: any) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ fontSize: 13, fontWeight: '700', color: t.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
      <View style={[{
        flexDirection: 'row', alignItems: 'center', gap: 10,
        backgroundColor: t.inputBg, borderRadius: 14, paddingHorizontal: 14,
        borderWidth: 1.5, borderColor: error ? t.destructive : t.border,
      }]}>
        <Ionicons name={icon} size={18} color={t.textMuted} />
        <TextInput
          style={{ flex: 1, paddingVertical: 14, fontSize: 15, color: t.text }}
          placeholder={placeholder} placeholderTextColor={t.textMuted}
          value={value} onChangeText={onChangeText}
          secureTextEntry={secureTextEntry} keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? 'none'}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={{ padding: 2 }}>
            <Ionicons name={rightIcon} size={18} color={t.textMuted} />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={{ color: t.destructive, fontSize: 12, marginTop: 4, marginLeft: 4 }}>{error}</Text>}
    </View>
  );
}

function makeStyles(t: any) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    scroll: { padding: 24, paddingTop: 20, flexGrow: 1, justifyContent: 'center', minHeight: '100%' },
    logoArea: { alignItems: 'center', marginBottom: 36 },
    logoIcon: { width: 72, height: 72, borderRadius: 22, backgroundColor: t.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    appName: { fontSize: 22, fontWeight: '900', color: t.primary, letterSpacing: 0.5 },
    heading: { marginBottom: 28 },
    title: { fontSize: 28, fontWeight: '800', color: t.text, marginBottom: 6 },
    subtitle: { fontSize: 15, color: t.textMuted, lineHeight: 22 },
    form: { marginBottom: 24 },
    forgotRow: { alignItems: 'flex-end', marginBottom: 20, marginTop: -4 },
    forgotText: { fontSize: 13, fontWeight: '700' },
    submitBtn: { backgroundColor: t.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
    submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 16, letterSpacing: 0.3 },
    footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
    footerText: { fontSize: 14, color: t.textMuted },
    footerLink: { fontSize: 14, fontWeight: '700' },
  });
}
