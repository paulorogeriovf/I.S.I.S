// ======================================================
// CONFIGURAÇÃO PÚBLICA DO SUPABASE
// ======================================================

/**
 * Endereço público do projeto no Supabase.
 *
 * Substitua o conteúdo entre aspas pela Project URL
 * apresentada no painel do Supabase.
 */
const SUPABASE_URL =
  "https://gmtilwkszmvyqmgrjwgk.supabase.co";


/**
 * Chave pública utilizada pelo navegador.
 *
 * Utilize somente a Publishable key, normalmente iniciada
 * por "sb_publishable_".
 *
 * Nunca utilize secret key ou service_role neste arquivo.
 */
const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_ByRDHPyvTgNhSSDoEXiVWA__qOJA3pt";


/**
 * Verifica se a biblioteca oficial foi carregada antes de
 * criar a conexão.
 */
if (!window.supabase) {
  throw new Error(
    "A biblioteca do Supabase não foi carregada."
  );
}


/**
 * Cliente compartilhado por todas as páginas do site.
 */
window.supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);