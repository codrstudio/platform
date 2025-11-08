# PLAN_3-Setup-UI-Improvements.md - Melhorias de UI/UX do Módulo Setup

**Objetivo**: Corrigir problemas identificados na análise de conformidade (85%) do módulo Setup, implementar funcionalidades faltantes e melhorar experiência do usuário.

**⚠️ DEPENDÊNCIAS**:
- PLAN_1-SSE-Anonymous.md (SSE funcionando para sync)
- PLAN_2-State-Management-Zustand.md (ConfigStore para cache)

---

## 📋 RESUMO EXECUTIVO

### Problemas Identificados
1. ❌ **Botões não funcionais** - "Adicionar Módulo", "Nova Instância", "Configurar"
2. ❌ **Cards para rotas inexistentes** - RealmForm aponta para rotas não implementadas
3. ❌ **Dados hardcoded** - Dashboard e PlatformSettings com dados mockados
4. ⚠️ **Falta InstanceForm** - Impossível criar/editar instâncias via UI
5. ⚠️ **UX de tema não intuitiva** - 2 abas lado a lado confunde usuário

### Solução (Baseada em Padrões)
- ✅ **Remover/implementar botões** conforme análise de prioridade
- ✅ **Module Browser (Dialog)** com busca, filtros e preview
- ✅ **InstanceForm dinâmico** baseado em schema do módulo
- ✅ **ThemeConfig melhorado** com estados locked/unlocked
- ✅ **Dados reais via JQEL** substituindo hardcoded

---

## 🎯 FASE 1: CORREÇÕES CRÍTICAS (PRIORIDADE 1)

### 1.1. Remover Cards de Rotas Inexistentes (RealmForm)

- [ ] Abrir `src/frontend/src/modules/setup/pages/RealmForm.tsx`
- [ ] Localizar seção que renderiza cards após edição
- [ ] Identificar cards:
  - [ ] "Tema do Reino" → `/setup/realms/:realmId/theme` (NÃO EXISTE)
  - [ ] "Portais do Reino" → `/setup/realms/:realmId/portals` (NÃO EXISTE)
- [ ] **Opção A: Remover cards completamente**
  ```typescript
  // Comentar ou deletar
  {/* <Card>
    <CardHeader>
      <CardTitle>Tema do Reino</CardTitle>
    </CardHeader>
  </Card> */}
  ```
- [ ] **Opção B: Desabilitar com tooltip**
  ```typescript
  <Card className="opacity-50 cursor-not-allowed">
    <CardHeader>
      <CardTitle>Tema do Reino (Em breve)</CardTitle>
      <CardDescription>Funcionalidade será implementada em versão futura</CardDescription>
    </CardHeader>
  </Card>
  ```
- [ ] Escolher Opção A (remover) - **RECOMENDADO**
- [ ] ✅ **Checkpoint**: RealmForm sem links quebrados

**Leitura de Referência**:
- `spec/pending-decisions/ui-setup-realm-system.md` (seção 3.3 - Ajustes Necessários)
- `.tmp/resumo-implementacao-vs-spec.md` (seção Remover Cards para Rotas Inexistentes)

### 1.2. Remover Botão "Adicionar Módulo" Não Funcional

- [ ] Abrir `src/frontend/src/modules/setup/pages/PortalModules.tsx`
- [ ] Localizar linhas 120-123:
  ```typescript
  <Button variant="outline">
    <Plus className="h-4 w-4 mr-2" />
    Adicionar Módulo
  </Button>
  ```
- [ ] Deletar completamente (será substituído na Fase 2)
- [ ] ✅ **Checkpoint**: Botão não funcional removido

### 1.3. Adicionar realmId em PortalList

- [ ] Abrir `src/frontend/src/modules/setup/pages/PortalList.tsx`
- [ ] Localizar onde renderiza cards de portais
- [ ] Adicionar Badge mostrando reino:
  ```typescript
  <div className="flex items-center gap-2">
    <CardTitle>{portal.name}</CardTitle>
    <Badge variant="outline" className="text-xs">
      Reino: {portal.realmId}
    </Badge>
  </div>
  ```
