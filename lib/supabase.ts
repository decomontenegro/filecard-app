import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fonte única de config Supabase do app.
// Mantida centralizada aqui para evitar hardcodes espalhados pela UI.
export const SUPABASE_URL = 'https://kqvbdkukykyoozseluza.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxdmJka3VreWt5b296c2VsdXphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3MDcwMzgsImV4cCI6MjA5MDI4MzAzOH0.DQwmnL2_cHKHlzm18cpn1y7WOn1OzK_kS140XsCZnJM';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});
