import 'react-native-url-polyfill/auto';
import { Platform, AppState } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const extra = Constants.expoConfig?.extra ?? {};
const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? extra.supabaseUrl ?? '';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? extra.supabaseAnonKey ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY must be set.'
  );
}

/** In-memory fallback when AsyncStorage native module is null (e.g. iOS Simulator in Expo Go). */
const memoryStore = new Map<string, string>();
let useMemoryFallback: boolean | null = null;

function getAuthStorage(): {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
} {
  if (Platform.OS === 'web' && typeof localStorage !== 'undefined') {
    return {
      getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
      setItem: (key: string, value: string) => {
        localStorage.setItem(key, value);
        return Promise.resolve();
      },
      removeItem: (key: string) => {
        localStorage.removeItem(key);
        return Promise.resolve();
      },
    };
  }
  return {
    getItem: async (key: string) => {
      if (useMemoryFallback === true) return memoryStore.get(key) ?? null;
      try {
        return await AsyncStorage.getItem(key);
      } catch {
        useMemoryFallback = true;
        return memoryStore.get(key) ?? null;
      }
    },
    setItem: async (key: string, value: string) => {
      if (useMemoryFallback === true) {
        memoryStore.set(key, value);
        return;
      }
      try {
        await AsyncStorage.setItem(key, value);
      } catch {
        useMemoryFallback = true;
        memoryStore.set(key, value);
      }
    },
    removeItem: async (key: string) => {
      if (useMemoryFallback === true) {
        memoryStore.delete(key);
        return;
      }
      try {
        await AsyncStorage.removeItem(key);
      } catch {
        useMemoryFallback = true;
        memoryStore.delete(key);
      }
    },
  };
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: getAuthStorage(),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
