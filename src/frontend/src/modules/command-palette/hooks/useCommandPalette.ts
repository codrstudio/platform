/**
 * useCommandPalette Hook
 *
 * Hook principal para gerenciamento do Command Palette.
 *
 * SPEC Compliance:
 * - SPEC-CP-I-*: Inicialização e carregamento de actions
 * - SPEC-CP-S-*: Search (busca federada)
 * - SPEC-CP-C-*: Commands (comandos rápidos)
 * - SPEC-CP-A-*: Agents (invocação de agentes)
 * - SPEC-CP-H-*: Histórico e recentes
 * - SPEC-CP-K-*: Navegação por teclado
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import type {
  CommandPaletteConfig,
  Action,
  SearchResult,
  SearchResultGroup,
  Agent,
  HistoryItem,
  InteractionType
} from '../types';

const DEFAULT_CONFIG: CommandPaletteConfig = {
  mode: 'both',
  suspendedShortcut: 'Ctrl+K',
  expandedRoute: '/search',
  maxResultsPerCategory: 5,
  debounceMs: 300,
  historyLimit: 50,
  defaultCategories: ['navigation', 'commands', 'agents', 'data', 'recent'],
  enableSearch: true,
  enableCommands: true,
  enableAgents: true
};

const HISTORY_KEY = 'command-palette:history';

/**
 * Load actions from JQEL
 * SPEC-CP-I-001 to I-004
 */
async function loadActions(): Promise<Action[]> {
  // TODO: Implement JQEL query
  // For now, return mock actions
  return [
    {
      schema: 'frontend',
      entity: 'route',
      type: 'select',
      searchable: {
        enabled: true,
        title: 'Navegar para',
        category: 'navigation',
        icon: 'navigation',
        searchFields: ['path', 'title']
      }
    },
    {
      schema: 'frontend',
      entity: 'theme',
      type: 'mutate',
      searchable: {
        enabled: true,
        title: 'Alterar Tema',
        description: 'Alternar entre tema claro e escuro',
        category: 'commands',
        icon: 'palette',
        trigger: '/tema',
        params: [
          {
            name: 'mode',
            type: 'enum',
            options: ['light', 'dark', 'system'],
            required: true
          }
        ],
        mode: 'inline'
      }
    }
  ];
}

/**
 * Load available agents
 * SPEC-CP-A-001 to A-002
 */
async function loadAgents(): Promise<Agent[]> {
  // TODO: Implement agent loading from config or JQEL
  return [
    {
      id: 'assistant',
      name: 'Assistente',
      description: 'Assistente geral para dúvidas e tarefas',
      icon: 'bot',
      provider: 'openai'
    },
    {
      id: 'analyst',
      name: 'Analista',
      description: 'Análise de dados e relatórios',
      icon: 'bar-chart',
      provider: 'claude'
    }
  ];
}

/**
 * Execute search
 * SPEC-CP-S-001 to S-008
 */
async function executeSearch(
  query: string,
  _actions: Action[],
  _config: CommandPaletteConfig
): Promise<SearchResult[]> {
  // TODO: Implement federated search across all schemas
  // For now, return mock results
  if (!query) return [];

  const results: SearchResult[] = [];

  // Search in navigation (mock)
  if (query.toLowerCase().includes('dash')) {
    results.push({
      id: 'nav-1',
      type: 'search',
      title: 'Dashboard',
      description: '/dashboard',
      icon: 'layout-dashboard',
      category: 'navigation',
      onSelect: () => window.location.href = '/dashboard'
    });
  }

  return results;
}

/**
 * Execute command
 * SPEC-CP-C-001 to C-010
 */
async function executeCommand(
  command: string,
  params: Record<string, any>,
  action: Action
): Promise<void> {
  // TODO: Implement JQEL mutation
  console.log('Execute command:', { command, params, action });
  toast.success('Comando executado com sucesso');
}

/**
 * Invoke agent
 * SPEC-CP-A-004 to A-010
 */
async function invokeAgent(
  agentId: string,
  query: string
): Promise<{ content: string; type: string; inline: boolean }> {
  // TODO: Implement agent invocation
  console.log('Invoke agent:', { agentId, query });

  return {
    content: `Resposta do agente para: ${query}`,
    type: 'text',
    inline: true
  };
}

/**
 * useCommandPalette Hook
 */
