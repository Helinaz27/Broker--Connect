// constants/colors.ts
export const Colors = {
  primary: '#0066FF',
  primaryLight: '#3385FF',
  primaryDark: '#0052CC',
  background: '#FFFFFF',
  backgroundDark: '#0F1117',
  card: '#F8F9FA',
  cardDark: '#1C1E26',
  border: '#E2E8F0',
  borderDark: '#2D3748',
  text: '#0F1117',
  textDark: '#F8F9FA',
  textMuted: '#64748B',
  textMutedDark: '#94A3B8',
  destructive: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
  white: '#FFFFFF',
  black: '#000000',
};

export type Theme = {
  primary: string;
  background: string;
  card: string;
  border: string;
  text: string;
  textMuted: string;
  destructive: string;
  success: string;
  warning: string;
  inputBg: string;
  tabBar: string;
  tabBarBorder: string;
  shadow: string;
};

export const lightTheme: Theme = {
  primary: '#0066FF',
  background: '#FFFFFF',
  card: '#F8F9FA',
  border: '#E2E8F0',
  text: '#0F1117',
  textMuted: '#64748B',
  destructive: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
  inputBg: '#F1F5F9',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  shadow: 'rgba(0,0,0,0.06)',
};

export const darkTheme: Theme = {
  primary: '#3B82F6',
  background: '#0F1117',
  card: '#1C1E26',
  border: '#2D3748',
  text: '#F8F9FA',
  textMuted: '#94A3B8',
  destructive: '#EF4444',
  success: '#22C55E',
  warning: '#F59E0B',
  inputBg: '#252836',
  tabBar: '#1C1E26',
  tabBarBorder: '#2D3748',
  shadow: 'rgba(0,0,0,0.3)',
};
