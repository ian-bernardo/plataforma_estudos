# 🔐 Implementação de Multi-tenancy (Dados por Usuário)

## 📋 Checklist de Implementação:

### 1. No Supabase Dashboard

Execute este SQL no **SQL Editor**:

```sql
-- 1️⃣ Adicionar coluna user_id nas tabelas
ALTER TABLE disciplinas 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE provas 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2️⃣ Ativar Row Level Security (RLS)
ALTER TABLE disciplinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE provas ENABLE ROW LEVEL SECURITY;

-- 3️⃣ Criar políticas para disciplinas
CREATE POLICY "Users can view their own disciplinas"
ON disciplinas FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own disciplinas"
ON disciplinas FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own disciplinas"
ON disciplinas FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own disciplinas"
ON disciplinas FOR DELETE
USING (auth.uid() = user_id);

-- 4️⃣ Criar políticas para provas
CREATE POLICY "Users can view their own provas"
ON provas FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own provas"
ON provas FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own provas"
ON provas FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own provas"
ON provas FOR DELETE
USING (auth.uid() = user_id);
```

### 2. No Código

#### ✅ Arquivos criados:

1. **`hooks/useUser.ts`** - Hook para pegar usuário no client-side
2. **`app/lib/supabase/helpers.ts`** - Helpers para pegar user_id no server-side

#### 📝 Como usar:

**Em Client Components:**

```typescript
"use client";
import { useUser } from '@/hooks/useUser';

function MeuComponente() {
  const { user, userId, loading } = useUser();
  
  // Ao inserir dados
  async function salvar() {
    if (!userId) return; // Verificação de segurança
    
    const { error } = await supabase.from("disciplinas").insert([
      {
        nome: "Matemática",
        user_id: userId, // ✅ Adicione o user_id
        // ... outros campos
      },
    ]);
  }
  
  // Ao buscar dados (RLS filtra automaticamente)
  async function carregar() {
    // RLS já filtra por user_id automaticamente!
    const { data } = await supabase.from("disciplinas").select("*");
    // ✅ data só contém disciplinas do usuário logado
  }
}
```

**Em Server Components:**

```typescript
import { createClient } from '@/app/lib/supabase/server';
import { getCurrentUserId } from '@/app/lib/supabase/helpers';

async function MinhaPagina() {
  const userId = await getCurrentUserId();
  const supabase = await createClient();
  
  // RLS filtra automaticamente
  const { data } = await supabase.from("disciplinas").select("*");
  
  return <div>...</div>;
}
```

### 3. Exemplo Prático - Atualizar inserção

**ANTES:**
```typescript
const { error } = await supabase.from("disciplinas").insert([
  {
    nome: novaDisciplina.nome,
    situacao: novaDisciplina.situacao,
    // ...
  },
]);
```

**DEPOIS:**
```typescript
const { userId } = useUser(); // No topo do componente

const { error } = await supabase.from("disciplinas").insert([
  {
    nome: novaDisciplina.nome,
    situacao: novaDisciplina.situacao,
    user_id: userId, // ✅ Adicione esta linha
    // ...
  },
]);
```

### 4. O que acontece com RLS ativado:

✅ **SELECT**: Retorna apenas dados onde `user_id = auth.uid()`  
✅ **INSERT**: Só permite inserir se `user_id = auth.uid()`  
✅ **UPDATE**: Só permite atualizar seus próprios dados  
✅ **DELETE**: Só permite deletar seus próprios dados  

❌ **Tentativa de acessar dados de outro usuário**: Retorna vazio (como se não existisse)

### 5. Migração de dados existentes (opcional)

Se você já tem dados sem `user_id`, pode atribuir a um usuário específico:

```sql
-- Pega o ID do primeiro usuário
SELECT id FROM auth.users LIMIT 1;

-- Atualiza dados existentes (substitua 'USER_ID_AQUI')
UPDATE disciplinas SET user_id = 'USER_ID_AQUI' WHERE user_id IS NULL;
UPDATE provas SET user_id = 'USER_ID_AQUI' WHERE user_id IS NULL;
```

### 6. Verificar se está funcionando

No Supabase Dashboard > **Table Editor**:
- Você verá a nova coluna `user_id` nas tabelas
- Dados inseridos terão o UUID do usuário
- Ao fazer queries, só verá seus próprios dados

### 7. Debug

Se algo não funcionar:

```typescript
// Ver qual usuário está logado
const { user } = useUser();
console.log('User ID:', user?.id);

// Ver se RLS está bloqueando
const { data, error } = await supabase.from("disciplinas").select("*");
console.log('Data:', data);
console.log('Error:', error); // Verá erro de RLS se houver
```

## 🎯 Resumo:

1. ✅ Execute o SQL no Supabase Dashboard
2. ✅ Use o hook `useUser()` nos componentes
3. ✅ Adicione `user_id: userId` em todos os `.insert()`
4. ✅ SELECT/UPDATE/DELETE filtram automaticamente por RLS