- [ ] Ou criar linha separada:
  ```typescript
  <p className="text-sm text-muted-foreground">
    Reino: <span className="font-medium">{portal.realmId}</span>
  </p>
  ```
- [ ] ✅ **Checkpoint**: PortalList exibe reino de cada portal

### 1.4. Testar Fase 1 Completa

**Checklist de Testes**:
- [ ] **Teste 1: RealmForm Limpo**
  - [ ] Navegar para `/setup/realms/:realmId`
  - [ ] Verificar que não há cards clicáveis para rotas inexistentes
  - [ ] ✅ **Verificar**: Sem links quebrados

- [ ] **Teste 2: PortalModules Limpo**
  - [ ] Navegar para `/setup/portals/main/modules`
  - [ ] Verificar botão "Adicionar Módulo" removido
  - [ ] ✅ **Resultado**: Sem botões enganosos

- [ ] **Teste 3: PortalList com Reino**
  - [ ] Navegar para `/setup/portals`
  - [ ] Verificar cada card mostra realmId
  - [ ] ✅ **Verificar**: Informação de reino visível

**✅ CHECKPOINT FASE 1**: Problemas críticos de UX corrigidos

---

## 🎯 FASE 2: MODULE BROWSER (PRIORIDADE 1)

### 2.1. Criar Componente ModuleBrowser

- [ ] Criar `src/frontend/src/modules/setup/components/ModuleBrowser.tsx`
- [ ] Definir interface:
  ```typescript
  interface ModuleBrowserProps {
    portalId: string;
    excludeModuleIds: string[]; // Módulos já adicionados
    onAddModules: (moduleIds: string[]) => void;
    onClose: () => void;
  }
  ```
- [ ] Implementar estrutura base com Dialog do shadcn/ui:
  ```typescript
  import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

  export function ModuleBrowser({ portalId, excludeModuleIds, onAddModules, onClose }: ModuleBrowserProps) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Módulos ao Portal</DialogTitle>
          </DialogHeader>
          {/* Conteúdo será implementado */}
        </DialogContent>
      </Dialog>
    );
  }
  ```
- [ ] ✅ **Checkpoint**: Dialog base criado

**Leitura de Referência**:
- `spec/pending-decisions/ui-setup-realm-system.md` (seção 4.2 - Componentes a Criar)

### 2.2. Implementar Busca e Filtros

- [ ] Adicionar estado local:
  ```typescript
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  ```
- [ ] Buscar módulos disponíveis:
  ```typescript
  const { data: modulesResult } = useModules();
  const allModules = modulesResult?.data || [];
  const availableModules = allModules.filter(m => !excludeModuleIds.includes(m.moduleId));
  ```
- [ ] Implementar busca com debounce:
  ```typescript
  import { useMemo } from 'react';

  const filteredModules = useMemo(() => {
    let filtered = availableModules;

    // Busca por nome/descrição
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(searchLower) ||
        m.description.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por categoria
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(m => m.category === categoryFilter);
    }

    return filtered;
  }, [availableModules, search, categoryFilter]);
  ```
- [ ] Renderizar Input de busca e Select de categoria:
  ```typescript
  <div className="flex gap-4 mb-4">
    <Input
      placeholder="Buscar por nome ou descrição..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="flex-1"
    />
    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Categoria" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas</SelectItem>
        <SelectItem value="components">Componentes</SelectItem>
        <SelectItem value="functionality">Funcionalidades</SelectItem>
      </SelectContent>
    </Select>
  </div>
  ```
- [ ] ✅ **Checkpoint**: Busca e filtros funcionam

### 2.3. Renderizar Cards de Módulos

