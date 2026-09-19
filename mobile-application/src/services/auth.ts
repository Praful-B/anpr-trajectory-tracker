import * as SecureStore from 'expo-secure-store';
import { authApi, setAuthToken } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_ROLE_KEY = 'user_role';
const USER_EMAIL_KEY = 'user_email';
const DEVICE_ID_KEY = 'device_id';

let deviceId: string | null = null;

export const getDeviceId = async (): Promise<string> => {
  if (deviceId) return deviceId;
  
  try {
    const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (stored) {
      deviceId = stored;
      return deviceId;
    }
    
    deviceId = 'device_' + Math.random().toString(36).substring(2, 15);
    await AsyncStorage.setItem(DEVICE_ID_KEY, deviceId!);
    return deviceId!;
  } catch {
    deviceId = 'device_' + Math.random().toString(36).substring(2, 15);
    return deviceId;
  }
};

export const clearDeviceId = async () => {
  deviceId = null;
  await AsyncStorage.removeItem(DEVICE_ID_KEY);
};

export interface AuthUser {
  email: string;
  role: string;
  accessToken: string;
  refreshToken: string;
}

export const saveAuth = async (user: AuthUser) => {
  await SecureStore.setItemAsync(TOKEN_KEY, user.accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, user.refreshToken);
  await SecureStore.setItemAsync(USER_ROLE_KEY, user.role);
  await SecureStore.setItemAsync(USER_EMAIL_KEY, user.email);
  setAuthToken(user.accessToken);
};

export const loadAuth = async (): Promise<AuthUser | null> => {
  try {
    const accessToken = await SecureStore.getItemAsync(TOKEN_KEY);
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    const role = await SecureStore.getItemAsync(USER_ROLE_KEY);
    const email = await SecureStore.getItemAsync(USER_EMAIL_KEY);

    if (accessToken && refreshToken && role && email) {
      setAuthToken(accessToken);
      return { email, role, accessToken, refreshToken };
    }
    return null;
  } catch {
    return null;
  }
};

export const clearAuth = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_ROLE_KEY);
  await SecureStore.deleteItemAsync(USER_EMAIL_KEY);
  setAuthToken(null);
  await clearDeviceId();
};

export const refreshAuthToken = async (): Promise<boolean> => {
  try {
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    if (!refreshToken) return false;

    const response = await authApi.refresh(refreshToken);
    await saveAuth({
      email: response.email,
      role: response.role,
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    });
    return true;
  } catch {
    return false;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  const user = await loadAuth();
  return user !== null;
};

export const isCop = async (): Promise<boolean> => {
  const user = await loadAuth();
  return user?.role === 'COP';
};

export const isDevice = async (): Promise<boolean> => {
  const user = await loadAuth();
  return user?.role === 'DEVICE' || user?.role === 'VOLUNTEER';
};
