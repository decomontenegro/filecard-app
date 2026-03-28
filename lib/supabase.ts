import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hardcoded for web build — env vars not being inlined by Metro bundler
// Project: boneco2 (kqvbdkukykyoozseluza) — migrated 2026-03-28 (old project paused)
const supabaseUrl = 'https://kqvbdkukykyoozseluza.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxdmJka3VreWt5b296c2VsdXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDcwMzgsImV4cCI6MjA5MDI4MzAzOH0.DQwmnL2_cHKHlzm18cpn1y7WOn1OzK_kS140XsCZnJM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
