# Complete Action Guide

Esquema `sac`

## 📌 Legenda de Camadas

Este guia marca actions implementadas em camadas externas ao HelpDesk:

| Marcação | Camada | Descrição |
|----------|--------|-----------|
| ⚙️ | `authz + N8N` | Actions de autenticação/autorização implementadas no componente authz + N8N (não implementar no HelpDesk) |
| ⚙️ | `N8N Workflow` | Jobs agendados, triggers e integrações implementadas no N8N (documentar, mas não implementar no HelpDesk) |
| *(sem marcação)* | HelpDesk JSQL | Actions implementadas como procedures JSQL no schema `sac` (implementar no HelpDesk) |

**Filtragem:**
- Buscar todas actions externas: `grep "⚙️"`
- Buscar apenas authz: `grep "Camada: authz"`
- Buscar apenas N8N: `grep "Camada: N8N"`
- Buscar actions HelpDesk: `grep -v "⚙️"`

---

## 🔐 Módulo: Autenticação e Controle de Acesso

### Entidade: `usuario`

- **select**
  - Obtém usuários do sistema
  - Keywords: buscar, listar, consultar, visualizar usuários
  - References: US001, US003, US004, OSD023, OSD035, UI001, UI004
  - Objeto Resposta: `JResult<Usuario[]>`

- **mutate:criar**
  - Cria novo usuário no sistema
  - Keywords: criar, cadastrar, adicionar, novo usuário
  - References: US004, US011, OSD023, WF001D
  - Objeto Resposta: `JResult<Usuario[]>`

- **mutate:atualizar**
  - Atualiza dados do usuário
  - Keywords: editar, modificar, alterar, atualizar usuário, perfil
  - References: US003, US004, US009, OSD029, UI004
  - Objeto Resposta: `JResult<Usuario[]>`

- **⚙️ mutate:autenticar**
  - **Camada:** `authz + N8N`
  - Realiza autenticação de usuário com email e senha
  - Keywords: login, autenticar, entrar, acessar
  - References: US001, OSD001, OSD004, FN001, WF001, UI001
  - Objeto Resposta:
    ```json
    JResult<{
      access_token: string,
      refresh_token: string,
      token_type: string,
      expires_in: number,
      requires_2fa: boolean,
      payload: Usuario
    }[]>
    ```

- **⚙️ mutate:renovar_token**
  - **Camada:** `authz + N8N`
  - Renova access token usando refresh token (Token Rotation)
  - Keywords: refresh, renovar token, atualizar sessão
  - References: WF001A
  - Objeto Resposta:
    ```json
    JResult<{
      access_token: string,
      refresh_token: string,
      token_type: string,
      expires_in: number
    }[]>
    ```

- **⚙️ mutate:logout**
  - **Camada:** `authz + N8N`
  - Revoga refresh token específico (logout de sessão)
  - Keywords: logout, sair, deslogar, encerrar sessão
  - References: OSD005, WF001B
  - Objeto Resposta: `JResult<{}[]>`

- **⚙️ mutate:logout_all**
  - **Camada:** `authz + N8N`
  - Revoga todos os refresh tokens do usuário (logout total)
  - Keywords: logout todos dispositivos, revogar todas sessões
  - References: WF001C
  - Objeto Resposta: `JResult<{}[]>`

- **mutate:recuperar_senha**
  - Inicia processo de recuperação de senha via email
  - Keywords: esqueci senha, recuperar senha, resetar senha
  - References: US002, OSD002, FN001, WF002, UI002
  - Objeto Resposta: `JResult<{}[]>`

- **mutate:redefinir_senha**
  - Define nova senha usando token de recuperação
  - Keywords: redefinir senha, nova senha, alterar senha
  - References: US002, OSD007, UI003
  - Objeto Resposta: `JResult<{}[]>`

- **⚙️ mutate:bloquear**
  - **Camada:** `authz + N8N`
  - Bloqueia usuário após tentativas falhadas ou manualmente
  - Keywords: bloquear, desativar, suspender usuário
  - References: US001, OSD003, OSD005, FN001, WF003
  - Objeto Resposta:
    ```json
    JResult<{
      id_usuario: number,
      bloqueado: boolean,
      data_bloqueio: string
    }[]>
    ```

- **mutate:desativar**
  - Desativa conta de usuário
  - Keywords: desativar, inativar, desabilitar conta
  - References: US004, OSD036
  - Objeto Resposta: `JResult<Usuario[]>`

- **mutate:atribuir_papel**
  - Atribui papel a usuário
  - Keywords: atribuir papel, adicionar role, conceder perfil
  - References: US004, OSD030, OSD033
  - Objeto Resposta:
    ```json
    JResult<{
      id_usuario: number,
      id_papel: number,
      data_atribuicao: string
    }[]>
    ```

- **mutate:remover_papel**
  - Remove papel de usuário
  - Keywords: remover papel, revogar role, desatribuir perfil
  - References: US004, OSD030, OSD033
  - Objeto Resposta: `JResult<{}[]>`

- **mutate:conceder_permissao**
  - Concede permissão individual (override) a usuário
  - Keywords: conceder permissão, override, exceção de acesso
  - References: US006, OSD012, OSD014, FN003
  - Objeto Resposta:
    ```json
    JResult<{
      id_usuario: number,
      id_permissao: number,
      permitido: boolean,
      data_expiracao: string,
      motivo: string
    }[]>
    ```

- **mutate:revogar_permissao**
  - Revoga permissão individual de usuário
  - Keywords: revogar permissão, remover override
  - References: US006, OSD012
  - Objeto Resposta: `JResult<{}[]>`

- **⚙️ mutate:validar_token**
  - **Camada:** `authz + N8N`
  - Valida token de recuperação de senha
  - Keywords: validar token, verificar token
  - References: OSD007
  - Objeto Resposta:
    ```json
    JResult<{
      token_valido: boolean,
      expira_em: string
    }[]>
    ```

---

### Entidade: `papel`

