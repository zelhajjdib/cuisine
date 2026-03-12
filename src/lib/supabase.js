import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Variables manquantes. Copiez .env.example vers .env et remplissez les valeurs.'
  );
}

export const supabase = createClient(
  supabaseUrl ?? 'https://placeholder.supabase.co',
  supabaseAnonKey ?? 'placeholder'
);

// ─── Helpers de conversion camelCase ↔ snake_case ────────────────────────────

const toSnake = (str) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const toCamel = (str) =>
  str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

/** Convertit un objet JS (camelCase) en objet SQL (snake_case) */
export const toSnakeCase = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [toSnake(k), v])
  );

/** Convertit un objet SQL (snake_case) en objet JS (camelCase) */
export const toCamelCase = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [toCamel(k), v])
  );

/** Convertit un tableau d'objets SQL → JS */
export const rowsToCamel = (rows) =>
  rows ? rows.map(toCamelCase) : [];
