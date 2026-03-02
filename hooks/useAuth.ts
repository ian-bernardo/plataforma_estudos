"use client";

import { useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import { useRouter } from "next/navigation";

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthError {
  message: string;
  field?: "email" | "password" | "general";
}

export function useAuth() {
  const [error, setError] = useState<AuthError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const login = async ({ email, password }: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (supabaseError) {
        // Traduz erros comuns do Supabase
        const errorMessage = translateSupabaseError(supabaseError.message);
        setError({ message: errorMessage, field: "general" });
        return { success: false, error: errorMessage };
      }

      if (data.session) {
        // Login bem sucedido, redireciona
        router.push("/painel");
        return { success: true, user: data.user };
      }

      return { success: false, error: "Erro desconhecido" };
    } catch (err) {
      const errorMessage = "Erro ao conectar com o servidor";
      setError({ message: errorMessage, field: "general" });
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      router.push("/login");
    } catch (err) {
      console.error("Erro ao fazer logout:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    logout,
    error,
    isLoading,
  };
}

function translateSupabaseError(error: string): string {
  const errorMap: Record<string, string> = {
    "Invalid login credentials": "Email ou senha incorretos",
    "Email not confirmed":
      "Email não confirmado. Verifique sua caixa de entrada",
    "User not found": "Usuário não encontrado",
    "Invalid email": "Email inválido",
  };

  return errorMap[error] || "Erro ao fazer login. Tente novamente";
}
