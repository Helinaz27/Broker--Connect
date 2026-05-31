// hooks/useTheme.tsx  ← must be .tsx not .ts
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { lightTheme, darkTheme, Theme } from "../constants/colors";

const STORAGE_KEY = "theme_preference";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  isDark: boolean;
  mode: ThemeMode;
  toggleTheme: () => void;
  setMode: (m: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  isDark: false,
  mode: "system",
  toggleTheme: () => {},
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === "light" || saved === "dark" || saved === "system") {
        setModeState(saved);
      }
      setLoaded(true);
    });
  }, []);

  const setMode = (m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m);
  };

  const isDark = mode === "system" ? systemScheme === "dark" : mode === "dark";
  const theme = isDark ? darkTheme : lightTheme;

  const toggleTheme = () => setMode(isDark ? "light" : "dark");

  const value: ThemeContextValue = {
    theme,
    isDark,
    mode,
    toggleTheme,
    setMode,
  };

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

// Drop-in for old useTheme — returns theme object only
export function useTheme(): Theme {
  return useContext(ThemeContext).theme;
}

// Use when you need toggle / isDark / mode
export function useThemeContext(): ThemeContextValue {
  return useContext(ThemeContext);
}
