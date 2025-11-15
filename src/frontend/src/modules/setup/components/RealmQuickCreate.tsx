// Realm Quick Create Component
// Inline realm creation for use in forms

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useCreateRealm } from '@/hooks/jqel/useRealm';

interface RealmQuickCreateProps {
  onRealmCreated?: (realmId: string) => void;
}

export function RealmQuickCreate({ onRealmCreated }: RealmQuickCreateProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    realmId: '',
    name: '',
    description: '',
  });

  const createRealmMutation = useCreateRealm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Impede que o evento suba para o form pai

    try {
      await createRealmMutation.mutateAsync({
        values: {
          realmId: formData.realmId,
          name: formData.name,
          description: formData.description,
          removable: true,
        }
      });

      // Notify parent component
      onRealmCreated?.(formData.realmId);

      // Reset form and close dialog
      setFormData({ realmId: '', name: '', description: '' });
      setOpen(false);
    } catch (error) {
      console.error('Error creating realm:', error);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isSaving = createRealmMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Novo Ambiente
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Criar Novo Ambiente</DialogTitle>
          <DialogDescription>
            Crie um ambiente rapidamente. Você poderá configurá-lo melhor depois.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Realm ID */}
            <div className="space-y-2">
              <Label htmlFor="quick-realmId">ID do Ambiente</Label>
              <Input
                id="quick-realmId"
                value={formData.realmId}
                onChange={(e) => handleChange('realmId', e.target.value)}
                placeholder="ex: producao"
                required
              />
              <p className="text-xs text-muted-foreground">
                Identificador único (letras minúsculas, números e hífen)
              </p>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="quick-name">Nome</Label>
              <Input
                id="quick-name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="ex: Produção"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="quick-description">Descrição (opcional)</Label>
              <Input
                id="quick-description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Breve descrição"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Criando...' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