- [ ] Implementar grid de módulos:
  ```typescript
  <div className="grid gap-4 md:grid-cols-2">
    {filteredModules.map(module => (
      <Card key={module.moduleId} className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{module.name}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  v{module.version}
                </Badge>
                {module.category && (
                  <Badge variant="secondary" className="text-xs capitalize">
                    {module.category}
                  </Badge>
                )}
              </div>
              <CardDescription className="mt-1">
                {module.description}
              </CardDescription>
            </div>
            <Checkbox
              checked={selectedModules.includes(module.moduleId)}
              onCheckedChange={(checked) => {
                setSelectedModules(prev =>
                  checked
                    ? [...prev, module.moduleId]
                    : prev.filter(id => id !== module.moduleId)
                );
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          {module.dependencies && module.dependencies.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Dependências: {module.dependencies.join(', ')}
            </p>
          )}
        </CardContent>
      </Card>
    ))}
  </div>
  ```
- [ ] ✅ **Checkpoint**: Módulos renderizados com seleção

### 2.4. Validar Dependências

- [ ] Criar função de validação:
  ```typescript
  function validateDependencies(moduleIds: string[]): { valid: boolean; missing: string[] } {
    const selectedModules = allModules.filter(m => moduleIds.includes(m.moduleId));
    const alreadyActive = allModules.filter(m => !excludeModuleIds.includes(m.moduleId));

    const missingDeps: string[] = [];

    selectedModules.forEach(module => {
      if (module.dependencies) {
        module.dependencies.forEach(depId => {
          const isActive = alreadyActive.some(m => m.moduleId === depId);
          const isSelected = moduleIds.includes(depId);

          if (!isActive && !isSelected && !missingDeps.includes(depId)) {
            missingDeps.push(depId);
          }
        });
      }
    });

    return { valid: missingDeps.length === 0, missing: missingDeps };
  }
  ```
- [ ] Adicionar botão de confirmar com validação:
  ```typescript
  <DialogFooter>
    <Button variant="outline" onClick={onClose}>
      Cancelar
    </Button>
    <Button
      onClick={() => {
        const validation = validateDependencies(selectedModules);

        if (!validation.valid) {
          alert(`Dependências faltantes: ${validation.missing.join(', ')}`);
          return;
        }

        onAddModules(selectedModules);
        onClose();
      }}
      disabled={selectedModules.length === 0}
    >
      Adicionar {selectedModules.length} módulo(s)
    </Button>
  </DialogFooter>
  ```
- [ ] ✅ **Checkpoint**: Validação de dependências funciona

### 2.5. Integrar ModuleBrowser em PortalModules

- [ ] Abrir `src/frontend/src/modules/setup/pages/PortalModules.tsx`
- [ ] Adicionar estado:
  ```typescript
  const [showBrowser, setShowBrowser] = useState(false);
  ```
- [ ] Adicionar botão para abrir browser (substituindo o removido):
  ```typescript
  <Button variant="outline" onClick={() => setShowBrowser(true)}>
    <Plus className="h-4 w-4 mr-2" />
    Adicionar Módulos
  </Button>
  ```
- [ ] Implementar handler de adição:
  ```typescript
  const handleAddModules = async (moduleIds: string[]) => {
    if (!portal) return;

    const newActiveModules = [...portal.activeModules, ...moduleIds];

    try {
      await updatePortalMutation.mutateAsync({
        values: { activeModules: newActiveModules },
        where: { portalId: { $eq: portalId! } },
      });
    } catch (error) {
      console.error('Error adding modules:', error);
    }
  };
  ```
- [ ] Renderizar ModuleBrowser condicionalmente:
  ```typescript
  {showBrowser && (
    <ModuleBrowser
      portalId={portalId!}
      excludeModuleIds={portal.activeModules}
      onAddModules={handleAddModules}
      onClose={() => setShowBrowser(false)}
    />
  )}
  ```
- [ ] ✅ **Checkpoint**: Module Browser integrado

