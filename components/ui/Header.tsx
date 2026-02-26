"use client";

import { LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUser } from "@/hooks/useUser";

export default function Header() {
  const { logout, isLoading } = useAuth();
  const { user } = useUser();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--card)] border-b border-[var(--border)] backdrop-blur-sm bg-opacity-80">
      <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-[var(--foreground)]">
            Plataforma de Estudos
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2 text-sm text-[var(--foreground)] opacity-80">
              <User className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
          )}
          
          <button
            onClick={logout}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-4 h-4" />
            {isLoading ? "Saindo..." : "Sair"}
          </button>
        </div>
      </div>
    </header>
  );
}
