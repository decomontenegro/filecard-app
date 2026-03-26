import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://tfaxxthjniwnyzuzxloh.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmYXh4dGhqbml3bnl6dXp4bG9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzMTk5MDEsImV4cCI6MjA4ODg5NTkwMX0.2tIGaIYJKUXo4VD_s0SQlq3BuP4QBT9AaZ3vKC5SveM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
