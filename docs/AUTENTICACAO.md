# 🔐 Sistema de Autenticação - Supabase

## Arquivos criados/modificados:

### 1. Middleware de Proteção de Rotas
**Arquivo**: `middleware.ts` (raiz do projeto)

Protege automaticamente as rotas:
- ✅ `/painel` - Painel principal
- ✅ `/disciplinas` - Gerenciamento de disciplinas
- ✅ `/provas` - Gerenciamento de provas

**Funcionalidades**:
- Redireciona usuários não-autenticados para `/login`
- Salva a rota original para redirecionar após o login
- Redireciona usuários autenticados que tentam acessar `/login` para `/painel`
- Renova sessões automaticamente

### 2. Clientes Supabase

**Client-side**: `app/lib/supabase/client.ts`
- Usado em componentes e hooks do cliente
- Gerencia sessão no navegador

**Server-side**: `app/lib/supabase/server.ts`
- Usado em Server Components e Server Actions
- Gerencia sessão no servidor

### 3. Hook de Autenticação
**Arquivo**: `hooks/useAuth.ts`
- Atualizado para usar o novo cliente SSR

## 🚀 Como funciona:

### Fluxo de proteção:

```
1. Usuário tenta acessar /painel (sem estar logado)
   ↓
2. Middleware intercepta a requisição
   ↓
3. Verifica se existe sessão
   ↓
4. Não há sessão → Redireciona para /login?redirect=/painel
   ↓
5. Usuário faz login
   ↓
6. Após login, é redirecionado para /painel
```

### Exemplo de uso:

```typescript
// Em qualquer Client Component
"use client";
import { useAuth } from '@/hooks/useAuth';

export default function MeuComponente() {
  const { user, logout } = useAuth();
  
  return (
    <div>
      <p>Bem-vindo, {user?.email}</p>
      <button onClick={logout}>Sair</button>
    </div>
  );
}
```

```typescript
// Em Server Components
import { createClient } from '@/app/lib/supabase/server';

export default async function PaginaServidor() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  return <div>Email: {user?.email}</div>;
}
```

## 🛡️ Rotas protegidas:

- `/painel` - Dashboard principal
- `/disciplinas` - Lista de disciplinas
- `/provas` - Lista de provas

## 🔓 Rotas públicas:

- `/login` - Página de login
- `/` - Página inicial (se existir)
- Arquivos estáticos (imagens, CSS, etc.)

## 📝 Para adicionar mais rotas protegidas:

Edite o array `protectedRoutes` no [middleware.ts](../middleware.ts):

```typescript
const protectedRoutes = [
  '/painel', 
  '/disciplinas', 
  '/provas',
  '/perfil',      // Nova rota
  '/configuracoes' // Nova rota
]
```

## 🔄 Refresh de Sessão:

O middleware renova automaticamente sessões expiradas usando o refresh token. Isso mantém o usuário logado sem interrupção.

## 🚪 Para fazer logout:

```typescript
const { logout } = useAuth();
await logout(); // Redireciona para /login
```
