/**
 * Hook para pegar o usuário autenticado no client-side
 * Retorna null enquanto carrega ou se não estiver autenticado
 */

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/app/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    
    // Busca usuário inicial
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Escuta mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []); // ✅ Array vazio - só executa uma vez

  return { user, loading, userId: user?.id };
}
