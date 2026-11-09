import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!url || !key) {
  throw new Error(
    'Variáveis do Supabase ausentes. Confira o .env e reinicie com: npx expo start -c',
  );
}

// Sem limite de tempo, uma requisição para um servidor que sumiu (sem
// recusar a conexão) fica esperando para sempre — e a tela, "carregando"
// para sempre. Com o limite, ela falha com "timed out", que o friendlyError
// traduz para "Sem conexão com a internet.".
const REQUEST_TIMEOUT_MS = 8000;

const fetchWithTimeout: typeof fetch = (input, init) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  // Respeita também um cancelamento pedido por quem chamou.
  init?.signal?.addEventListener('abort', () => controller.abort());
  return fetch(input, { ...init, signal: controller.signal })
    .catch((error: unknown) => {
      if (controller.signal.aborted && !init?.signal?.aborted) {
        throw new Error('Request timed out');
      }
      throw error;
    })
    .finally(() => clearTimeout(timer));
};

export const supabase = createClient(url, key, {
  global: { fetch: fetchWithTimeout },
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Renova o token só enquanto o app está em primeiro plano.
AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});
