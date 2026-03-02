import { createClient } from './server';

/**
 * Pega o user_id do usuário autenticado (server-side)
 * Retorna null se não estiver autenticado
 */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/**
 * Verifica se o usuário está autenticado (server-side)
 * Lança erro se não estiver
 */
export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId();
  
  if (!userId) {
    throw new Error('Usuário não autenticado');
  }
  
  return userId;
}