- **select**
  - Obtém papéis (roles) do sistema
  - Keywords: listar papéis, roles, perfis de acesso
  - References: US005, OSD008, FN002
  - Objeto Resposta: `JResult<Papel[]>`

- **mutate:criar**
  - Cria novo papel customizável
  - Keywords: criar papel, novo role, adicionar perfil
  - References: US005, OSD010, FN002
  - Objeto Resposta: `JResult<Papel[]>`

- **mutate:atualizar**
  - Atualiza papel removível (não-fixo)
  - Keywords: editar papel, atualizar role, modificar perfil
  - References: US005, OSD010
  - Objeto Resposta: `JResult<Papel[]>`

- **mutate:desativar**
  - Desativa papel (não remove, preserva histórico)
  - Keywords: desativar papel, inativar role
  - References: US005
  - Objeto Resposta: `JResult<Papel[]>`

- **mutate:atribuir_permissao**
  - Atribui permissão a papel
  - Keywords: atribuir permissão a papel, configurar role
  - References: US005, OSD011
  - Objeto Resposta:
    ```json
    JResult<{
      id_papel: number,
      id_permissao: number
    }[]>
    ```

- **mutate:remover_permissao**
  - Remove permissão de papel
  - Keywords: remover permissão de papel, desconfigurar role
  - References: US005, OSD011
  - Objeto Resposta: `JResult<{}[]>`

---

### Entidade: `permissao`

- **select**
  - Obtém catálogo de permissões do sistema
  - Keywords: listar permissões, consultar permissões, catálogo
  - References: US005, US006, OSD011
  - Objeto Resposta: `JResult<Permissao[]>`

---

### Entidade: `permissao_efetiva`

- **select**
  - Calcula e retorna permissões efetivas de um usuário
  - Keywords: permissões efetivas, permissões calculadas, acesso final
  - References: US006, OSD013, OSD032, FN003
  - Objeto Resposta: `JResult<PermissaoEfetiva[]>`

---

## 🏢 Módulo: Gestão de Clientes e Contatos

### Entidade: `cliente`

- **select**
  - Obtém clientes do sistema
  - Keywords: listar clientes, buscar cliente, consultar clientes
  - References: US007, US008, US009, OSD037, OSD039, FN004
  - Objeto Resposta: `JResult<Cliente[]>`

- **select:hierarquia**
  - Obtém estrutura hierárquica de clientes (matriz/filial)
  - Keywords: hierarquia clientes, matriz filial, estrutura organizacional
  - References: OSD038, FN004
  - Objeto Resposta:
    ```json
    JResult<{
      id_cliente: number,
      nome_cliente: string,
      id_cliente_matriz: number,
      filiais: Cliente[]
    }[]>
    ```

- **select:verificar_limite**
  - Verifica limite de chamados mensais do cliente (job)
  - Keywords: limite chamados, quota mensal, verificar limite
  - References: OSD039, WF007
  - Objeto Resposta:
    ```json
    JResult<{
      id_cliente: number,
      limite_chamados_mensal: number,
      chamados_no_mes: number,
      percentual_uso: number,
      limite_atingido: boolean
    }[]>
    ```

- **mutate:criar**
  - Cria novo cliente
  - Keywords: cadastrar cliente, novo cliente, adicionar cliente
  - References: US008, OSD037, OSD040, FN004, WF005
  - Objeto Resposta: `JResult<Cliente[]>`

- **mutate:atualizar**
  - Atualiza dados do cliente
  - Keywords: editar cliente, modificar cliente, atualizar cliente
  - References: US009, OSD043
  - Objeto Resposta: `JResult<Cliente[]>`

- **mutate:desativar**
  - Desativa cliente
  - Keywords: desativar cliente, inativar cliente
  - References: US007, OSD043
  - Objeto Resposta: `JResult<Cliente[]>`

---

### Entidade: `contato`

- **select**
  - Obtém contatos do sistema
  - Keywords: listar contatos, buscar contato, consultar contatos
  - References: US010, US011, OSD044
  - Objeto Resposta: `JResult<Contato[]>`

- **mutate:criar**
  - Cria novo contato
  - Keywords: cadastrar contato, novo contato, adicionar contato
  - References: US011, OSD044, OSD049
  - Objeto Resposta: `JResult<Contato[]>`

- **mutate:atualizar**
  - Atualiza dados do contato
  - Keywords: editar contato, modificar contato, atualizar contato
  - References: US010
  - Objeto Resposta: `JResult<Contato[]>`

- **mutate:desativar**
  - Desativa contato
  - Keywords: desativar contato, inativar contato
  - References: US010
  - Objeto Resposta: `JResult<Contato[]>`

- **mutate:vincular_usuario**
  - Vincula contato a usuário do sistema (acesso ao portal)
  - Keywords: vincular usuário, associar conta, acesso portal
  - References: US012, OSD046, OSD048, FN006, WF006
  - Objeto Resposta:
    ```json
    JResult<{
      id_contato: number,
      id_usuario: number,
      data_vinculacao: string
    }[]>
    ```

- **mutate:desvincular_usuario**
  - Desvincula contato de usuário
  - Keywords: desvincular usuário, remover vínculo
  - References: US012, FN006
  - Objeto Resposta: `JResult<{}[]>`

---

## 🎫 Módulo: Gestão de Chamados

### Entidade: `chamado`

- **select**
  - Obtém chamados do sistema
  - Keywords: listar chamados, buscar chamados, tickets
  - References: US013, US014, US017, US041, US042, US043, OSD051, FN007
  - Objeto Resposta: `JResult<Chamado[]>`

- **select:dashboard**
  - Obtém métricas agregadas de chamados para dashboard
  - Keywords: dashboard chamados, métricas, KPIs, estatísticas
  - References: US013, US030, OSD107, FN018
  - Objeto Resposta:
    ```json
    JResult<{
      total_chamados: number,
      abertos: number,
      em_andamento: number,
      finalizados: number,
      sla_vencidos: number,
      tempo_medio_resolucao: number,
      satisfacao_media: number
    }[]>
    ```