export function useCommandPalette(config: Partial<CommandPaletteConfig> = {}) {
  const fullConfig: CommandPaletteConfig = { ...DEFAULT_CONFIG, ...config };

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [actions, setActions] = useState<Action[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Detect interaction type from query (SPEC-CP-R-001)
  const interactionType: InteractionType = useMemo(() => {
    if (query.startsWith('/') && fullConfig.enableCommands) return 'command';
    if (query.startsWith('@') && fullConfig.enableAgents) return 'agent';
    return 'search';
  }, [query, fullConfig]);

  // Load actions on mount (SPEC-CP-I-001 to I-004)
  useEffect(() => {
    loadActions().then(setActions);
    loadAgents().then(setAgents);
  }, []);

  // Load history from localStorage (SPEC-CP-H-002)
  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  // Save history to localStorage
  const saveHistory = useCallback((item: HistoryItem) => {
    setHistory(prev => {
      // Check if item already exists
      const existing = prev.find(h => h.query === item.query && h.type === item.type);

      let updated: HistoryItem[];
      if (existing) {
        // Increment frequency and update timestamp
        updated = prev.map(h =>
          h.id === existing.id
            ? { ...h, timestamp: item.timestamp, frequency: h.frequency + 1 }
            : h
        );
      } else {
        // Add new item
        updated = [item, ...prev].slice(0, fullConfig.historyLimit);
      }

      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [fullConfig.historyLimit]);

  // Clear history (SPEC-CP-H-006)
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  // Debounced search (SPEC-CP-PERF-001, SPEC-CP-S-008)
  useEffect(() => {
    if (!query || interactionType === 'command' || interactionType === 'agent') {
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const searchResults = await executeSearch(query, actions, fullConfig);
        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Erro ao buscar resultados');
      } finally {
        setLoading(false);
      }
    }, fullConfig.debounceMs);

    return () => clearTimeout(timer);
  }, [query, actions, fullConfig, interactionType]);

  // Show recent items when query is empty (SPEC-CP-H-004)
  const displayResults = useMemo(() => {
    if (query) return results;

    // Show recent items
    return history
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, fullConfig.maxResultsPerCategory)
      .map(h => ({
        id: h.id,
        type: h.type,
        title: h.query,
        description: 'Recente',
        icon: 'clock',
        category: 'recent',
        onSelect: () => setQuery(h.query)
      }));
  }, [query, results, history, fullConfig.maxResultsPerCategory]);

  // Group results by category (SPEC-CP-R-004 to R-006)
  const groupedResults = useMemo<SearchResultGroup[]>(() => {
    const groups = new Map<string, SearchResult[]>();

    displayResults.forEach(result => {
      const category = result.category || 'other';
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category)!.push(result);
    });

    return Array.from(groups.entries()).map(([category, results]) => ({
      category,
      results,
      count: results.length
    }));
  }, [displayResults]);

  // Handle keyboard navigation (SPEC-CP-K-001 to K-004)
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, displayResults.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (displayResults[selectedIndex]) {
          displayResults[selectedIndex].onSelect();
          // Save to history
          saveHistory({
            id: Date.now().toString(),
            type: interactionType,
            query,
            timestamp: new Date().toISOString(),
            frequency: 1
          });
        }
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
    }
  }, [displayResults, selectedIndex, query, interactionType, saveHistory]);

  // Handle command execution (SPEC-CP-C-*)
  const handleCommand = useCallback(async (command: string, params: Record<string, any>) => {
    const action = actions.find(a => a.searchable?.trigger === command);
    if (!action) {
      toast.error('Comando não encontrado');
      return;
    }

    try {
      await executeCommand(command, params, action);
      setOpen(false);
      setQuery('');
    } catch (error) {
      console.error('Command error:', error);
      toast.error('Erro ao executar comando');
    }
  }, [actions]);

  // Handle agent invocation (SPEC-CP-A-*)
  const handleAgentInvocation = useCallback(async (agentId: string, agentQuery: string) => {
    try {
      const response = await invokeAgent(agentId, agentQuery);

      if (response.inline) {
        toast.success(response.content);
      } else {
        // TODO: Open modal with response
        console.log('Agent response (modal):', response);
      }

      setOpen(false);
      setQuery('');
    } catch (error) {
      console.error('Agent invocation error:', error);
      toast.error('Erro ao invocar agente');
    }
  }, []);

  return {
    open,
    setOpen,
    query,
    setQuery,
    loading,
    results: groupedResults,
    actions,
    agents,
    history,
    interactionType,
    selectedIndex,
    setSelectedIndex,
    handleKeyDown,
    handleCommand,
    handleAgentInvocation,
    clearHistory,
    config: fullConfig
  };
}