### 2.6. Testar Fase 2 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Abrir Browser**
  - [ ] Clicar "Adicionar Módulos"
  - [ ] Verificar Dialog abre
  - [ ] ✅ **Verificar**: Interface responsiva e limpa

- [ ] **Teste 2: Busca**
  - [ ] Digitar "auth" no campo de busca
  - [ ] Verificar apenas módulos com "auth" no nome/descrição aparecem
  - [ ] Limpar busca, verificar todos voltam
  - [ ] ✅ **Resultado**: Busca funciona

- [ ] **Teste 3: Filtro de Categoria**
  - [ ] Selecionar categoria "Components"
  - [ ] Verificar apenas componentes listados
  - [ ] ✅ **Verificar**: Filtro funciona

- [ ] **Teste 4: Seleção Múltipla**
  - [ ] Marcar 3 checkboxes
  - [ ] Verificar botão mostra "Adicionar 3 módulo(s)"
  - [ ] Clicar adicionar
  - [ ] Verificar módulos ativados no portal
  - [ ] ✅ **Resultado**: Seleção múltipla funciona

- [ ] **Teste 5: Validação de Dependências**
  - [ ] Tentar adicionar módulo que depende de outro não ativo
  - [ ] Verificar alerta de dependências faltantes
  - [ ] Adicionar dependência também
  - [ ] Verificar sucesso
  - [ ] ✅ **Verificar**: Validação impede erros

**✅ CHECKPOINT FASE 2**: Module Browser completo e funcional

---

## 🎯 FASE 3: INSTANCE FORM (PRIORIDADE 1)

### 3.1. Criar Componente InstanceForm

- [ ] Criar `src/frontend/src/modules/setup/pages/InstanceForm.tsx`
- [ ] Estrutura base:
  ```typescript
  import { useParams, useNavigate } from 'react-router-dom';
  import { useInstance, useModule, useCreateInstance, useUpdateInstance } from '@/hooks/useJQEL';

  export function InstanceForm() {
    const { portalId, moduleId, instanceId } = useParams();
    const navigate = useNavigate();
    const isEdit = !!instanceId;

    const { data: instanceResult } = useInstance(portalId!, instanceId);
    const { data: moduleResult } = useModule(moduleId!);

    const instance = instanceResult?.data?.[0];
    const module = moduleResult?.data?.[0];

    return (
      <div className="container mx-auto p-6 space-y-8">
        {/* Implementação */}
      </div>
    );
  }
  ```
- [ ] ✅ **Checkpoint**: Componente base criado

### 3.2. Adicionar Rotas

- [ ] Abrir arquivo de rotas do módulo Setup
- [ ] Adicionar rotas de instância:
  ```typescript
  {
    path: 'portals/:portalId/modules/:moduleId/instances/new',
    element: <InstanceForm />,
  },
  {
    path: 'portals/:portalId/modules/:moduleId/instances/:instanceId',
    element: <InstanceForm />,
  },
  ```
- [ ] ✅ **Checkpoint**: Rotas configuradas

### 3.3. Implementar Formulário Dinâmico

- [ ] Adicionar estado:
  ```typescript
  const [formData, setFormData] = useState({
    instanceId: instance?.instanceId || '',
    name: instance?.name || '',
    description: instance?.description || '',
    config: instance?.config || {},
    active: instance?.active ?? true,
  });
  ```
- [ ] Renderizar campos básicos:
  ```typescript
  <Card>
    <CardHeader>
      <CardTitle>{isEdit ? 'Editar' : 'Nova'} Instância - {module?.name}</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <Label htmlFor="instanceId">ID da Instância</Label>
        <Input
          id="instanceId"
          value={formData.instanceId}
          onChange={(e) => setFormData(prev => ({ ...prev, instanceId: e.target.value }))}
          disabled={isEdit}
          placeholder="ex: main-chat"
        />
      </div>

      <div>
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Nome descritivo da instância"
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
        />
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={formData.active}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, active: checked }))}
        />
        <Label>Instância ativa</Label>
      </div>
    </CardContent>
  </Card>
  ```
