"use client";

import { useState, FormEvent } from "react";
import { Button, Input } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const { login, isLoading, error: authError } = useAuth();

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.email) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 6) {
      newErrors.password = "Senha deve ter no mínimo 6 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    await login(formData);
  };

  const handleChange =
    (field: keyof LoginFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
      // Limpa o erro do campo quando o usuário começa a digitar
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Mostra erro de autenticação */}
      {authError && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {authError.message}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        placeholder="seu@email.com"
        value={formData.email}
        onChange={handleChange("email")}
        error={errors.email}
        disabled={isLoading}
        autoComplete="email"
      />

      <Input
        label="Senha"
        type="password"
        placeholder="••••••••"
        value={formData.password}
        onChange={handleChange("password")}
        error={errors.password}
        disabled={isLoading}
        autoComplete="current-password"
      />

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            disabled={isLoading}
          />
          <span className="ml-2 text-gray-600">Lembrar-me</span>
        </label>
        <a
          href="/recuperar-senha"
          className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          Esqueceu a senha?
        </a>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full"
        isLoading={isLoading}
        disabled={isLoading}
      >
        {isLoading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
