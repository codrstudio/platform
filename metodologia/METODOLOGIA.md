# Metodologias de Desenvolvimento

**Versão:** 1.0  
**Data:** 2025-11-05

---

## Visão Geral

Este documento descreve duas metodologias para implementar a plataforma. Ambas garantem cobertura completa das especificações, mas com óticas diferentes.

---

## Método 1: Task-Driven (Sistêmico)

### Estrutura
```
INCREMENTO
  └─ SISTEMA
      └─ COMPONENTE
          └─ TAREFA
```

### Características

**Ótica:** Visão arquitetural e sistêmica. Pensa em "construir a fundação, depois as paredes, depois o teto".

**Controle:** O plano define QUE problema resolver e em QUE ordem. O engenheiro decide COMO resolver.

**Granularidade:** Alta. Cada tarefa cobre poucas especificações (mais atômica).

**Waves:** Um componente = uma wave possível. Agrupa tarefas correlatas para aproveitar contexto.

### Exemplo
```
INCREMENTO: Platform Core
  └─ SISTEMA: Autenticação
      └─ COMPONENTE: JWT Implementation
          ├─ TAREFA: Implementar geração de tokens
          │   Refs: SPEC-authentication.md (SPEC-AU-LO-013, SPEC-AU-LO-014)
          │
          └─ TAREFA: Implementar validação de tokens
              Refs: SPEC-authentication.md (SPEC-AU-AZ-001:004)
```

### Quando usar
- Projetos de infraestrutura/plataforma
- Quando a sequência técnica importa
- Quando quer garantir arquitetura sólida desde o início

---

## Método 2: Value-Driven (User-Centric)

### Estrutura
```
INITIATIVE
  └─ EPIC
      └─ STORY
```

### Características

**Ótica:** Experiência do usuário. Pensa em "o que o usuário precisa fazer".

**Controle:** O plano define QUAL valor entregar. O engenheiro decide O QUÊ fazer e COMO fazer.

**Granularidade:** Baixa. Cada story cobre várias especificações (mais abrangente).

**Waves:** Uma story = uma wave possível. Entrega valor completo ao usuário.

### Formato da Story
```
Como [usuário/sistema],
Quero [ação],
Para [objetivo]

Refs: [especificações relevantes]
```

### Exemplo
```
INITIATIVE: Platform Core
  └─ EPIC: Sistema de Autenticação
      └─ STORY: Login com credenciais
          
          Como usuário,
          Quero fazer login com usuário e senha,
          Para acessar o sistema de forma segura
          
          Refs: SPEC-authentication.md (SPEC-AU-LO-*)
```

### Quando usar
- Produtos voltados ao usuário final
- Quando quer maximizar flexibilidade técnica
- Quando o valor de negócio é mais importante que arquitetura

---

## Validação de Cobertura

Ambos os métodos garantem 100% de cobertura das especificações.

### Mecanismo
Cada tarefa/story referencia specs usando:
- **Código exato:** `SPEC-AU-001`
- **Range:** `SPEC-AU-001:005` (do 001 ao 005)
- **Wildcard:** `SPEC-AU-*` (todas do grupo)

### Validação
1. Listar todas as specs nos arquivos SPEC-*.md
2. Listar todas as specs referenciadas no plano
3. Calcular diferença (specs não cobertas)

Se diff = 0, cobertura = 100%.

---

## Experimento

Os dois métodos serão testados em paralelo no mesmo projeto. Ao final, será avaliado qual produziu:
- Melhor qualidade de código
- Melhor aderência às specs
- Melhor velocidade de desenvolvimento
- Melhor satisfação do implementador

---

## Próximos Passos

1. Criar `PLAN-METHOD1.md` (Task-Driven)
2. Criar `PLAN-METHOD2.md` (Value-Driven)
3. Implementar usando ambos os métodos
4. Comparar resultados