- [ ] ✅ **Checkpoint**: Campos básicos renderizados

### 3.4. Implementar Configurações (Schema-based)

- [ ] Adicionar Card de configurações:
  ```typescript
  <Card>
    <CardHeader>
      <CardTitle>Configurações</CardTitle>
      <CardDescription>
        Configure parâmetros específicos do módulo {module?.name}
      </CardDescription>
    </CardHeader>
    <CardContent>
      {module?.configSchema ? (
        <div className="space-y-4">
          {Object.entries(module.configSchema).map(([key, schema]: [string, any]) => (
            <div key={key}>
              <Label htmlFor={`config-${key}`}>{schema.label || key}</Label>
              {schema.type === 'string' && (
                <Input
                  id={`config-${key}`}
                  value={formData.config[key] || ''}
                  onChange={(e) =>
                    setFormData(prev => ({
                      ...prev,
                      config: { ...prev.config, [key]: e.target.value }
                    }))
                  }
                  placeholder={schema.placeholder}
                />
              )}
              {schema.type === 'boolean' && (
                <Switch
                  checked={formData.config[key] || false}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({
                      ...prev,
                      config: { ...prev.config, [key]: checked }
                    }))
                  }
                />
              )}
              {schema.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {schema.description}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">
          Este módulo não possui configurações específicas.
        </p>
      )}
    </CardContent>
  </Card>
  ```
- [ ] ✅ **Checkpoint**: Configurações dinâmicas renderizadas

**Leitura de Referência**:
- `spec/SPEC-modules.md` - Schema de configuração de módulos

### 3.5. Implementar Salvamento

- [ ] Importar mutations:
  ```typescript
  const createMutation = useCreateInstance();
  const updateMutation = useUpdateInstance();
  ```
- [ ] Implementar handler:
  ```typescript
  const handleSave = async () => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          values: formData,
          where: {
            portalId: { $eq: portalId! },
            instanceId: { $eq: instanceId! },
          },
        });
      } else {
        await createMutation.mutateAsync({
          values: {
            ...formData,
            portalId: portalId!,
            moduleId: moduleId!,
          },
        });
      }

      navigate(`/setup/portals/${portalId}/modules/${moduleId}/instances`);
    } catch (error) {
      console.error('Error saving instance:', error);
      alert('Erro ao salvar instância');
    }
  };
  ```
- [ ] Adicionar botões:
  ```typescript
  <div className="flex gap-2 justify-end">
    <Button
      variant="outline"
      onClick={() => navigate(`/setup/portals/${portalId}/modules/${moduleId}/instances`)}
    >
      Cancelar
    </Button>
    <Button onClick={handleSave} disabled={!formData.instanceId || !formData.name}>
      {isEdit ? 'Salvar' : 'Criar'} Instância
    </Button>
  </div>
  ```
- [ ] ✅ **Checkpoint**: Salvamento funciona

### 3.6. Conectar em InstanceList

- [ ] Abrir `src/frontend/src/modules/setup/pages/InstanceList.tsx`
- [ ] Localizar botão "Nova Instância"
- [ ] Adicionar navegação:
  ```typescript
  <Button onClick={() => navigate(`/setup/portals/${portalId}/modules/${moduleId}/instances/new`)}>
    <Plus className="h-4 w-4 mr-2" />
    Nova Instância
  </Button>
  ```
- [ ] Localizar botão "Configurar" em cada card
- [ ] Adicionar navegação:
  ```typescript
  <Button
    variant="outline"
    onClick={() => navigate(`/setup/portals/${portalId}/modules/${moduleId}/instances/${instance.instanceId}`)}
  >
    <Settings className="h-4 w-4 mr-2" />
    Configurar
  </Button>
  ```
- [ ] ✅ **Checkpoint**: InstanceList com links funcionais