- **select:meus_chamados**
  - Obtém chamados do contato logado (portal cliente)
  - Keywords: meus chamados, chamados do cliente, portal
  - References: US042, US043, OSD186
  - Objeto Resposta: `JResult<Chamado[]>`

- **select:vencimento_sla**
  - Obtém chamados próximos do vencimento de SLA
  - Keywords: vencimento SLA, alertas, prazos
  - References: US013, OSD069, WF011
  - Objeto Resposta:
    ```json
    JResult<{
      id_chamado: number,
      protocolo_chamado: string,
      sla_vencimento_resolucao: string,
      tempo_restante_minutos: number,
      vencido: boolean
    }[]>
    ```

- **select:relatorio**
  - Gera relatório detalhado de chamados
  - Keywords: relatório chamados, exportar, análise
  - References: US031, OSD114, FN019
  - Objeto Resposta: `JResult<Chamado[]>` (com filtros aplicados)

- **select:tendencias**
  - Analisa tendências temporais de chamados
  - Keywords: tendências, análise temporal, projeção
  - References: US046, OSD111, FN021
  - Objeto Resposta:
    ```json
    JResult<{
      periodo: string,
      total_chamados: number,
      media_movel: number,
      tendencia: string,
      projecao: number
    }[]>
    ```

- **mutate:criar**
  - Cria novo chamado
  - Keywords: abrir chamado, novo ticket, criar chamado
  - References: US015, US016, OSD051, OSD052, FN007, WF008
  - Objeto Resposta: `JResult<Chamado[]>`

- **mutate:atualizar**
  - Atualiza dados do chamado
  - Keywords: editar chamado, modificar ticket, atualizar
  - References: US018, OSD054, FN007
  - Objeto Resposta: `JResult<Chamado[]>`

- **mutate:atribuir**
  - Atribui chamado a atendente
  - Keywords: atribuir chamado, designar atendente, alocar ticket
  - References: US019, OSD058, OSD061, FN008, WF010
  - Objeto Resposta:
    ```json
    JResult<{
      id_chamado: number,
      id_atendente_responsavel: number,
      data_atribuicao: string
    }[]>
    ```

- **mutate:atribuir_lote**
  - Atribui múltiplos chamados em lote
  - Keywords: atribuição em lote, atribuir múltiplos, bulk assign
  - References: US014, US019, OSD064, FN008
  - Objeto Resposta:
    ```json
    JResult<{
      chamados_atribuidos: number,
      id_atendente_responsavel: number
    }[]>
    ```

- **mutate:mudar_status**
  - Altera status do chamado
  - Keywords: mudar status, alterar status, workflow
  - References: US021, OSD065, OSD066, FN007, WF009
  - Objeto Resposta:
    ```json
    JResult<{
      id_chamado: number,
      id_status_anterior: number,
      id_status_novo: number,
      data_mudanca: string
    }[]>
    ```

- **mutate:fechar**
  - Fecha chamado resolvido
  - Keywords: fechar chamado, finalizar ticket, resolver
  - References: US022, OSD070, FN007
  - Objeto Resposta: `JResult<Chamado[]>`

- **mutate:reabrir**
  - Reabre chamado fechado
  - Keywords: reabrir chamado, reativar ticket
  - References: US022, OSD070
  - Objeto Resposta: `JResult<Chamado[]>`

- **mutate:escalar**
  - Escalação automática por vencimento de SLA
  - Keywords: escalar, escalação automática, SLA
  - References: OSD153, WF011
  - Objeto Resposta:
    ```json
    JResult<{
      id_chamado: number,
      escalado_para: number,
      motivo: string
    }[]>
    ```

- **select:comentarios**
  - Obtém comentários do chamado
  - Keywords: comentários, mensagens, interações
  - References: US017, US020, US043
  - Objeto Resposta: `JResult<ChamadoComentario[]>`

- **mutate:adicionar_comentario**
  - Adiciona comentário ao chamado
  - Keywords: comentar, adicionar comentário, mensagem
  - References: US020, OSD072, OSD073, FN009, WF012
  - Objeto Resposta: `JResult<ChamadoComentario[]>`

- **mutate:atualizar_comentario**
  - Edita comentário próprio com histórico
  - Keywords: editar comentário, modificar mensagem
  - References: US020, OSD077
  - Objeto Resposta: `JResult<ChamadoComentario[]>`

- **select:anexos**
  - Obtém anexos do chamado
  - Keywords: anexos, arquivos, documentos, downloads
  - References: US017, US042, US043
  - Objeto Resposta: `JResult<ChamadoAnexo[]>`

- **mutate:adicionar_anexo**
  - Adiciona anexo ao chamado
  - Keywords: upload, anexar arquivo, enviar documento
  - References: US015, US016, US043, OSD056, FN010, WF013
  - Objeto Resposta: `JResult<ChamadoAnexo[]>`

- **mutate:remover_anexo**
  - Remove anexo do chamado
  - Keywords: deletar anexo, remover arquivo
  - References: US017
  - Objeto Resposta: `JResult<{}[]>`

- **select:satisfacao**
  - Obtém avaliação de satisfação do chamado
  - Keywords: pesquisa satisfação, avaliação, feedback
  - References: US033, US047
  - Objeto Resposta: `JResult<ChamadoSatisfacao[]>`

- **select:analise_satisfacao**
  - Analisa dados de satisfação agregados
  - Keywords: análise satisfação, métricas satisfação, NPS
  - References: US047, OSD117, FN020
  - Objeto Resposta:
    ```json
    JResult<{
      periodo: string,
      total_avaliacoes: number,
      nota_media: number,
      nps: number,
      detratores: number,
      neutros: number,
      promotores: number
    }[]>
    ```

- **mutate:avaliar_satisfacao**
  - Cliente avalia atendimento recebido
  - Keywords: avaliar, nota, satisfação, feedback cliente
  - References: US033, OSD121, OSD127, FN020
  - Objeto Resposta: `JResult<ChamadoSatisfacao[]>`

