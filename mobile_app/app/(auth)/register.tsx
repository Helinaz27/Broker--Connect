import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  KeyboardAvoidingView, Platform, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRegisterMutation } from '../../store/apis/userApi';
import { setUser } from '../../store/slices/userSlice';
import { useAppDispatch } from '../../store/hooks';
import { saveToken, saveUser } from '../../lib/storage';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../hooks/useTheme';

export default function RegisterScreen() {
  const t = useTheme();
  const s = makeStyles(t);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [register, { isLoading }] = useRegisterMutation();

  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (k: string) => (v: string) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.firstName.trim()) e.firstName = 'Required';
    if (!form.lastName.trim()) e.lastName = 'Required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
    if (!form.phone.trim()) e.phone = 'Required';
    if (form.password.length < 6) e.password = 'At least 6 characters';
    return e;
  };

  const handleRegister = async () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    try {
      const res = await register(form).unwrap();
      if (res.success && res.data) {
        await saveToken(res.data.token);
        await saveUser(res.data.user);
        dispatch(setUser({ user: res.data.user, token: res.data.token }));
        Toast.show({ type: 'success', text1: 'Account created! Welcome aboard 🎉' });
        router.replace('/(tabs)/');
      }
    } catch (err: any) {
      Toast.show({ type: 'error', text1: err?.data?.message ?? 'Registration failed.' });
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
              <Ionicons name="chevron-back" size={22} color={t.text} />
            </TouchableOpacity>
          </View>

          <View style={s.heading}>
            <Text style={s.title}>Create account</Text>
            <Text style={s.subtitle}>Join DigitalBroker and start browsing.</Text>
          </View>

          <View style={s.form}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Field label="First Name" icon="person-outline" placeholder="John" value={form.firstName} onChangeText={set('firstName')} error={errors.firstName} t={t} />
              </View>
              <View style={{ flex: 1 }}>
                <Field label="Last Name" icon="person-outline" placeholder="Doe" value={form.lastName} onChangeText={set('lastName')} error={errors.lastName} t={t} />
              </View>
            </View>
            <Field label="Email" icon="mail-outline" placeholder="name@example.com" value={form.email} onChangeText={set('email')} error={errors.email} keyboardType="email-address" t={t} />
            <Field label="Phone" icon="call-outline" placeholder="+251 9XX XXX XXX" value={form.phone} onChangeText={set('phone')} error={errors.phone} keyboardType="phone-pad" t={t} />
            <Field label="Password" icon="lock-closed-outline" placeholder="Min 6 characters" value={form.password} onChangeText={set('password')} error={errors.password} secureTextEntry={!showPass} rightIcon={showPass ? 'eye-off-outline' : 'eye-outline'} onRightIconPress={() => setShowPass(p => !p)} t={t} />

            <TouchableOpacity style={[s.submitBtn, isLoading && { opacity: 0.7 }]} onPress={handleRegister} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={s.submitBtnText}>Create Account</Text>}
            </TouchableOpacity>
          </View>

          <View style={s.footer}>
            <Text style={s.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={[s.footerLink, { color: t.primary }]}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, icon, placeholder, value, onChangeText, error, secureTextEntry, keyboardType, rightIcon, onRightIconPress, t }: any) {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ fontSize: 12, fontWeight: '700', color: t.textMuted, marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: t.inputBg, borderRadius: 12, paddingHorizontal: 12, borderWidth: 1.5, borderColor: error ? t.destructive : t.border }}>
        <Ionicons name={icon} size={17} color={t.textMuted} />
        <TextInput
          style={{ flex: 1, paddingVertical: 13, fontSize: 14, color: t.text }}
          placeholder={placeholder} placeholderTextColor={t.textMuted}
          value={value} onChangeText={onChangeText}
          secureTextEntry={secureTextEntry} keyboardType={keyboardType}
          autoCapitalize="none"
        />
        {rightIcon && <TouchableOpacity onPress={onRightIconPress}><Ionicons name={rightIcon} size={17} color={t.textMuted} /></TouchableOpacity>}
      </View>
      {error && <Text style={{ color: t.destructive, fontSize: 11, marginTop: 3, marginLeft: 2 }}>{error}</Text>}
    </View>
  );
}

function makeStyles(t: any) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: t.background },
    scroll: { padding: 24, paddingBottom: 40 },
    header: { marginBottom: 8 },
    backBtn: { padding: 2, alignSelf: 'flex-start' },
    heading: { marginBottom: 24 },
    title: { fontSize: 28, fontWeight: '800', color: t.text, marginBottom: 6 },
    subtitle: { fontSize: 15, color: t.textMuted },
    form: { marginBottom: 20 },
    submitBtn: { backgroundColor: t.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
    submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
    footer: { flexDirection: 'row', justifyContent: 'center' },
    footerText: { fontSize: 14, color: t.textMuted },
    footerLink: { fontSize: 14, fontWeight: '700' },
  });
}
