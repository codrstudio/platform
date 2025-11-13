/**
 * Categoria - Types e Interfaces
 * Baseado em: sac.TBcategoria
 * Referencia: spec/modules/sac-module/database-schema/sac.TBcategoria.sql
 */

/**
 * Tipo de prioridade padrao
 */
export type PrioridadePadrao = 'B' | 'N' | 'A' | 'U'; // B=Baixa, N=Normal, A=Alta, U=Urgente

/**
 * Interface completa da entidade Categoria (campos do banco)
 */
export interface Categoria {
  DFid_categoria: number;
  DFnome_categoria: string;
  DFcodigo_categoria: string;
  DFdescricao: string | null;
  DFid_categoria_pai: number | null;
  DFcor_hexadecimal: string; // Default: '#6c757d'
  DFicone: string; // Default: 'tag'
  DFprioridade_padrao: PrioridadePadrao; // Default: 'N'
  DFnivel_prioridade: number | null;
  DFsla_padrao_horas: number | null;
  DFativo: boolean; // Default: true
  DFdata_criacao: string; // ISO datetime
  DFdata_ultima_atualizacao: string | null; // ISO datetime
  DFordem_exibicao: number; // Default: 0
  DFtemplate_descricao: string | null;
  DFobservacoes: string | null;
}

/**
 * Type para formulario de criacao/edicao de Categoria
 */
export interface CategoriaFormData {
  DFnome_categoria: string;
  DFcodigo_categoria: string;
  DFdescricao?: string;
  DFid_categoria_pai?: number | null;
  DFcor_hexadecimal?: string;
  DFicone?: string;
  DFprioridade_padrao?: PrioridadePadrao;
  DFnivel_prioridade?: number | null;
  DFsla_padrao_horas?: number | null;
  DFativo?: boolean;
  DFordem_exibicao?: number;
  DFtemplate_descricao?: string;
  DFobservacoes?: string;
}

/**
 * Type para item de lista (campos essenciais para listagem)
 */
export interface CategoriaListItem {
  DFid_categoria: number;
  DFnome_categoria: string;
  DFcodigo_categoria: string;
  DFdescricao: string | null;
  DFid_categoria_pai: number | null;
  DFcor_hexadecimal: string;
  DFicone: string;
  DFativo: boolean;
  DFordem_exibicao: number;
}

/**
 * Opcoes de prioridade para select
 */
export const PRIORIDADE_OPTIONS = [
  { value: 'B', label: 'Baixa' },
  { value: 'N', label: 'Normal' },
  { value: 'A', label: 'Alta' },
  { value: 'U', label: 'Urgente' }
] as const;
