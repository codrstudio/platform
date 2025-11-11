import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useModules } from '@/hooks/useJQEL';
import { toastWarning } from '@/lib/toast';

interface ModuleBrowserProps {
  excludeModuleIds: string[];
  onAddModules: (moduleIds: string[]) => void;
  onClose: () => void;
}

export function ModuleBrowser({ excludeModuleIds, onAddModules, onClose }: ModuleBrowserProps) {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  const { data: modulesResult } = useModules();
  const allModules = modulesResult?.data || [];
  const availableModules = allModules.filter(m => !excludeModuleIds.includes(m.moduleId));

  const filteredModules = useMemo(() => {
    let filtered = availableModules;

    // Busca por nome/descrição
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(m =>
        m.name.toLowerCase().includes(searchLower) ||
        (m.description?.toLowerCase().includes(searchLower) ?? false)
      );
    }

    // Filtro por categoria
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(m => m.category === categoryFilter);
    }

    return filtered;
  }, [availableModules, search, categoryFilter]);

  function validateDependencies(moduleIds: string[]): { valid: boolean; missing: string[] } {
    const selectedModules = allModules.filter(m => moduleIds.includes(m.moduleId));
    const alreadyActive = allModules.filter(m => excludeModuleIds.includes(m.moduleId));

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

  const handleConfirm = () => {
    const validation = validateDependencies(selectedModules);

    if (!validation.valid) {
      const missingNames = validation.missing
        .map(id => allModules.find(m => m.moduleId === id)?.name || id)
        .join(', ');
      toastWarning('Dependências faltantes', {
        description: `Os seguintes módulos são necessários: ${missingNames}`
      });
      return;
    }

    onAddModules(selectedModules);
    onClose();
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Adicionar Módulos ao Portal</DialogTitle>
        </DialogHeader>

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
              {module.dependencies && module.dependencies.length > 0 && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Dependências: {module.dependencies.join(', ')}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {filteredModules.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum módulo encontrado
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedModules.length === 0}
          >
            Adicionar {selectedModules.length} módulo(s)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