- **⚙️ job:verificar_sla**
  - **Camada:** `N8N Workflow`
  - Job que verifica vencimentos de SLA (job a cada 15min)
  - Keywords: verificar SLA, alertas SLA, monitoramento
  - References: OSD069, WF011
  - Objeto Resposta:
    ```json
    JResult<{
      chamados_verificados: number,
      alertas_enviados: number,
      escalacoes_executadas: number
    }[]>
    ```

---

### Entidade: `status_chamado`

- **select**
  - Obtém status de chamados disponíveis
  - Keywords: status, workflow, estados
  - References: US021, US014
  - Objeto Resposta: `JResult<StatusChamado[]>`

---

### Entidade: `categoria`

- **select**
  - Obtém categorias de chamados (estrutura hierárquica)
  - Keywords: categorias, árvore, classificação
  - References: US015, US036, OSD142
  - Objeto Resposta: `JResult<Categoria[]>`

- **select:relatorio_uso**
  - Gera relatório de uso por categoria
  - Keywords: relatório categorias, estatísticas uso
  - References: US036, OSD148
  - Objeto Resposta:
    ```json
    JResult<{
      id_categoria: number,
      nome_categoria: string,
      total_chamados: number,
      tempo_medio_resolucao: number
    }[]>
    ```

- **mutate:criar**
  - Cria nova categoria ou subcategoria
  - Keywords: criar categoria, nova categoria
  - References: US036, OSD142, OSD143
  - Objeto Resposta: `JResult<Categoria[]>`

- **mutate:atualizar**
  - Atualiza categoria existente
  - Keywords: editar categoria, modificar categoria
  - References: US036
  - Objeto Resposta: `JResult<Categoria[]>`

- **mutate:reordenar**
  - Reordena categorias (drag-and-drop)
  - Keywords: reordenar, ordenar, drag-drop
  - References: US036, OSD146
  - Objeto Resposta:
    ```json
    JResult<{
      categorias_reordenadas: number
    }[]>
    ```

- **mutate:mesclar**
  - Mescla categorias duplicadas preservando histórico
  - Keywords: mesclar, unificar, consolidar categorias
  - References: US036, OSD147
  - Objeto Resposta:
    ```json
    JResult<{
      id_categoria_destino: number,
      categorias_mescladas: number,
      chamados_migrados: number
    }[]>
    ```

---

### Entidade: `prioridade`

- **select**
  - Obtém níveis de prioridade (Urgente, Alta, Normal, Baixa)
  - Keywords: prioridade, níveis, urgência
  - References: US014, US015
  - Objeto Resposta: `JResult<TipoPrioridade[]>`

---

## 💬 Módulo: Atendimento Online

### Entidade: `atendimento`

- **select**
  - Obtém atendimentos online
  - Keywords: chat, atendimentos, conversas
  - References: US024, US026
  - Objeto Resposta: `JResult<Atendimento[]>`

- **select:fila**
  - Obtém fila de atendimentos aguardando
  - Keywords: fila atendimento, espera, pendentes
  - References: OSD081, FN012, WF014
  - Objeto Resposta:
    ```json
    JResult<{
      id_atendimento: number,
      nome_visitante: string,
      tempo_espera_minutos: number,
      posicao_fila: number,
      pagina_origem: string
    }[]>
    ```

- **mutate:iniciar**
  - Visitante inicia novo atendimento online
  - Keywords: iniciar chat, novo atendimento, abrir chat
  - References: US023, OSD080, FN011, WF014
  - Objeto Resposta: `JResult<Atendimento[]>`

- **mutate:aceitar**
  - Atendente aceita atendimento da fila
  - Keywords: aceitar atendimento, pegar chat
  - References: US024, FN012
  - Objeto Resposta:
    ```json
    JResult<{
      id_atendimento: number,
      id_atendente: number,
      data_primeiro_atendimento: string
    }[]>
    ```

- **mutate:transferir**
  - Transfere atendimento para outro atendente
  - Keywords: transferir, repassar, encaminhar atendimento
  - References: US025, OSD086, FN013, WF016
  - Objeto Resposta:
    ```json
    JResult<{
      id_atendimento: number,
      id_atendente_anterior: number,
      id_atendente_novo: number,
      motivo_transferencia: string
    }[]>
    ```

- **mutate:finalizar**
  - Finaliza atendimento concluído
  - Keywords: finalizar chat, encerrar atendimento
  - References: US026, OSD088, FN013, WF017
  - Objeto Resposta: `JResult<Atendimento[]>`

- **mutate:criar_chamado**
  - Converte atendimento em chamado formal
  - Keywords: criar chamado do chat, converter atendimento
  - References: US026, OSD089, FN014, WF017
  - Objeto Resposta:
    ```json
    JResult<{
      id_chamado: number,
      protocolo_chamado: string,
      id_atendimento_origem: number
    }[]>
    ```

- **select:mensagens**
  - Obtém mensagens do atendimento
  - Keywords: mensagens, histórico chat, conversa
  - References: US024
  - Objeto Resposta: `JResult<AtendimentoMensagem[]>`

- **mutate:enviar_mensagem**
  - Envia mensagem no atendimento
  - Keywords: enviar mensagem, responder chat
  - References: US024, OSD084, WF015
  - Objeto Resposta: `JResult<AtendimentoMensagem[]>`

---

## 👨‍💼 Módulo: Atendentes e Departamentos

### Entidade: `atendente`

- **select**
  - Obtém atendentes do sistema
  - Keywords: listar atendentes, equipe, agentes
  - References: US019, US032
  - Objeto Resposta: `JResult<Atendente[]>`

- **select:performance**
  - Gera relatório de performance individual por atendente
  - Keywords: performance, produtividade, métricas atendente
  - References: US032, OSD115, FN019
  - Objeto Resposta:
    ```json
    JResult<{
      id_atendente: number,
      nome_atendente: string,
      total_chamados_atendidos: number,
      tempo_medio_resolucao: number,
      satisfacao_media: number,
      sla_cumprimento_percentual: number
    }[]>
    ```

