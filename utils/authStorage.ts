import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_tokens';
const USER_KEY = 'user_data';

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  phone: string;
  addresses?: any[];
  favorites?: string[];
}

// Store tokens in AsyncStorage
export async function storeTokens(tokens: AuthTokens): Promise<void> {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
  } catch (error) {
    console.error('Failed to store tokens:', error);
  }
}

// Retrieve tokens from AsyncStorage
export async function getTokens(): Promise<AuthTokens | null> {
  try {
    const tokens = await AsyncStorage.getItem(TOKEN_KEY);
    return tokens ? JSON.parse(tokens) : null;
  } catch (error) {
    console.error('Failed to retrieve tokens:', error);
    return null;
  }
}

// Store user data in AsyncStorage
export async function storeUser(user: User): Promise<void> {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to store user:', error);
  }
}

// Retrieve user data from AsyncStorage
export async function getUser(): Promise<User | null> {
  try {
    const user = await AsyncStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Failed to retrieve user:', error);
    return null;
  }
}

// Clear all auth data
export async function clearAuth(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  } catch (error) {
    console.error('Failed to clear auth data:', error);
  }
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const tokens = await getTokens();
  return tokens !== null && tokens.access !== null;
}
