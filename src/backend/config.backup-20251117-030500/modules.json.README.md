# modules.json - Documentação

## ⚠️ ATENÇÃO - ARQUIVO SINCRONIZADO

Este arquivo DEVE estar sincronizado com:
📄 `src/frontend/src/modules/index.ts`

## Comportamento

**IMPORTANTE:** Este JSON define os metadados dos módulos que aparecem na tela "Adicionar Módulos ao Portal" do Setup.

O backend **filtra automaticamente** este arquivo e retorna apenas os módulos que estão no array `ACTIVE_MODULES` do `index.ts`.

## Workflow

### ✅ Adicionar módulo:
1. Adicionar ao array `ACTIVE_MODULES` no `index.ts`
2. Adicionar import no `index.ts`
3. Adicionar entrada JSON abaixo com os campos obrigatórios

### ✅ Remover módulo:
1. Remover do array `ACTIVE_MODULES` no `index.ts`
2. Comentar import no `index.ts`
3. (Opcional) Marcar `"enabled": false` neste JSON para referência

## Campos Obrigatórios

- **moduleId**: string (mesmo ID do manifest do módulo)
- **name**: string (nome exibido na UI)
- **description**: string (descrição do módulo)
- **type**: `"functionality"` | `"component"`
- **dependencies**: string[] (IDs de módulos dependentes)
- **version**: string (versão semântica)
- **enabled**: boolean (se aparece na lista de módulos disponíveis)

## Notas

- JSON não suporta comentários nativamente, por isso esta documentação está em arquivo separado
- O primeiro elemento do array NÃO pode ser um objeto de comentários (causa erro de validação Zod)