- **mutate:associar_departamento**
  - Associa atendente a departamento
  - Keywords: associar atendente, vincular setor
  - References: US035, OSD138
  - Objeto Resposta:
    ```json
    JResult<{
      id_atendente: number,
      id_departamento: number
    }[]>
    ```

- **mutate:desassociar_departamento**
  - Remove associação entre atendente e departamento
  - Keywords: desassociar, desvincular
  - References: US035, OSD138
  - Objeto Resposta: `JResult<{}[]>`

---

### Entidade: `departamento`

- **select**
  - Obtém departamentos do sistema
  - Keywords: listar departamentos, setores, áreas
  - References: US015, US023, US035
  - Objeto Resposta: `JResult<Departamento[]>`

- **select:horario_funcionamento**
  - Obtém horários de funcionamento configurados
  - Keywords: horário, funcionamento, expediente
  - References: OSD137, OSD151
  - Objeto Resposta:
    ```json
    JResult<{
      id_departamento: number,
      horario_inicio: string,
      horario_fim: string,
      dias_uteis: string
    }[]>
    ```

- **mutate:criar**
  - Cria novo departamento
  - Keywords: criar departamento, novo setor
  - References: US035, OSD135
  - Objeto Resposta: `JResult<Departamento[]>`

- **mutate:atualizar**
  - Atualiza departamento existente
  - Keywords: editar departamento, modificar setor
  - References: US035, OSD135
  - Objeto Resposta: `JResult<Departamento[]>`

- **mutate:desativar**
  - Desativa departamento
  - Keywords: desativar departamento, inativar setor
  - References: US035, OSD140
  - Objeto Resposta: `JResult<Departamento[]>`

---

## 🏷️ Módulo: Tags e Organização

### Entidade: `tag`

- **select**
  - Obtém tags do sistema
  - Keywords: listar tags, etiquetas, marcadores
  - References: US027, US028, US029
  - Objeto Resposta: `JResult<Tag[]>`

- **select:relatorio_uso**
  - Gera relatório de uso de tags
  - Keywords: relatório tags, estatísticas uso tags
  - References: US028, OSD099
  - Objeto Resposta:
    ```json
    JResult<{
      tag: string,
      tipo_entidade: string,
      total_uso: number,
      ultima_utilizacao: string
    }[]>
    ```

- **mutate:criar**
  - Cria nova tag
  - Keywords: criar tag, nova etiqueta
  - References: US027, US028, OSD093
  - Objeto Resposta: `JResult<Tag[]>`

- **mutate:atualizar**
  - Atualiza tag existente
  - Keywords: editar tag, modificar etiqueta
  - References: US028, OSD097
  - Objeto Resposta: `JResult<Tag[]>`

- **mutate:desativar**
  - Desativa tag
  - Keywords: desativar tag, inativar etiqueta
  - References: US028, OSD097
  - Objeto Resposta: `JResult<Tag[]>`

- **mutate:mesclar**
  - Mescla tags duplicadas
  - Keywords: mesclar tags, unificar etiquetas
  - References: US028, OSD098
  - Objeto Resposta:
    ```json
    JResult<{
      tag_destino: string,
      tags_mescladas: number,
      entidades_atualizadas: number
    }[]>
    ```

- **mutate:aplicar_tag**
  - Aplica tag a entidade
  - Keywords: aplicar tag, adicionar etiqueta, marcar
  - References: US027, OSD100, FN015, WF018
  - Objeto Resposta:
    ```json
    JResult<{
      tipo_entidade: string,
      id_entidade: number,
      tag: string,
      data_aplicacao: string
    }[]>
    ```

- **mutate:remover_tag**
  - Remove tag de entidade
  - Keywords: remover tag, desmarcar, excluir etiqueta
  - References: US027, OSD102, WF019
  - Objeto Resposta: `JResult<{}[]>`

---

## 📧 Módulo: Notificações e Templates

### Entidade: `notificacao`

- **select**
  - Obtém notificações do usuário
  - Keywords: listar notificações, alertas, avisos
  - References: US044, OSD177
  - Objeto Resposta: `JResult<Notificacao[]>`

- **⚙️ mutate:enviar**
  - **Camada:** `N8N Workflow`
  - Envia notificação por canal configurado (trigger automático)
  - Keywords: enviar notificação, disparar alerta
  - References: OSD170, FN026, WF027
  - Objeto Resposta: `JResult<Notificacao[]>`

- **⚙️ mutate:enviar_push**
  - **Camada:** `N8N Workflow`
  - Envia notificação push para mobile
  - Keywords: push notification, mobile, app
  - References: OSD221, WF031
  - Objeto Resposta: `JResult<{}[]>`

- **mutate:marcar_lida**
  - Marca notificação como lida
  - Keywords: ler notificação, marcar lida
  - References: US044, OSD178
  - Objeto Resposta: `JResult<{}[]>`

- **mutate:marcar_nao_lida**
  - Marca notificação como não lida
  - Keywords: marcar não lida, desfazer leitura
  - References: US044, OSD178
  - Objeto Resposta: `JResult<{}[]>`

- **mutate:excluir**
  - Exclui notificação
  - Keywords: excluir notificação, deletar alerta
  - References: US044, OSD182
  - Objeto Resposta: `JResult<{}[]>`

- **⚙️ mutate:reagendar**
  - **Camada:** `N8N Workflow`
  - Reagenda notificação falhada (retry automático)
  - Keywords: reagendar, retry, reenviar
  - References: OSD175, WF027
  - Objeto Resposta: `JResult<{}[]>`

- **⚙️ job:agrupar**
  - **Camada:** `N8N Workflow`
  - Job que agrupa notificações similares (job a cada 5min)
  - Keywords: agrupar notificações, consolidar alertas
  - References: OSD173, WF028
  - Objeto Resposta:
    ```json
    JResult<{
      notificacoes_agrupadas: number,
      resumos_criados: number
    }[]>
    ```

