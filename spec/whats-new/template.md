# YYYY-MM-DD: Título Descritivo da Mudança

## Especificações Modificadas

### SPEC-nome-do-arquivo.md
- **Seção X**: Descrição da modificação
  - Detalhe específico 1
  - Detalhe específico 2
  - Detalhe específico 3
- **Seção Y expandida**: Descrição da expansão
  - Novos requisitos adicionados
  - Conceitos estendidos

### SPEC-outro-arquivo.md
- **Nova seção Z**: Descrição do que foi adicionado
  - Requisitos principais
  - Exemplos de uso
  - Referências cruzadas

## Especificações Criadas

### SPEC-novo-arquivo.md (NOVO)
Descrição geral da nova especificação:
- Seção 1: Descrição breve
- Seção 2: Descrição breve
- Seção 3: Descrição breve
- X requisitos totais (SPEC-XXX-YYY-001 a SPEC-XXX-YYY-NNN)

---

## Guia de Uso do What's New

### Do's ✓

1. **Use data ISO no nome do arquivo**: `YYYY-MM-DD-descricao-curta.md`
   - Exemplo: `2025-11-07-realm-system.md`
   - Facilita ordenação cronológica

2. **Título com data e tema claro**: `# YYYY-MM-DD: Descrição do que mudou`
   - Seja específico sobre o impacto
   - Exemplo: `# 2025-11-07: Sistema de Reinos para Agrupamento de Portais`

3. **Organize em duas seções principais**:
   - "Especificações Modificadas" - SPECs que foram alterados
   - "Especificações Criadas" - SPECs novos

4. **Detalhe cada SPEC modificado**:
   - Nome do arquivo SPEC
   - Seções afetadas (nova, expandida, reescrita)
   - Lista de mudanças específicas
   - Use bullets para clareza

5. **Para SPECs novos, forneça visão geral**:
   - Propósito da especificação
   - Estrutura de seções principais
   - Contagem de requisitos (se relevante)

6. **Seja objetivo e técnico**:
   - Foque no "o que mudou" e "por quê"
   - Use linguagem clara e direta
   - Evite jargões desnecessários

7. **Mantenha hierarquia visual**:
   - Título H1 (`#`) para data e tema
   - Título H2 (`##`) para seções principais
   - Título H3 (`###`) para cada SPEC
   - Negrito (`**`) para destacar seções modificadas
   - Bullets (`-`) para detalhes

8. **Inclua contexto quando necessário**:
   - Se a mudança resolve um problema, mencione
   - Se afeta outras partes do sistema, liste
   - Se depreca algo, indique alternativa

### Don'ts ✗

1. **Não use datas em formato legível**:
   - ✗ "07 de novembro de 2025"
   - ✓ "2025-11-07"

2. **Não misture mudanças não relacionadas**:
   - Um What's New = uma mudança conceitual coesa
   - Se fez mudanças em temas E auth separadamente, crie dois arquivos

3. **Não omita SPECs afetados**:
   - Liste TODOS os arquivos modificados
   - Mesmo que a mudança seja pequena

4. **Não inclua código-fonte ou implementação**:
   - What's New documenta SPECS, não implementação
   - ✗ "Criar src/backend/src/services/realm.service.ts"
   - ✗ "Implementar tipos TypeScript para Reino"
   - ✗ "Atualizar ThemeProvider para resolver hierarquia"
   - ✓ "SPEC-RM-CR-001 a CR-025: CRUD de Reinos especificado"

5. **Não inclua seções de "Próximos Passos" ou "Impacto na Implementação"**:
   - What's New NÃO é roadmap
   - What's New NÃO é guia de implementação
   - What's New APENAS documenta o que foi alterado nas SPECs
   - ✗ "## Próximos Passos"
   - ✗ "## Impacto na Implementação"
   - ✗ "## Como Implementar"

6. **Não analise ou sugira implementação**:
   - What's New é descritivo, não prescritivo
   - ✗ "Backend deve criar service para..."
   - ✗ "Frontend precisa atualizar..."
   - ✓ "SPEC-RM-PS-001: Reinos devem ser armazenados em config/realms.json"

7. **Não use linguagem vaga**:
   - ✗ "Melhoramos o sistema de temas"
   - ✓ "Adicionada hierarquia de 3 níveis para resolução de tema (system → realm → portal)"

8. **Não esqueça de atualizar índices**:
   - Se houver um README.md em whats-new/, atualize
   - Se houver referências em CLAUDE.md, mencione

9. **Não duplique conteúdo das SPECs**:
   - What's New é um resumo executivo
   - Para detalhes completos, remeta à SPEC correspondente

10. **Não use emojis ou formatação excessiva**:
    - Mantenha formatação markdown simples
    - Foque em legibilidade técnica

11. **Não explique motivação ou problemas resolvidos em excesso**:
    - Uma breve menção ao contexto é OK
    - ✓ "Sistema de Reinos substitui settings-key para permitir agrupamento de portais"
    - ✗ Múltiplos parágrafos explicando problema original e solução detalhada

12. **Não inclua benefícios ou análise de valor**:
    - What's New documenta mudanças, não justifica
    - ✗ "## Benefícios: Escalabilidade, Flexibilidade..."
    - ✗ "Isso permite gerenciar dezenas de portais facilmente"

### Estrutura de Referência

```markdown
# 2025-MM-DD: Título Principal

## Especificações Modificadas

### SPEC-arquivo1.md
- **Seção modificada**: Descrição
  - Detalhe
  - Detalhe

### SPEC-arquivo2.md
- **Nova seção**: Descrição

## Especificações Criadas

### SPEC-novo.md (NOVO)
Descrição geral:
- Seção 1: Breve descrição
- Seção 2: Breve descrição
```

### Exemplo Real

Consulte `spec/whats-new/2025-01-07-shadcn-ui-optimization.md` para ver um What's New completo e bem estruturado.
