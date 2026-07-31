import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token_v1';

export async function saveToken(token: string) {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (err) {
    // ignore
  }
}

export async function loadToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (err) {
    return null;
  }
}

export async function clearToken() {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (err) {
    // ignore
  }
}
