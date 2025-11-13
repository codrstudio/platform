/**
 * CategoriaForm - Formulario de Criacao/Edicao de Categoria
 * Baseado em: spec/modules/sac-module/SPEC-sac-helpdesk.md (SPEC-sac-HD-ORG-*)
 * Stack: React Hook Form + Zod (spec/STACK.md)
 * Usa: useJQEL hooks (useJQELQuery, useJQELInsert, useJQELUpdate)
 */

import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Save } from 'lucide-react';
import { useJQELQuery, useJQELInsert, useJQELUpdate } from '@/hooks/useJQEL';
import type { Categoria } from '../types/categoria';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { PRIORIDADE_OPTIONS } from '../types/categoria';

// Zod Schema para validacao
const categoriaSchema = z.object({
  DFnome_categoria: z
    .string()
    .min(1, 'Nome e obrigatorio')
    .max(255, 'Nome deve ter no maximo 255 caracteres'),
  DFcodigo_categoria: z
    .string()
    .min(1, 'Codigo e obrigatorio')
    .max(50, 'Codigo deve ter no maximo 50 caracteres')
    .regex(/^[A-Z0-9_-]+$/, 'Codigo deve conter apenas letras maiusculas, numeros, _ e -'),
  DFdescricao: z.string().max(500, 'Descricao deve ter no maximo 500 caracteres').optional(),
  DFcor_hexadecimal: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal (#RRGGBB)')
    .default('#6c757d'),
  DFicone: z.string().max(50).default('tag'),
  DFprioridade_padrao: z.enum(['B', 'N', 'A', 'U']).default('N'),
  DFnivel_prioridade: z.number().int().min(1).max(10).nullable().optional(),
  DFsla_padrao_horas: z.number().int().min(1).nullable().optional(),
  DFativo: z.boolean().default(true),
  DFordem_exibicao: z.number().int().min(0).default(0),
  DFtemplate_descricao: z.string().optional(),
  DFobservacoes: z.string().optional(),
});

type CategoriaFormValues = z.infer<typeof categoriaSchema>;

export default function CategoriaForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const categoriaId = id ? parseInt(id, 10) : null;

  // useJQEL hooks nativos da plataforma
  const { data: categoriaResult, isLoading: isLoadingCategoria } = useJQELQuery<Categoria[]>({
    schema: 'sac',
    select: 'categoria',
    where: { DFid_categoria: { $eq: categoriaId } },
  }, {
    enabled: !!categoriaId,
  });

  const createMutation = useJQELInsert<Categoria>('sac', 'categoria');
  const updateMutation = useJQELUpdate<Categoria>('sac', 'categoria');

  const categoria = categoriaResult?.data?.[0];

  const form = useForm<CategoriaFormValues>({
    resolver: zodResolver(categoriaSchema),
    defaultValues: {
      DFnome_categoria: '',
      DFcodigo_categoria: '',
      DFdescricao: '',
      DFcor_hexadecimal: '#6c757d',
      DFicone: 'tag',
      DFprioridade_padrao: 'N',
      DFnivel_prioridade: null,
      DFsla_padrao_horas: null,
      DFativo: true,
      DFordem_exibicao: 0,
      DFtemplate_descricao: '',
      DFobservacoes: '',
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (isEditMode && categoria) {
      form.reset({
        DFnome_categoria: categoria.DFnome_categoria,
        DFcodigo_categoria: categoria.DFcodigo_categoria,
        DFdescricao: categoria.DFdescricao || '',
        DFcor_hexadecimal: categoria.DFcor_hexadecimal,
        DFicone: categoria.DFicone,
        DFprioridade_padrao: categoria.DFprioridade_padrao,
        DFnivel_prioridade: categoria.DFnivel_prioridade,
        DFsla_padrao_horas: categoria.DFsla_padrao_horas,
        DFativo: categoria.DFativo,
        DFordem_exibicao: categoria.DFordem_exibicao,
        DFtemplate_descricao: categoria.DFtemplate_descricao || '',
        DFobservacoes: categoria.DFobservacoes || '',
      });
    }
  }, [isEditMode, categoria, form]);

  const onSubmit = async (data: CategoriaFormValues) => {
    try {
      if (isEditMode && categoriaId) {
        await updateMutation.mutateAsync({
          values: {
            ...data,
            DFdata_ultima_atualizacao: new Date().toISOString()
          },
          where: { DFid_categoria: { $eq: categoriaId } }
        });
        toast.success('Categoria atualizada com sucesso');
      } else {
        await createMutation.mutateAsync({
          values: data
        });
        toast.success('Categoria criada com sucesso');
      }
      navigate('/categorias');
    } catch (error) {
      toast.error(isEditMode ? 'Erro ao atualizar categoria' : 'Erro ao criar categoria');
      console.error('Form submit error:', error);
    }
  };

  if (isLoadingCategoria && isEditMode) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/categorias')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditMode ? 'Editar Categoria' : 'Nova Categoria'}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Nome e Codigo */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="DFnome_categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Suporte Tecnico" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="DFcodigo_categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Codigo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: SUP-TEC" {...field} />
                  </FormControl>
                  <FormDescription>Apenas letras maiusculas, numeros, _ e -</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Descricao */}
          <FormField
            control={form.control}
            name="DFdescricao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descricao</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva o proposito desta categoria"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cor e Icone */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="DFcor_hexadecimal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cor</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input type="color" className="w-20 h-10" {...field} />
                      <Input value={field.value} onChange={field.onChange} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="DFicone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icone</FormLabel>
                  <FormControl>
                    <Input placeholder="tag" {...field} />
                  </FormControl>
                  <FormDescription>Nome do icone Lucide</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Prioridade */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="DFprioridade_padrao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prioridade Padrao</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PRIORIDADE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="DFnivel_prioridade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nivel de Prioridade</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="1-10"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? parseInt(e.target.value, 10) : null)
                      }
                    />
                  </FormControl>
                  <FormDescription>Valor numerico de 1 a 10</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* SLA e Ordem */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="DFsla_padrao_horas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SLA Padrao (horas)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ex: 24"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) =>
                        field.onChange(e.target.value ? parseInt(e.target.value, 10) : null)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="DFordem_exibicao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ordem de Exibicao</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Template de Descricao */}
          <FormField
            control={form.control}
            name="DFtemplate_descricao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template de Descricao</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Template padrao para descricao de chamados desta categoria"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Observacoes */}
          <FormField
            control={form.control}
            name="DFobservacoes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observacoes</FormLabel>
                <FormControl>
                  <Textarea placeholder="Observacoes internas sobre esta categoria" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Ativo */}
          <FormField
            control={form.control}
            name="DFativo"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Ativo</FormLabel>
                  <FormDescription>
                    Categorias inativas nao aparecem na selecao de novos chamados
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => navigate('/categorias')}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Spinner size="sm" className="mr-2" />
              )}
              <Save className="mr-2 h-4 w-4" />
              {isEditMode ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