---

### Entidade: `template_email`

- **select**
  - Obtém templates de email
  - Keywords: listar templates, modelos email
  - References: US038, OSD156
  - Objeto Resposta: `JResult<TemplateEmail[]>`

- **mutate:criar**
  - Cria novo template de email
  - Keywords: criar template, novo modelo
  - References: US038, OSD156, FN027
  - Objeto Resposta: `JResult<TemplateEmail[]>`

- **mutate:atualizar**
  - Atualiza template existente
  - Keywords: editar template, modificar modelo
  - References: US038, OSD156
  - Objeto Resposta: `JResult<TemplateEmail[]>`

- **⚙️ mutate:testar**
  - **Camada:** `N8N Workflow`
  - Envia email de teste usando template
  - Keywords: testar template, preview email
  - References: US038, OSD162
  - Objeto Resposta:
    ```json
    JResult<{
      email_enviado: boolean,
      destinatario_teste: string
    }[]>
    ```

---

## ⚙️ Módulo: Configurações e SLA

### Entidade: `sla_configuracao`

- **select**
  - Obtém configurações de SLA
  - Keywords: listar SLA, acordo nível serviço
  - References: US037, OSD149, FN024
  - Objeto Resposta: `JResult<SLAConfiguracao[]>`

- **mutate:criar**
  - Cria nova configuração de SLA
  - Keywords: criar SLA, novo acordo
  - References: US037, OSD149, FN024
  - Objeto Resposta: `JResult<SLAConfiguracao[]>`

- **mutate:atualizar**
  - Atualiza configuração de SLA
  - Keywords: editar SLA, modificar acordo
  - References: US037, OSD149
  - Objeto Resposta: `JResult<SLAConfiguracao[]>`

---

### Entidade: `feriado`

- **select**
  - Obtém feriados cadastrados
  - Keywords: listar feriados, calendário
  - References: US037, OSD152
  - Objeto Resposta: `JResult<Feriado[]>`

- **mutate:criar**
  - Cadastra novo feriado
  - Keywords: criar feriado, adicionar feriado
  - References: US037, OSD152
  - Objeto Resposta: `JResult<Feriado[]>`

- **mutate:atualizar**
  - Atualiza feriado existente
  - Keywords: editar feriado, modificar feriado
  - References: US037
  - Objeto Resposta: `JResult<Feriado[]>`

- **mutate:excluir**
  - Remove feriado
  - Keywords: excluir feriado, deletar feriado
  - References: US037
  - Objeto Resposta: `JResult<{}[]>`

---

### Entidade: `automacao_regra`

- **select**
  - Obtém regras de automação
  - Keywords: listar regras, automações
  - References: US039, OSD163
  - Objeto Resposta: `JResult<AutomacaoRegra[]>`

- **select:log_execucoes**
  - Obtém log de execuções de regras
  - Keywords: log automação, histórico execução
  - References: OSD168, WF023
  - Objeto Resposta:
    ```json
    JResult<{
      id_automacao_regra: number,
      data_execucao: string,
      sucesso: boolean,
      mensagem: string
    }[]>
    ```

- **mutate:criar**
  - Cria nova regra de automação
  - Keywords: criar regra, nova automação
  - References: US039, OSD163, FN025
  - Objeto Resposta: `JResult<AutomacaoRegra[]>`

- **mutate:atualizar**
  - Atualiza regra de automação
  - Keywords: editar regra, modificar automação
  - References: US039, OSD163
  - Objeto Resposta: `JResult<AutomacaoRegra[]>`

- **mutate:ativar**
  - Ativa regra de automação
  - Keywords: ativar regra, habilitar automação
  - References: US039, OSD169
  - Objeto Resposta: `JResult<AutomacaoRegra[]>`

- **mutate:desativar**
  - Desativa regra de automação
  - Keywords: desativar regra, desabilitar automação
  - References: US039, OSD169
  - Objeto Resposta: `JResult<AutomacaoRegra[]>`

- **mutate:testar**
  - Testa regra antes da ativação
  - Keywords: testar regra, validar automação
  - References: US039, OSD167, FN025
  - Objeto Resposta:
    ```json
    JResult<{
      id_automacao_regra: number,
      teste_executado: boolean,
      condicoes_atendidas: boolean,
      acoes_executadas: number,
      mensagem: string
    }[]>
    ```

- **⚙️ job:executar**
  - **Camada:** `N8N Workflow`
  - Job que executa regras de automação (job/trigger)
  - Keywords: executar automação, processar regras
  - References: OSD165, WF023
  - Objeto Resposta:
    ```json
    JResult<{
      regras_processadas: number,
      acoes_executadas: number,
      falhas: number
    }[]>
    ```

---

### Entidade: `auditoria`

- **select**
  - Obtém logs de auditoria do sistema
  - Keywords: auditoria, logs, histórico operações
  - References: US040, OSD018, FN036
  - Objeto Resposta: `JResult<Auditoria[]>`

---

## 📊 Módulo: Dashboard e Métricas (Entidades Virtuais)

### Entidade Virtual: `dashboard`

- **select:metricas_gerais**
  - Obtém métricas gerais (KPIs do sistema)
  - Keywords: dashboard, KPI, métricas, estatísticas
  - References: US030, OSD107, FN018
  - Objeto Resposta:
    ```json
    JResult<{
      total_chamados: number,
      abertos: number,
      em_andamento: number,
      finalizados: number,
      sla_vencidos: number,
      tempo_medio_resolucao: number,
      satisfacao_media: number
    }[]>
    ```

- **select:tendencias_chamados**
  - Obtém série temporal de chamados
  - Keywords: tendências, série temporal, gráfico
  - References: US046, OSD111, FN021
  - Objeto Resposta:
    ```json
    JResult<{
      periodo: string,
      total_chamados: number
    }[]>
    ```

