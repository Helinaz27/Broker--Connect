import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { useDispatch } from 'react-redux';
import { store } from '../store/store';
import { setUser } from '../store/slices/userSlice';
import { getToken, getSavedUser } from '../lib/storage';
import { useColorScheme } from 'react-native';

export default function Index() {
  const router = useRouter();
  const dispatch = useDispatch();
  const scheme = useColorScheme();
  const bg = scheme === 'dark' ? '#0F1117' : '#FFFFFF';
  const primary = '#0066FF';

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        const user = await getSavedUser();
        if (token && user) {
          dispatch(setUser({ token, user }));
          router.replace('/(tabs)/');
        } else {
          router.replace('/(auth)/login');
        }
      } catch {
        router.replace('/(auth)/login');
      }
    })();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: bg }}>
      <ActivityIndicator color={primary} size="large" />
    </View>
  );
}
