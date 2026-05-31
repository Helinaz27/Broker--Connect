// app/_layout.tsx
import { useEffect } from "react";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { ThemeProvider } from "../hooks/useTheme";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="dashboard" options={{ headerShown: false }} />
          <Stack.Screen name="kyc/index" options={{ headerShown: false }} />
          <Stack.Screen name="chat/index" options={{ headerShown: false }} />
          <Stack.Screen
            name="notifications/index"
            options={{ headerShown: false }}
          />
        </Stack>
        <Toast />
      </ThemeProvider>
    </Provider>
  );
}