### 3.7. Testar Fase 3 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Criar Instância**
  - [ ] Navegar para lista de instâncias
  - [ ] Clicar "Nova Instância"
  - [ ] Preencher ID, nome, descrição
  - [ ] Configurar parâmetros (se houver)
  - [ ] Salvar
  - [ ] Verificar instância aparece na lista
  - [ ] ✅ **Verificar**: Criação funciona

- [ ] **Teste 2: Editar Instância**
  - [ ] Clicar "Configurar" em uma instância
  - [ ] Modificar nome e config
  - [ ] Salvar
  - [ ] Verificar mudanças aplicadas
  - [ ] ✅ **Resultado**: Edição funciona

- [ ] **Teste 3: Validação**
  - [ ] Tentar criar sem ID
  - [ ] Verificar botão desabilitado
  - [ ] Preencher campos obrigatórios
  - [ ] Verificar botão habilitado
  - [ ] ✅ **Verificar**: Validação funciona

**✅ CHECKPOINT FASE 3**: InstanceForm completo

---

## 🎯 FASE 4: SUBSTITUIR DADOS HARDCODED (PRIORIDADE 2)

### 4.1. Dashboard - Estatísticas Reais

- [ ] Abrir `src/frontend/src/modules/setup/pages/SetupDashboard.tsx`
- [ ] Localizar dados mockados
- [ ] Criar hook de estatísticas:
  ```typescript
  function useSetupStats() {
    const { data: realms } = useRealms();
    const { data: portals } = usePortals();
    const { data: modules } = useModules();

    return {
      realmsCount: realms?.data?.length || 0,
      portalsCount: portals?.data?.length || 0,
      modulesCount: modules?.data?.length || 0,
      activeModulesCount: portals?.data?.reduce((sum, p) => sum + p.activeModules.length, 0) || 0,
    };
  }
  ```
- [ ] Substituir dados hardcoded:
  ```typescript
  const stats = useSetupStats();

  <Card>
    <CardHeader>
      <CardTitle>Estatísticas</CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-2 gap-4">
      <div>
        <p className="text-2xl font-bold">{stats.realmsCount}</p>
        <p className="text-sm text-muted-foreground">Reinos</p>
      </div>
      <div>
        <p className="text-2xl font-bold">{stats.portalsCount}</p>
        <p className="text-sm text-muted-foreground">Portais</p>
      </div>
      {/* ... */}
    </CardContent>
  </Card>
  ```
- [ ] ✅ **Checkpoint**: Dashboard com dados reais

### 4.2. Platform Settings - Health Checks Reais

- [ ] Abrir `src/frontend/src/modules/setup/pages/PlatformSettings.tsx`
- [ ] Criar query JQEL para health:
  ```typescript
  function useSystemHealth() {
    return useQuery({
      queryKey: ['system', 'health'],
      queryFn: async () => {
        const result = await jqel({
          schema: 'system',
          select: 'health',
        });
        return result.data;
      },
      refetchInterval: 30000, // Refetch a cada 30s
    });
  }
  ```
- [ ] Substituir dados mockados:
  ```typescript
  const { data: health, isLoading } = useSystemHealth();

  {isLoading ? (
    <p>Carregando...</p>
  ) : (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant={health?.redis === 'ok' ? 'default' : 'destructive'}>
          Redis: {health?.redis}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={health?.n8n === 'ok' ? 'default' : 'destructive'}>
          n8n: {health?.n8n}
        </Badge>
      </div>
    </div>
  )}
  ```
- [ ] ✅ **Checkpoint**: PlatformSettings com dados reais

### 4.3. Testar Fase 4 Completa

**Checklist de Testes**:
- [ ] **Teste 1: Dashboard Dinâmico**
  - [ ] Abrir Dashboard
  - [ ] Verificar números corretos
  - [ ] Criar novo portal
  - [ ] Verificar contador atualiza
  - [ ] ✅ **Verificar**: Dados reais