- **select:performance_atendentes**
  - Obtém performance por atendente
  - Keywords: performance, produtividade, ranking
  - References: US032, OSD115, FN019
  - Objeto Resposta:
    ```json
    JResult<{
      id_atendente: number,
      nome_atendente: string,
      total_chamados_atendidos: number,
      tempo_medio_resolucao: number,
      satisfacao_media: number,
      sla_cumprimento_percentual: number
    }[]>
    ```

- **select:satisfacao**
  - Obtém análise de satisfação (NPS)
  - Keywords: satisfação, NPS, feedback
  - References: US047, OSD117, FN020
  - Objeto Resposta:
    ```json
    JResult<{
      periodo: string,
      total_avaliacoes: number,
      nota_media: number,
      nps: number,
      detratores: number,
      neutros: number,
      promotores: number
    }[]>
    ```

- **select:contador_chamados_ativos**
  - Conta chamados não finalizados
  - Keywords: contador, ativos, pendentes
  - References: US013, US014
  - Objeto Resposta:
    ```json
    JResult<{
      contador_chamados_ativos: number
    }[]>
    ```

- **select:contador_clientes**
  - Conta clientes cadastrados ativos
  - Keywords: contador, clientes
  - References: US007, US008
  - Objeto Resposta:
    ```json
    JResult<{
      contador_clientes: number
    }[]>
    ```

- **select:alertas_sla**
  - Obtém chamados com SLA vencido ou próximo
  - Keywords: alertas, SLA, vencimento
  - References: US013, OSD069, WF011
  - Objeto Resposta:
    ```json
    JResult<{
      id_chamado: number,
      protocolo_chamado: string,
      titulo_chamado: string,
      sla_vencimento_resolucao: string,
      tempo_restante_minutos: number,
      percentual_tempo_decorrido: number,
      vencido: boolean
    }[]>
    ```

---

## 🔗 Módulo: Integrações e Webhooks

### Entidade: `n8n.webhook` ⚙️

> **Camada:** `N8N Workflow` - Entidade implementada no N8N

- **⚙️ mutate:disparar**
  - **Camada:** `N8N Workflow`
  - Dispara webhook para sistema externo (trigger automático)
  - Keywords: webhook, integração, evento externo
  - References: OSD201, FN033, WF029
  - Objeto Resposta:
    ```json
    JResult<{
      webhook_url: string,
      evento: string,
      sucesso: boolean,
      status_code: number
    }[]>
    ```

---

### Entidade: `n8n.email` ⚙️

> **Camada:** `N8N Workflow` - Entidade implementada no N8N

- **⚙️ mutate:processar**
  - **Camada:** `N8N Workflow`
  - Processa email recebido e cria/atualiza chamado (job polling)
  - Keywords: processar email, email para ticket
  - References: OSD205, OSD206, FN034, WF026
  - Objeto Resposta:
    ```json
    JResult<{
      email_processado: boolean,
      id_chamado: number,
      acao: string
    }[]>
    ```

- **⚙️ job:processar**
  - **Camada:** `N8N Workflow`
  - Job que processa emails recebidos (job polling)
  - Keywords: polling email, monitorar caixa
  - References: WF026
  - Objeto Resposta:
    ```json
    JResult<{
      emails_processados: number,
      chamados_criados: number,
      comentarios_adicionados: number
    }[]>
    ```

---

### Entidade: `n8n.integracao` ⚙️

> **Camada:** `N8N Workflow` - Entidade implementada no N8N

- **⚙️ job:sincronizar_crm**
  - **Camada:** `N8N Workflow`
  - Sincroniza dados com sistema CRM externo (job a cada 30min)
  - Keywords: sincronizar CRM, integração CRM
  - References: OSD212, WF030
  - Objeto Resposta:
    ```json
    JResult<{
      registros_sincronizados: number,
      erros: number,
      ultima_sincronizacao: string
    }[]>
    ```

---

## 🛡️ Módulo: Segurança e Sistema

### Entidade: `refresh_token` ⚙️

> **Camada:** `authz + N8N` - Entidade implementada no authz + N8N

- **⚙️ mutate:renovar**
  - **Camada:** `authz + N8N`
  - Renova refresh token (Token Rotation)
  - Keywords: refresh, renovar token
  - References: WF001A
  - Objeto Resposta:
    ```json
    JResult<{
      novo_refresh_token: string,
      familia_id: string
    }[]>
    ```

- **⚙️ mutate:revogar**
  - **Camada:** `authz + N8N`
  - Revoga refresh token específico (logout)
  - Keywords: revogar token, logout
  - References: WF001B
  - Objeto Resposta: `JResult<{}[]>`

- **⚙️ mutate:revogar_todos**
  - **Camada:** `authz + N8N`
  - Revoga todos os refresh tokens do usuário (logout all)
  - Keywords: revogar todos, logout total
  - References: WF001C
  - Objeto Resposta:
    ```json
    JResult<{
      tokens_revogados: number
    }[]>
    ```

---

### Entidade: `n8n.sistema` ⚙️

> **Camada:** `N8N Workflow` - Entidade implementada no N8N

- **⚙️ job:calcular_metricas**
  - **Camada:** `N8N Workflow`
  - Calcula métricas diárias do sistema (job diário 01:00)
  - Keywords: métricas, estatísticas, cálculo diário
  - References: WF020
  - Objeto Resposta:
    ```json
    JResult<{
      data: string,
      metricas_calculadas: number
    }[]>
    ```

- **⚙️ job:backup**
  - **Camada:** `N8N Workflow`
  - Executa backup automático (job diário 02:00)
  - Keywords: backup, cópia segurança
  - References: OSD242, WF024
  - Objeto Resposta:
    ```json
    JResult<{
      backup_executado: boolean,
      tamanho_bytes: number,
      arquivo: string
    }[]>
    ```

