/**
 * CategoriaList - Listagem de Categorias
 * Baseado em: spec/modules/sac-module/SPEC-sac-helpdesk.md (SPEC-sac-HD-ORG-*)
 * Usa: useJQEL hooks (useJQELList, useJQELDelete)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useJQELList, useJQELDelete } from '@/hooks/useJQEL';
import type { CategoriaListItem } from '../types/categoria';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Empty } from '@/components/ui/empty';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

export default function CategoriaList() {
  const navigate = useNavigate();

  // useJQELList - hook nativo da plataforma
  const { data: result, isLoading } = useJQELList<CategoriaListItem>('sac', 'categoria');
  const deleteMutation = useJQELDelete('sac', 'categoria');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoriaToDelete, setCategoriaToDelete] = useState<number | null>(null);

  const categorias = result?.data || [];

  const handleEdit = (id: number) => {
    navigate(`/categorias/${id}`);
  };

  const handleDeleteClick = (id: number) => {
    setCategoriaToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!categoriaToDelete) return;

    try {
      await deleteMutation.mutateAsync({
        where: { DFid_categoria: { $eq: categoriaToDelete } }
      });
      toast.success('Categoria excluida com sucesso');
      setDeleteDialogOpen(false);
      setCategoriaToDelete(null);
    } catch (error) {
      toast.error('Erro ao excluir categoria');
      console.error('Delete error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!categorias || categorias.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Categorias</h1>
          <Button onClick={() => navigate('/categorias/nova')}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Categoria
          </Button>
        </div>
        <Empty
          title="Nenhuma categoria cadastrada"
          description="Comece criando sua primeira categoria para organizar os chamados."
          action={
            <Button onClick={() => navigate('/categorias/nova')}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Categoria
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categorias</h1>
        <Button onClick={() => navigate('/categorias/nova')}>
          <Plus className="mr-2 h-4 w-4" />
          Nova Categoria
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Codigo</TableHead>
              <TableHead>Descricao</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Acoes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categorias.map((categoria) => (
              <TableRow key={categoria.DFid_categoria}>
                <TableCell className="font-medium">
                  {categoria.DFnome_categoria}
                </TableCell>
                <TableCell>{categoria.DFcodigo_categoria}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {categoria.DFdescricao || '-'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: categoria.DFcor_hexadecimal }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {categoria.DFcor_hexadecimal}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={categoria.DFativo ? 'default' : 'secondary'}>
                    {categoria.DFativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(categoria.DFid_categoria)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(categoria.DFid_categoria)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusao</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta categoria? Esta acao nao pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