- [ ] **Teste 2: Health Checks**
  - [ ] Abrir Platform Settings
  - [ ] Verificar status Redis e n8n
  - [ ] ✅ **Resultado**: Health real

**✅ CHECKPOINT FASE 4**: Dados hardcoded substituídos

---

## 📊 CHECKLIST GERAL DE VALIDAÇÃO

### ✅ Funcionalidades Implementadas

- [ ] **Correções Críticas**
  - [ ] Cards de rotas inexistentes removidos (RealmForm)
  - [ ] Botões não funcionais removidos (PortalModules)
  - [ ] realmId exibido em PortalList

- [ ] **Module Browser**
  - [ ] Dialog com busca e filtros
  - [ ] Cards de módulos com preview
  - [ ] Seleção múltipla (checkboxes)
  - [ ] Validação de dependências
  - [ ] Integração em PortalModules

- [ ] **InstanceForm**
  - [ ] Rotas create/edit configuradas
  - [ ] Formulário dinâmico baseado em schema
  - [ ] Salvamento via JQEL mutations
  - [ ] Conectado em InstanceList

- [ ] **Dados Reais**
  - [ ] Dashboard com estatísticas via JQEL
  - [ ] PlatformSettings com health checks

### ✅ Testes de Integração

- [ ] **Fluxo Adicionar Módulo**
  1. [ ] Abrir PortalModules
  2. [ ] Clicar "Adicionar Módulos"
  3. [ ] Buscar módulo específico
  4. [ ] Filtrar por categoria
  5. [ ] Selecionar múltiplos
  6. [ ] Validar dependências
  7. [ ] Confirmar adição
  8. [ ] Verificar módulos ativos

- [ ] **Fluxo Gerenciar Instância**
  1. [ ] Navegar para InstanceList
  2. [ ] Criar nova instância
  3. [ ] Configurar parâmetros
  4. [ ] Salvar
  5. [ ] Editar instância criada
  6. [ ] Modificar configurações
  7. [ ] Salvar novamente
  8. [ ] Verificar mudanças persistem

### ✅ Verificações de Código

- [ ] TypeScript sem erros (`npm run type-check`)
- [ ] Build sem warnings (`npm run build`)
- [ ] Sem console.errors no runtime
- [ ] shadcn/ui components usados corretamente
- [ ] Responsividade em mobile (DevTools → Device Mode)

---

## 📝 NOTAS DE IMPLEMENTAÇÃO

### Decisões Arquiteturais
- **Module Browser em Dialog**: Melhor que Tabs por escalabilidade (50+ módulos)
- **InstanceForm dinâmico**: Baseado em configSchema do módulo, evita código específico
- **Validação de dependências client-side**: UX melhor, server valida também
- **Stats em tempo real**: Calculado on-the-fly via reduce, sem endpoint separado

### Limitações Conhecidas
- **configSchema não padronizado**: Cada módulo define próprio schema
  - Mitigação: Suportar apenas tipos básicos (string, boolean, number)
  - Alternativa futura: JSON Schema ou Zod schema compartilhado
- **Busca client-side**: Com 1000+ módulos pode ficar lenta
  - Mitigação: Implementar debounce e paginação
  - Alternativa futura: Server-side search via JQEL
- **Health checks mock**: Backend pode não ter endpoint ainda
  - Mitigação: Retornar dados mockados se query falhar
  - Alternativa futura: Implementar /api/health no backend

### Referências
- `spec/pending-decisions/ui-setup-realm-system.md` - Análise completa UI Setup
- `spec/ui/setup-module-interfaces.md` - Especificação original (desatualizada)
- `spec/SPEC-modules.md` - Sistema de módulos e configSchema
- shadcn/ui Dialog: https://ui.shadcn.com/docs/components/dialog
- shadcn/ui Checkbox: https://ui.shadcn.com/docs/components/checkbox
