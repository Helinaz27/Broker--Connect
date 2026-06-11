// constants/api.ts
// =====================================================
// IMPORTANT: Replace YOUR_COMPUTER_IP with your actual
// local IP address (run: hostname -I | awk '{print $1}')
// Both phone and laptop must be on the SAME Wi-Fi!
// =====================================================
// export const API_BASE_URL = "http://10.2.23.163:5000/api";
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;
// Android emulator: 'http://10.0.2.2:5000/api'
// iOS simulator:    'http://localhost:5000/api'
