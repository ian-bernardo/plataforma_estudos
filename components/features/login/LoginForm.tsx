'use client';

import { useState, FormEvent } from 'react';
import { Button, Input } from '@/components/ui';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSubmit?: (data: LoginFormData) => void | Promise<void>;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<LoginFormData> = {};

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      } else {
        // Simulação de login
        console.log('Login attempt:', formData);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof LoginFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Limpa o erro do campo quando o usuário começa a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="Email"
        type="email"
        placeholder="seu@email.com"
        value={formData.email}
        onChange={handleChange('email')}
        error={errors.email}
        disabled={isLoading}
        autoComplete="email"
      />

      <Input
        label="Senha"
        type="password"
        placeholder="••••••••"
        value={formData.password}
        onChange={handleChange('password')}
        error={errors.password}
        disabled={isLoading}
        autoComplete="current-password"
      />

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span className="ml-2 text-gray-600">Lembrar-me</span>
        </label>
        <a 
          href="#" 
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
      >
        {isLoading ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  );
}