- **⚙️ job:limpar_dados**
  - **Camada:** `N8N Workflow`
  - Remove dados antigos e temporários (job semanal domingo 03:00)
  - Keywords: limpeza, remoção dados antigos, cleanup
  - References: OSD272, WF025
  - Objeto Resposta:
    ```json
    JResult<{
      registros_removidos: number,
      espaco_liberado_mb: number
    }[]>
    ```

---

### Entidade: `n8n.seguranca` ⚙️

> **Camada:** `N8N Workflow` - Entidade implementada no N8N

- **⚙️ job:detectar_anomalias**
  - **Camada:** `N8N Workflow`
  - Monitora e detecta atividades suspeitas (job horário)
  - Keywords: anomalias, segurança, atividades suspeitas
  - References: OSD269, WF033
  - Objeto Resposta:
    ```json
    JResult<{
      anomalias_detectadas: number,
      contas_bloqueadas: number,
      alertas_enviados: number
    }[]>
    ```

- **⚙️ job:auditar_permissoes**
  - **Camada:** `N8N Workflow`
  - Audita permissões e detecta inconsistências (job semanal)
  - Keywords: auditoria permissões, revisão acessos
  - References: OSD034, WF034
  - Objeto Resposta:
    ```json
    JResult<{
      usuarios_auditados: number,
      inconsistencias: number,
      recomendacoes: number
    }[]>
    ```

---

### Entidade: `n8n.relatorio` ⚙️

> **Camada:** `N8N Workflow` - Entidade implementada no N8N

- **⚙️ job:gerar**
  - **Camada:** `N8N Workflow`
  - Gera relatório agendado automaticamente (job configurável)
  - Keywords: relatório agendado, geração automática
  - References: OSD118, WF021
  - Objeto Resposta:
    ```json
    JResult<{
      relatorio_gerado: boolean,
      formato: string,
      arquivo: string,
      destinatarios: number
    }[]>
    ```

---

## 🔗 Referências Cruzadas

### Documentos de Especificação

| Prefixo | Referência | Descrição |
| --- | --- | --- |
| US000 | [01-Complete-User-Stories.md](01-Complete-User-Stories.md) | Histórias de usuário |
| OSD000 | [02-Complete-Requirements.md](02-Complete-Requirements.md) | Requisitos de negócio |
| FN000 | [03-Complete-Functionalities.md](03-Complete-Functionalities.md) | Funcionalidades transversais |
| WF000 | [04-Complete-Workflows.md](04-Complete-Workflows.md) | Fluxo de trabalho do n8n |
| UI000 | [06-Complete-UI-Guide.md](06-Complete-UI-Guide.md) | Guia de interfaces de usuário |

### Outras Referências

- [05-Complete-Schema-Guide.md](05-Complete-Schema-Guide.md) - Guia de esquema da base de dados
- [12-Complete-Model-Guide.md](12-Complete-Model-Guide.md) - Guia do modelo de entidades do sistema
- [docs/JSQL/README.md](../../JSQL/README.md) - Introdução ao JSQL
- [docs/JSQL/sintaxe.md](../../JSQL/sintaxe.md) - Sintaxe de escrita de JSQL

---

## 📊 Resumo

### Total de Ações Mapeadas

- **21 Entidades Principais** com ações CRUD completas (HelpDesk)
- **0 Entidades de Relacionamento** (integradas nas entidades principais)
- **1 Entidade de Auth** (authz + N8N): `refresh_token`
- **6 Entidades N8N** (jobs e integrações): `n8n.webhook`, `n8n.email`, `n8n.integracao`, `n8n.sistema`, `n8n.seguranca`, `n8n.relatorio`
- **130+ Ações** mapeadas no total
  - **9 actions authz + N8N** (autenticação/tokens)
  - **18 actions N8N Workflow** (jobs/triggers)
  - **103+ actions HelpDesk JSQL** (procedures sac.*)

### Cobertura

- ✅ **100% User Stories** (US001-US050)
- ✅ **100% Requirements** (OSD001-OSD274)
- ✅ **100% Functionalities** (FN001-FN041)
- ✅ **100% Workflows** (WF001-WF034)
- ✅ **100% Entidades do Model** (12-Complete-Model-Guide.md)

### Tipos de Ações

| Tipo | Quantidade | Descrição |
|------|------------|-----------|
| `select` | 30+ | Consultas de leitura |
| `select:{action}` | 15+ | Consultas especializadas (dashboard, relatório, etc) |
| `mutate:criar` | 15+ | Criação de registros |
| `mutate:atualizar` | 15+ | Atualização de registros |
| `mutate:{action}` | 40+ | Ações customizadas (atribuir, transferir, etc) |
| `job:{action}` | 10+ | Jobs automáticos (agendados ou triggers) |

### Implementação

**Frontend (React) - HelpDesk:**
- Cada ação mapeia para um hook customizado: `useUsuario()`, `useCliente()`, `useChamado()`, etc.
- Hooks utilizam o `jsqlClient` para executar queries/mutations JSQL
- Exemplo: `const { mutate: criarChamado } = useChamado()`
- **⚠️ Não implementar hooks para actions marcadas com ⚙️**

**Backend (N8N Workflows) - Externo:**
- Workflows implementam triggers e jobs automáticos (marcados com ⚙️)
- Processam eventos de banco (database triggers)
- Executam ações agendadas (cron jobs)
- Enviam notificações e webhooks
- **⚠️ Actions N8N não são procedures JSQL**

**Auth (authz + N8N) - Externo:**
- Autenticação, tokens e controle de sessão (marcados com ⚙️)
- Proteção contra ataques XSS/CSRF
- Token rotation e refresh tokens
- **⚠️ Actions authz não são implementadas no HelpDesk**

**Database (SQL Server) - HelpDesk:**
- Procedures JSQL: `sac.jsql__select__{entidade}[__{action}]`
- Procedures JSQL: `sac.jsql__mutate__{entidade}[__{action}]`
- Exemplo: `sac.jsql__select__usuario`, `sac.jsql__mutate__chamado__atribuir`
- **✅ Apenas para actions SEM marcação ⚙️**
