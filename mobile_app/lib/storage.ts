import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export async function saveToken(token: string) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}
export async function getToken(): Promise<string | null> {
  return await AsyncStorage.getItem(TOKEN_KEY);
}
export async function deleteToken() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}
export async function saveUser(user: object) {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}
export async function getSavedUser(): Promise<any | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
export async function deleteSavedUser() {
  await AsyncStorage.removeItem(USER_KEY);
}
export async function clearAll() {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}
