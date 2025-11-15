# Blueprint Components

## Instance Configuration Pattern

Este diretório contém componentes de customização de instância do módulo Blueprint.

### Padrão de Nomenclatura

**Componente Principal de Configuração**: `{ModuleName}ConfigForm.tsx`

O componente principal que implementa a interface de configuração de instância deve seguir este padrão:

```typescript
// {ModuleName}ConfigForm.tsx
import type { ConfigComponentProps } from '@/types/module';

export function {ModuleName}ConfigForm({
  instanceId,
  portalId,
  moduleId,
  config,
  onSave,
  onCancel,
}: ConfigComponentProps) {
  // Implementação da configuração específica do módulo
}
```

### Componentes Auxiliares

Componentes auxiliares usados pelo ConfigForm podem ter nomenclatura livre, mas devem ser descritivos:

- `BlueprintCard.tsx` - Card genérico para layout

### Exemplo: Blueprint Module

```
blueprint/components/
├── BlueprintConfigForm.tsx    # Componente principal de configuração
└── BlueprintCard.tsx           # Componente auxiliar
```

### Interface ConfigComponentProps

```typescript
interface ConfigComponentProps {
  instanceId: string;
  portalId: string;
  moduleId: string;
  config: Record<string, any>;
  onSave: (config: Record<string, any>) => Promise<void>;
  onCancel: () => void;
}
```

### Responsabilidades

O `{ModuleName}ConfigForm` deve:

1. Renderizar formulário de configuração específico do módulo
2. Validar dados usando Zod
3. Gerenciar estado do formulário com React Hook Form
4. Chamar `onSave` com a configuração atualizada
5. Chamar `onCancel` para cancelar edição

## Blueprint Configuration

O `BlueprintConfigForm` demonstra os conceitos principais do sistema de configuração:

### Campos de Configuração (instance.config)

**Salvos via `onSave()`**:

1. **title** (string, obrigatório) - Título exibido na página do módulo
   - Default: "Blueprint Module"
   - Validação: mínimo 1 caractere

2. **description** (string, opcional) - Descrição do módulo
   - Default: vazio

3. **mainRoute** (string, obrigatório) - Rota principal customizável
   - Default: "/ola"
   - Validação: `/^\/[a-z0-9-]+$/` (deve começar com /, apenas lowercase, números e hífens)
   - Permite que o usuário customize a rota principal do módulo

### Configuração do Portal (portal.homepage)

**Homepage Toggle** - Usa o componente genérico `HomepageToggle`:

```typescript
import { HomepageToggle } from '@/components/module';

<HomepageToggle
  portalId={portalId}
  moduleRoute={config.mainRoute || '/ola'}
/>
```

- Define se este módulo é a porta de entrada do portal
- Quando ativado, usuários são redirecionados para `mainRoute` ao acessar `/`
- Usa rota customizável da instância

### Exemplo de Implementação

```typescript
// BlueprintConfigForm.tsx
import { HomepageToggle } from '@/components/module';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const schema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  mainRoute: z.string().regex(/^\/[a-z0-9-]+$/),
});

export function BlueprintConfigForm({ portalId, config, onSave }: ConfigComponentProps) {
  const { register, handleSubmit, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      title: config.title || 'Blueprint Module',
      description: config.description || '',
      mainRoute: config.mainRoute || '/ola',
    },
  });

  const mainRoute = watch('mainRoute');

  const onSubmit = async (data) => {
    await onSave(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('title')} />
      <Input {...register('description')} />
      <Input {...register('mainRoute')} />

      <HomepageToggle
        portalId={portalId}
        moduleRoute={mainRoute}
      />
    </form>
  );
}
```

## Aplicação em Outros Módulos

Este padrão deve ser seguido por todos os módulos que necessitam de customização de instância:

### Exemplo: Chat Module

```typescript
// chat/components/ChatConfigForm.tsx
import { HomepageToggle } from '@/components/module';

export function ChatConfigForm({ portalId, config, onSave }: ConfigComponentProps) {
  return (
    <form>
      {/* Configurações específicas do Chat */}

      {/* Homepage Toggle - mesmo componente! */}
      <HomepageToggle
        portalId={portalId}
        moduleRoute="/chat"  // Rota fixa ou customizável
      />
    </form>
  );
}
```

### Exemplo: Kanban Module

```typescript
// kanban/components/KanbanConfigForm.tsx
import { HomepageToggle } from '@/components/module';

export function KanbanConfigForm({ portalId, config, onSave }: ConfigComponentProps) {
  const mainRoute = config.mainRoute || '/kanban';

  return (
    <form>
      {/* Configurações do Kanban */}

      <HomepageToggle
        portalId={portalId}
        moduleRoute={mainRoute}
      />
    </form>
  );
}
```

## Componentes Compartilhados

### HomepageToggle

Localização: `@/components/module/HomepageToggle`

Componente genérico e reutilizável para definir uma rota de módulo como homepage do portal.

**Props**:
```typescript
interface HomepageToggleProps {
  portalId: string;      // ID do portal
  moduleRoute: string;   // Rota do módulo (e.g., "/ola", "/chat")
  label?: string;        // Label customizado (opcional)
}
```

**Uso**:
- Importar de `@/components/module`
- Passar `portalId` recebido via `ConfigComponentProps`
- Passar rota do módulo (fixa ou customizável via `config.mainRoute`)

**Benefícios**:
- ✅ Zero hardcoding de rotas
- ✅ Reutilizável por qualquer módulo
- ✅ Validação automática
- ✅ Toasts de feedback

---

**Referência**: Este componente demonstra os conceitos de:
- `ConfigComponentProps` (instanceId, portalId, moduleId, config, onSave, onCancel)
- Persistência de configuração via `onSave()`
- Validação com Zod + React Hook Form
- Uso de componentes compartilhados (`HomepageToggle`)
- Separação entre configuração de instância (`instance.config`) e portal (`portal.homepage`)
