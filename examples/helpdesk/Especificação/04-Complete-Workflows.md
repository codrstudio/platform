# Complete Workflows - Coletivos HelpDesk

## 📋 Visão Geral

Este documento descreve todos os workflows que devem ser implementados no backend N8N para automatizar processos, integrações e regras de negócio do sistema Coletivos HelpDesk. Os workflows são organizados por categoria funcional e incluem triggers, condições e ações específicas.

---

## 🔐 Workflows de Autenticação e Usuários

### WF001 - Login com Refresh Token (ATUALIZADO)
**Trigger:** POST `/coletivos/api/1/autenticar`
**Descrição:** Autentica usuário e gera access token JWT + refresh token

**Fluxo:**
1. **Trigger** - Requisição HTTP POST com credenciais
2. **Validação Credencial** - Extrai e valida formato de email e senha
3. **Consulta Usuário** - Executa `sac.n8n_get_usuario_autenticacao`
4. **Validação Senha** - Compara hash SHA-256 da senha
5. **Gera Access Token** - Cria JWT com payload do usuário (30min)
6. **Gera Refresh Token** - Cria token aleatório de 64 bytes
7. **Calcula Hash** - Hash SHA-256 do refresh token
8. **Define Família** - Gera UUID para nova família de tokens
9. **Armazena Token** - Insere em `TBrefresh_token` com expiração 7 dias
10. **Retorna Tokens** - Access token + refresh token em httpOnly cookies
11. **Log Auditoria** - Registra login bem-sucedido

**Tabelas Envolvidas:** `TBusuario`, `TBrefresh_token`, `TBauditoria`

**Response:**
```json
{
  "code": 200,
  "data": {
    "access_token": "eyJhbGc...",
    "refresh_token": "64_bytes_hex",
    "token_type": "bearer",
    "expires_in": 1800,
    "requires_2fa": false,
    "payload": { /* user payload */ }
  }
}
```

### WF001A - Renovação de Token (Refresh)
**Trigger:** POST `/coletivos/api/1/auth/refresh`
**Descrição:** Renova access token usando refresh token válido (Token Rotation)

**Fluxo:**
1. **Trigger** - Requisição HTTP POST com refresh token
2. **Extrai Token** - Do body ou cookie `refresh_token`
3. **Calcula Hash** - Hash SHA-256 do token recebido
4. **Consulta Token** - Busca em `TBrefresh_token` por hash
5. **Valida Token:**
   - Verifica se existe
   - Verifica se não está revogado (`DFrevogado = 0`)
   - Verifica se não expirou (`DFexpira_em > now`)
   - **Verifica se não foi usado** (`DFusado_em IS NULL`)
6. **Detecção de Reuso:**
   - Se `DFusado_em` preenchido → **ALERTA DE SEGURANÇA**
   - Revoga toda família (`UPDATE SET DFrevogado = 1 WHERE DFfamilia_id = ?`)
   - Retorna erro 401 "Sessão comprometida"
7. **Busca Payload** - Executa `sac.n8n_get_usuario_autenticacao`
8. **Gera Novos Tokens:**
   - Novo access token JWT (30min)
   - Novo refresh token (7 dias)
   - Mesma `DFfamilia_id` (rotation)
9. **Marca Como Usado** - `UPDATE SET DFusado_em = GETDATE() WHERE DFid = ?`
10. **Armazena Novo Token** - Insere novo refresh token na mesma família
11. **Retorna Tokens** - Novos access + refresh tokens

**Tabelas Envolvidas:** `TBrefresh_token`, `TBusuario`, `TBauditoria`

**Security:**
- **Token Rotation:** Cada refresh gera novo par e invalida anterior
- **Detecção de Reuso:** Se token usado aparece novamente → compromisso detectado → revoga família inteira
- **Família de Tokens:** UUID compartilhado permite rastrear cadeia completa

### WF001B - Logout (Revogação de Token)
**Trigger:** POST `/coletivos/api/1/auth/logout`
**Descrição:** Revoga refresh token atual, encerrando sessão específica

**Fluxo:**
1. **Trigger** - Requisição HTTP POST com refresh token
2. **Extrai Token** - Do body ou cookie `refresh_token`
3. **Calcula Hash** - Hash SHA-256 do token
4. **Revoga Token** - `UPDATE SET DFrevogado = 1 WHERE DFtoken_hash = ? AND DFrevogado = 0`
5. **Retorna Sucesso** - Confirma logout

**Tabelas Envolvidas:** `TBrefresh_token`, `TBauditoria`

### WF001C - Logout All (Revogação Total)
**Trigger:** POST `/coletivos/api/1/auth/logout-all`
**Descrição:** Revoga TODOS os refresh tokens do usuário autenticado

**Fluxo:**
1. **Trigger** - Requisição HTTP POST com access token
2. **Valida JWT** - Extrai e valida access token
3. **Extrai ID Usuário** - Do payload JWT
4. **Revoga Todos** - `UPDATE SET DFrevogado = 1 WHERE DFid_usuario = ? AND DFrevogado = 0`
5. **Retorna Sucesso** - Confirma revogação total

**Tabelas Envolvidas:** `TBrefresh_token`, `TBauditoria`

**Use Cases:**
- Usuário suspeita de comprometimento
- Troca de senha
- Logout de todos dispositivos

### WF001D - Criação de Usuário
**Trigger:** Inserção na tabela `TBusuario`
**Descrição:** Processa a criação de novos usuários no sistema

**Fluxo:**
1. **Trigger** - Webhook ou database trigger na inserção de `TBusuario`
2. **Validação** - Verifica se email é único no sistema
3. **Hash Senha** - Gera hash seguro da senha usando SHA-256
4. **Papel Padrão** - Atribui papel ESPECTADOR automaticamente
5. **Template Email** - Busca template de boas-vindas
6. **Envio Email** - Envia credenciais e instruções de primeiro acesso
7. **Log Auditoria** - Registra criação do usuário em `TBauditoria`
8. **Notificação Admin** - Notifica administradores sobre novo usuário

**Tabelas Envolvidas:** `TBusuario`, `TBusuario_papel`, `TBpapel`, `TBtemplate_email`, `TBauditoria`

### WF002 - Recuperação de Senha
**Trigger:** Solicitação de recuperação via API  
**Descrição:** Processa solicitações de recuperação de senha

**Fluxo:**
1. **Trigger** - API endpoint `/auth/forgot-password`
2. **Validação Email** - Verifica se email existe no sistema
3. **Gerar Token** - Cria token único com expiração de 24h
4. **Salvar Token** - Armazena token em `TBusuario.DFtoken_recuperacao`
5. **Template Email** - Busca template de recuperação
6. **Envio Email** - Envia link seguro para redefinição
7. **Log Segurança** - Registra tentativa de recuperação
8. **Limpeza Tokens** - Remove tokens expirados (job diário)

**Tabelas Envolvidas:** `TBusuario`, `TBtemplate_email`, `TBauditoria`

### WF003 - Bloqueio por Tentativas
**Trigger:** Falha de login na API  
**Descrição:** Monitora e bloqueia contas após tentativas falhadas

**Fluxo:**
1. **Trigger** - Falha de autenticação via API
2. **Incrementar Contador** - Atualiza `DFtentativas_login_falhadas`
3. **Verificar Limite** - Checa se atingiu 5 tentativas
4. **Bloquear Conta** - Define `DFdata_bloqueio` se necessário
5. **Template Email** - Busca template de bloqueio
6. **Notificar Usuário** - Envia email sobre bloqueio
7. **Notificar Admin** - Alerta administradores sobre bloqueio
8. **Log Segurança** - Registra evento de segurança

**Tabelas Envolvidas:** `TBusuario`, `TBtemplate_email`, `TBauditoria`

### WF004 - Expiração de Permissões
**Trigger:** Job diário às 00:00  
**Descrição:** Remove permissões individuais expiradas

**Fluxo:**
1. **Trigger** - Cron job diário
2. **Buscar Expiradas** - Query permissões com `DFdata_expiracao` < hoje
3. **Loop Permissões** - Para cada permissão expirada:
   - Desativar permissão
   - Registrar em auditoria
   - Notificar usuário afetado
4. **Relatório** - Gera relatório de permissões removidas
5. **Notificar Admins** - Envia resumo para administradores

**Tabelas Envolvidas:** `TBusuario_permissao`, `TBauditoria`, `TBnotificacao`

---

## 👥 Workflows de Clientes e Contatos

### WF005 - Novo Cliente
**Trigger:** Inserção na tabela `TBcliente`  
**Descrição:** Processa cadastro de novos clientes

**Fluxo:**
1. **Trigger** - Database trigger na inserção de `TBcliente`
2. **Validação** - Verifica dados obrigatórios e unicidade
3. **Hierarquia** - Valida cliente pai se especificado
4. **SLA Padrão** - Aplica configurações de SLA padrão
5. **Notificar Equipe** - Informa equipe comercial sobre novo cliente
6. **Criar Estrutura** - Cria pastas/estruturas necessárias
7. **Log Auditoria** - Registra criação do cliente
8. **Dashboard** - Atualiza métricas de clientes

**Tabelas Envolvidas:** `TBcliente`, `TBsla_configuracao`, `TBauditoria`, `TBnotificacao`

### WF006 - Vinculação Contato-Usuário
**Trigger:** Atualização de `DFid_usuario` em `TBcontato`  
**Descrição:** Processa vinculação entre contatos e usuários

**Fluxo:**
1. **Trigger** - Update em `TBcontato.DFid_usuario`
2. **Validar Unicidade** - Verifica se usuário não está vinculado a outro contato
3. **Atualizar Permissões** - Concede acesso ao portal do cliente
4. **Template Email** - Busca template de acesso ao portal
5. **Enviar Credenciais** - Envia instruções de acesso
6. **Configurar Notificações** - Define preferências padrão
7. **Log Auditoria** - Registra vinculação
8. **Notificar Gestores** - Informa sobre novo acesso

**Tabelas Envolvidas:** `TBcontato`, `TBusuario`, `TBtemplate_email`, `TBauditoria`

### WF007 - Limite de Chamados
**Trigger:** Criação de chamado  
**Descrição:** Monitora e controla limites mensais de chamados por cliente

**Fluxo:**
1. **Trigger** - Inserção em `TBchamado`
2. **Buscar Cliente** - Identifica cliente do chamado
3. **Contar Chamados** - Conta chamados do mês atual
4. **Verificar Limite** - Compara com `DFlimite_chamados_mensal`
5. **Alertar 80%** - Notifica quando atingir 80% do limite
6. **Alertar 100%** - Notifica quando atingir limite
7. **Bloquear** - Impede novos chamados se configurado
8. **Relatório** - Gera relatório de uso por cliente

**Tabelas Envolvidas:** `TBchamado`, `TBcliente`, `TBnotificacao`

---

## 🎫 Workflows de Chamados

### WF008 - Novo Chamado
**Trigger:** Inserção na tabela `TBchamado`  
**Descrição:** Processa abertura de novos chamados

**Fluxo:**
1. **Trigger** - Database trigger na inserção de `TBchamado`
2. **Gerar Protocolo** - Cria número de protocolo único
3. **Calcular SLA** - Define prazos baseado em regras
4. **Auto-Atribuição** - Aplica regras de atribuição automática
5. **Notificar Atendente** - Informa atendente atribuído
6. **Notificar Cliente** - Confirma abertura para cliente
7. **Criar Histórico** - Registra abertura no histórico
8. **Atualizar Métricas** - Incrementa contadores de dashboard

**Tabelas Envolvidas:** `TBchamado`, `TBsla_configuracao`, `TBautomacao_regra`, `TBchamado_historico`, `TBnotificacao`

### WF009 - Mudança de Status
**Trigger:** Atualização de `DFid_status_chamado` em `TBchamado`  
**Descrição:** Processa mudanças de status dos chamados

**Fluxo:**
1. **Trigger** - Update em `TBchamado.DFid_status_chamado`
2. **Validar Transição** - Verifica se transição é permitida
3. **Calcular Tempos** - Atualiza métricas de tempo (primeira resposta, resolução)
4. **Registrar Histórico** - Cria entrada em `TBchamado_historico`
5. **Aplicar Regras** - Executa regras de automação para novo status
6. **Notificar Partes** - Informa cliente e atendentes sobre mudança
7. **Atualizar SLA** - Recalcula prazos se necessário
8. **Pesquisa Satisfação** - Envia pesquisa se status = fechado

**Tabelas Envolvidas:** `TBchamado`, `TBstatus_chamado`, `TBchamado_historico`, `TBautomacao_regra`, `TBnotificacao`, `TBchamado_satisfacao`

### WF010 - Atribuição de Chamado
**Trigger:** Atualização de `DFid_atendente_responsavel` em `TBchamado`  
**Descrição:** Processa atribuição/reatribuição de chamados

**Fluxo:**
1. **Trigger** - Update em `TBchamado.DFid_atendente_responsavel`
2. **Validar Atendente** - Verifica se atendente pertence ao departamento
3. **Verificar Disponibilidade** - Checa carga de trabalho atual
4. **Registrar Histórico** - Documenta mudança de atribuição
5. **Notificar Novo** - Informa novo atendente responsável
6. **Notificar Anterior** - Informa atendente anterior (se houver)
7. **Atualizar Métricas** - Ajusta contadores de carga de trabalho
8. **Aplicar SLA** - Recalcula prazos se necessário

**Tabelas Envolvidas:** `TBchamado`, `TBatendente`, `TBatendente_departamento`, `TBchamado_historico`, `TBnotificacao`

### WF011 - Vencimento de SLA
**Trigger:** Job a cada 15 minutos  
**Descrição:** Monitora e alerta sobre vencimentos de SLA

**Fluxo:**
1. **Trigger** - Cron job a cada 15 minutos
2. **Buscar Próximos** - Query chamados próximos do vencimento (1h, 30min, vencidos)
3. **Loop Chamados** - Para cada chamado:
   - Calcular tempo restante
   - Determinar tipo de alerta
   - Buscar responsáveis para notificar
4. **Enviar Alertas** - Notifica atendentes e supervisores
5. **Escalação** - Aplica regras de escalação automática
6. **Atualizar Status** - Marca chamados como vencidos se necessário
7. **Relatório** - Gera métricas de SLA para dashboard

**Tabelas Envolvidas:** `TBchamado`, `TBsla_configuracao`, `TBautomacao_regra`, `TBnotificacao`

### WF012 - Comentário em Chamado
**Trigger:** Inserção na tabela `TBchamado_comentario`  
**Descrição:** Processa novos comentários em chamados

**Fluxo:**
1. **Trigger** - Database trigger na inserção de `TBchamado_comentario`
2. **Identificar Tipo** - Determina se é comentário interno ou externo
3. **Buscar Interessados** - Lista usuários para notificar
4. **Processar Menções** - Identifica @menções no texto
5. **Enviar Notificações** - Notifica partes interessadas
6. **Atualizar Chamado** - Atualiza data de última atividade
7. **Registrar Histórico** - Cria entrada no histórico
8. **Primeira Resposta** - Marca primeira resposta se aplicável

**Tabelas Envolvidas:** `TBchamado_comentario`, `TBchamado`, `TBchamado_historico`, `TBnotificacao`, `TBusuario`

### WF013 - Upload de Anexo
**Trigger:** Inserção na tabela `TBchamado_anexo`  
**Descrição:** Processa upload de anexos em chamados

**Fluxo:**
1. **Trigger** - Database trigger na inserção de `TBchamado_anexo`
2. **Validar Arquivo** - Verifica tipo, tamanho e segurança
3. **Scan Vírus** - Executa verificação de malware
4. **Armazenar** - Move arquivo para storage definitivo
5. **Gerar Thumbnail** - Cria preview para imagens
6. **Registrar Histórico** - Documenta upload no histórico
7. **Notificar** - Informa partes interessadas sobre novo anexo
8. **Atualizar Métricas** - Incrementa contadores de storage

**Tabelas Envolvidas:** `TBchamado_anexo`, `TBchamado_historico`, `TBnotificacao`

---

## 💬 Workflows de Atendimento Online

### WF014 - Novo Atendimento
**Trigger:** Inserção na tabela `TBatendimento`  
**Descrição:** Processa início de novos atendimentos online

**Fluxo:**
1. **Trigger** - Database trigger na inserção de `TBatendimento`
2. **Detectar Localização** - Identifica país/cidade pelo IP
3. **Buscar Fila** - Determina departamento baseado em regras
4. **Atribuir Atendente** - Encontra atendente disponível
5. **Enviar Boas-vindas** - Envia mensagem inicial automática
6. **Notificar Atendente** - Alerta sobre novo atendimento
7. **Iniciar Timer** - Começa contagem de tempo de espera
8. **Atualizar Dashboard** - Incrementa métricas de atendimento

**Tabelas Envolvidas:** `TBatendimento`, `TBdepartamento`, `TBatendente`, `TBatendimento_mensagem`, `TBnotificacao`

### WF015 - Mensagem de Atendimento
**Trigger:** Inserção na tabela `TBatendimento_mensagem`  
**Descrição:** Processa mensagens trocadas durante atendimento

**Fluxo:**
1. **Trigger** - Database trigger na inserção de `TBatendimento_mensagem`
2. **Identificar Remetente** - Determina se é visitante, atendente ou sistema
3. **Filtrar Conteúdo** - Aplica filtros de segurança e spam
4. **Processar Anexos** - Valida e armazena arquivos enviados
5. **Notificar Destinatário** - Envia notificação em tempo real
6. **Atualizar Status** - Marca atendimento como ativo
7. **Registrar Métricas** - Conta mensagens para relatórios
8. **Auto-resposta** - Aplica respostas automáticas se configurado

**Tabelas Envolvidas:** `TBatendimento_mensagem`, `TBatendimento`, `TBnotificacao`, `TBtemplate_email`

### WF016 - Transferência de Atendimento
**Trigger:** Atualização de `DFid_atendente` em `TBatendimento`  
**Descrição:** Processa transferências entre atendentes

**Fluxo:**
1. **Trigger** - Update em `TBatendimento.DFid_atendente`
2. **Validar Disponibilidade** - Verifica se novo atendente está disponível
3. **Preservar Contexto** - Mantém histórico de mensagens
4. **Notificar Visitante** - Informa sobre transferência
5. **Briefing Atendente** - Envia contexto para novo atendente
6. **Registrar Transferência** - Documenta mudança no histórico
7. **Atualizar Métricas** - Ajusta contadores de carga
8. **Liberar Anterior** - Libera capacidade do atendente anterior

**Tabelas Envolvidas:** `TBatendimento`, `TBatendente`, `TBatendimento_mensagem`, `TBnotificacao`

### WF017 - Finalização de Atendimento
**Trigger:** Atualização de status para "Finalizado" em `TBatendimento`  
**Descrição:** Processa finalização de atendimentos

**Fluxo:**
1. **Trigger** - Update em `TBatendimento.DFid_tipo_status_atendimento` = Finalizado
2. **Calcular Tempo** - Registra tempo total de atendimento
3. **Gerar Transcrição** - Cria resumo da conversa
4. **Criar Chamado** - Converte em chamado se solicitado
5. **Enviar Transcrição** - Envia por email se configurado
6. **Pesquisa Satisfação** - Envia formulário de avaliação
7. **Liberar Atendente** - Disponibiliza para novos atendimentos
8. **Atualizar Métricas** - Registra conclusão para relatórios

**Tabelas Envolvidas:** `TBatendimento`, `TBchamado`, `TBtemplate_email`, `TBnotificacao`

---

## 🏷️ Workflows de Tags e Organização

### WF018 - Aplicação de Tag
**Trigger:** Inserção na tabela `TBentidade_tag`  
**Descrição:** Processa aplicação de tags às entidades

**Fluxo:**
1. **Trigger** - Database trigger na inserção de `TBentidade_tag`
2. **Validar Compatibilidade** - Verifica se tag é compatível com tipo de entidade
3. **Verificar Duplicatas** - Evita tags duplicadas na mesma entidade
4. **Registrar Auditoria** - Documenta quem aplicou a tag
5. **Atualizar Contadores** - Incrementa uso da tag
6. **Notificar Interessados** - Informa sobre nova categorização
7. **Aplicar Automações** - Executa regras baseadas em tags
8. **Indexar Busca** - Atualiza índices de pesquisa

**Tabelas Envolvidas:** `TBentidade_tag`, `TBtag`, `TBtipo_entidade`, `TBauditoria`, `TBautomacao_regra`

### WF019 - Remoção de Tag
**Trigger:** Deleção na tabela `TBentidade_tag`  
**Descrição:** Processa remoção de tags das entidades

**Fluxo:**
1. **Trigger** - Database trigger na deleção de `TBentidade_tag`
2. **Registrar Auditoria** - Documenta quem removeu a tag
3. **Atualizar Contadores** - Decrementa uso da tag
4. **Verificar Automações** - Reverte regras baseadas na tag removida
5. **Notificar Interessados** - Informa sobre mudança de categorização
6. **Limpar Filtros** - Remove filtros salvos que dependiam da tag
7. **Atualizar Índices** - Reindexiza busca sem a tag
8. **Relatório Uso** - Atualiza estatísticas de uso de tags

**Tabelas Envolvidas:** `TBentidade_tag`, `TBtag`, `TBauditoria`, `TBautomacao_regra`

---

## 📊 Workflows de Relatórios e Métricas

### WF020 - Cálculo de Métricas Diárias
**Trigger:** Job diário às 01:00  
**Descrição:** Calcula e armazena métricas diárias do sistema

**Fluxo:**
1. **Trigger** - Cron job diário
2. **Métricas Chamados** - Conta chamados por status, prioridade, departamento
3. **Métricas SLA** - Calcula cumprimento de prazos
4. **Métricas Atendimento** - Processa dados de chat online
5. **Métricas Satisfação** - Calcula médias de avaliação
6. **Métricas Performance** - Analisa performance por atendente
7. **Armazenar Dados** - Salva métricas em tabelas de histórico
8. **Gerar Alertas** - Identifica anomalias e tendências

**Tabelas Envolvidas:** `TBchamado`, `TBatendimento`, `TBchamado_satisfacao`, Tabelas de métricas

### WF021 - Relatório Agendado
**Trigger:** Configuração de agendamento  
**Descrição:** Gera e distribui relatórios automaticamente

**Fluxo:**
1. **Trigger** - Cron baseado em configuração
2. **Buscar Configuração** - Carrega parâmetros do relatório
3. **Executar Queries** - Coleta dados baseado em filtros
4. **Gerar Relatório** - Cria arquivo em formato solicitado
5. **Aplicar Template** - Formata usando template configurado
6. **Enviar Email** - Distribui para lista de destinatários
7. **Armazenar Histórico** - Salva cópia do relatório gerado
8. **Log Execução** - Registra sucesso/falha da geração

**Tabelas Envolvidas:** Configurações de relatório, todas as tabelas de dados

### WF022 - Pesquisa de Satisfação
**Trigger:** Fechamento de chamado  
**Descrição:** Envia e processa pesquisas de satisfação

**Fluxo:**
1. **Trigger** - Status do chamado = fechado
2. **Verificar Elegibilidade** - Confirma se deve enviar pesquisa
3. **Gerar Token** - Cria link único e seguro
4. **Template Email** - Busca template de pesquisa
5. **Enviar Convite** - Envia email com link da pesquisa
6. **Agendar Lembrete** - Programa lembrete após 3 dias
7. **Processar Resposta** - Registra avaliação quando recebida
8. **Atualizar Métricas** - Incorpora nova avaliação às estatísticas

**Tabelas Envolvidas:** `TBchamado_satisfacao`, `TBchamado`, `TBtemplate_email`, `TBnotificacao`

---

## ⚙️ Workflows de Configuração e Automação

### WF023 - Execução de Regra de Automação
**Trigger:** Eventos configurados nas regras  
**Descrição:** Executa regras de automação baseadas em condições

**Fluxo:**
1. **Trigger** - Evento definido na regra (criação, mudança, etc.)
2. **Buscar Regras** - Carrega regras ativas para o evento
3. **Avaliar Condições** - Testa cada condição da regra
4. **Loop Regras** - Para cada regra que atende condições:
   - Executar ações definidas
   - Registrar execução em log
   - Aplicar delays se configurado
5. **Tratar Erros** - Captura e registra falhas
6. **Notificar Admins** - Alerta sobre regras com erro
7. **Atualizar Estatísticas** - Conta execuções para relatórios

**Tabelas Envolvidas:** `TBautomacao_regra`, `TBauditoria`, todas as tabelas afetadas pelas ações

### WF024 - Backup Automático
**Trigger:** Job diário às 02:00  
**Descrição:** Executa backup automático do sistema

**Fluxo:**
1. **Trigger** - Cron job diário
2. **Verificar Espaço** - Confirma espaço disponível para backup
3. **Backup Database** - Executa dump do banco de dados
4. **Backup Arquivos** - Copia arquivos de anexos e uploads
5. **Compressão** - Compacta arquivos de backup
6. **Verificar Integridade** - Testa integridade dos backups
7. **Upload Remoto** - Envia para storage remoto se configurado
8. **Limpeza** - Remove backups antigos baseado em política
9. **Relatório** - Envia status do backup para administradores

**Tabelas Envolvidas:** Todas (backup completo)

### WF025 - Limpeza de Dados
**Trigger:** Job semanal aos domingos às 03:00
**Descrição:** Remove dados antigos e desnecessários

**Fluxo:**
1. **Trigger** - Cron job semanal
2. **Logs Antigos** - Remove logs de auditoria antigos
3. **Tokens Recuperação** - Limpa tokens de recuperação vencidos
4. **Refresh Tokens** - Remove refresh tokens expirados e revogados (>30 dias)
5. **Notificações Lidas** - Remove notificações antigas lidas
6. **Arquivos Temporários** - Limpa uploads temporários
7. **Sessões Expiradas** - Remove sessões inativas
8. **Cache Obsoleto** - Limpa cache desnecessário
9. **Relatório Limpeza** - Informa quantidade de dados removidos

**Tabelas Envolvidas:** `TBauditoria`, `TBnotificacao`, `TBusuario`, `TBrefresh_token`, tabelas de cache

---

## 📧 Workflows de Comunicação

### WF026 - Processamento de Email Recebido
**Trigger:** Recebimento de email nas contas monitoradas  
**Descrição:** Processa emails recebidos e cria/atualiza chamados

**Fluxo:**
1. **Trigger** - Polling de contas de email IMAP
2. **Parse Email** - Extrai remetente, assunto, corpo, anexos
3. **Identificar Origem** - Determina se é novo chamado ou resposta
4. **Buscar Contato** - Localiza contato pelo email do remetente
5. **Criar/Atualizar** - Cria novo chamado ou adiciona comentário
6. **Processar Anexos** - Salva anexos do email
7. **Aplicar Regras** - Executa regras de auto-atribuição
8. **Confirmar Recebimento** - Envia confirmação automática
9. **Marcar Processado** - Move email para pasta processados

**Tabelas Envolvidas:** `TBchamado`, `TBchamado_comentario`, `TBchamado_anexo`, `TBcontato`

### WF027 - Envio de Notificação
**Trigger:** Inserção na tabela `TBnotificacao`  
**Descrição:** Processa envio de notificações por diferentes canais

**Fluxo:**
1. **Trigger** - Database trigger na inserção de `TBnotificacao`
2. **Buscar Preferências** - Carrega preferências do usuário destinatário
3. **Determinar Canais** - Define quais canais usar (email, push, WhatsApp)
4. **Loop Canais** - Para cada canal ativo:
   - Buscar template apropriado
   - Personalizar conteúdo
   - Enviar notificação
   - Registrar tentativa
5. **Tratar Falhas** - Reagenda envios falhados
6. **Atualizar Status** - Marca notificação como enviada
7. **Registrar Métricas** - Conta envios para relatórios

**Tabelas Envolvidas:** `TBnotificacao`, `TBusuario`, `TBtemplate_email`, `TBtipo_canal_notificacao`

### WF028 - Agrupamento de Notificações
**Trigger:** Job a cada 5 minutos  
**Descrição:** Agrupa notificações similares para evitar spam

**Fluxo:**
1. **Trigger** - Cron job a cada 5 minutos
2. **Buscar Pendentes** - Localiza notificações não enviadas
3. **Agrupar Similares** - Identifica notificações do mesmo tipo/usuário
4. **Criar Resumo** - Gera notificação consolidada
5. **Cancelar Individuais** - Marca notificações originais como agrupadas
6. **Enviar Resumo** - Processa notificação consolidada
7. **Atualizar Configurações** - Ajusta frequência baseado em volume
8. **Log Agrupamento** - Registra estatísticas de agrupamento

**Tabelas Envolvidas:** `TBnotificacao`, `TBusuario`

---

## 🔗 Workflows de Integração

### WF029 - Webhook Outbound
**Trigger:** Eventos configurados no sistema  
**Descrição:** Envia webhooks para sistemas externos

**Fluxo:**
1. **Trigger** - Evento configurado (criação chamado, mudança status, etc.)
2. **Buscar Configurações** - Carrega URLs e configurações de webhook
3. **Preparar Payload** - Monta dados do evento em JSON
4. **Assinar Payload** - Adiciona assinatura de segurança
5. **Enviar Webhook** - POST para URLs configuradas
6. **Tratar Respostas** - Processa confirmações e erros
7. **Retry Falhas** - Reagenda envios falhados com backoff
8. **Log Webhooks** - Registra tentativas e resultados

**Tabelas Envolvidas:** Configurações de webhook, tabelas do evento

### WF030 - Sincronização CRM
**Trigger:** Job a cada 30 minutos  
**Descrição:** Sincroniza dados com sistema CRM externo

**Fluxo:**
1. **Trigger** - Cron job a cada 30 minutos
2. **Buscar Alterações** - Identifica registros modificados
3. **Preparar Dados** - Formata dados para API do CRM
4. **Autenticar** - Obtém token de acesso do CRM
5. **Sincronizar** - Envia/recebe dados via API
6. **Mapear Campos** - Converte entre formatos diferentes
7. **Resolver Conflitos** - Trata divergências de dados
8. **Atualizar Timestamps** - Marca última sincronização
9. **Relatório Sync** - Informa status da sincronização

**Tabelas Envolvidas:** `TBcliente`, `TBcontato`, `TBchamado`, tabelas de sincronização

---

## 📱 Workflows Mobile e API

### WF031 - Notificação Push
**Trigger:** Eventos relevantes para usuários mobile  
**Descrição:** Envia notificações push para aplicativos móveis

**Fluxo:**
1. **Trigger** - Eventos como novo chamado, comentário, mudança status
2. **Identificar Dispositivos** - Busca tokens de dispositivos do usuário
3. **Personalizar Mensagem** - Adapta conteúdo para mobile
4. **Verificar Permissões** - Confirma se usuário aceita push
5. **Enviar Push** - Utiliza FCM/APNS para entrega
6. **Tratar Tokens Inválidos** - Remove tokens expirados
7. **Registrar Entrega** - Log de notificações enviadas
8. **Métricas Engagement** - Conta aberturas e interações

**Tabelas Envolvidas:** `TBnotificacao`, `TBusuario`, tabelas de dispositivos móveis

### WF032 - Rate Limiting API
**Trigger:** Requisições à API  
**Descrição:** Controla taxa de requisições por usuário/IP

**Fluxo:**
1. **Trigger** - Cada requisição à API
2. **Identificar Cliente** - Determina usuário ou IP da requisição
3. **Verificar Limites** - Consulta quotas configuradas
4. **Contar Requisições** - Incrementa contador no período
5. **Aplicar Throttling** - Bloqueia se exceder limite
6. **Retornar Headers** - Informa limites restantes
7. **Log Violações** - Registra tentativas de abuso
8. **Alertar Admins** - Notifica sobre uso excessivo

**Tabelas Envolvidas:** Tabelas de rate limiting, `TBauditoria`

---

## 🛡️ Workflows de Segurança

### WF033 - Detecção de Anomalias
**Trigger:** Job a cada hora  
**Descrição:** Monitora atividades suspeitas no sistema

**Fluxo:**
1. **Trigger** - Cron job horário
2. **Analisar Logins** - Detecta padrões anômalos de acesso
3. **Verificar IPs** - Identifica acessos de localizações suspeitas
4. **Monitorar Ações** - Analisa volume de operações por usuário
5. **Detectar Bots** - Identifica comportamento automatizado
6. **Calcular Scores** - Atribui pontuação de risco
7. **Gerar Alertas** - Notifica sobre atividades suspeitas
8. **Aplicar Medidas** - Bloqueia ou restringe conforme necessário
9. **Relatório Segurança** - Consolida eventos para análise

**Tabelas Envolvidas:** `TBauditoria`, `TBusuario`, tabelas de segurança

### WF034 - Auditoria de Permissões
**Trigger:** Job semanal  
**Descrição:** Audita permissões e identifica inconsistências

**Fluxo:**
1. **Trigger** - Cron job semanal
2. **Mapear Permissões** - Lista todas as permissões efetivas
3. **Identificar Órfãos** - Encontra permissões sem usuário ativo
4. **Detectar Excessos** - Identifica permissões desnecessárias
5. **Verificar Segregação** - Valida separação de funções
6. **Analisar Padrões** - Compara com perfis similares
7. **Gerar Recomendações** - Sugere ajustes de permissões
8. **Relatório Auditoria** - Documenta achados e recomendações
9. **Notificar Gestores** - Informa sobre necessidade de revisão

**Tabelas Envolvidas:** `TBusuario`, `TBusuario_papel`, `TBusuario_permissao`, `PERMITIDO`

---

## 🎯 Resumo dos Workflows

### Categorias de Workflows:
- **Autenticação e Usuários**: 7 workflows (login, refresh, logout, logout-all, criação, recuperação, bloqueio)
- **Clientes e Contatos**: 3 workflows para gestão de relacionamentos
- **Chamados**: 6 workflows para ciclo de vida completo
- **Atendimento Online**: 4 workflows para chat em tempo real
- **Tags e Organização**: 2 workflows para categorização
- **Relatórios e Métricas**: 3 workflows para analytics
- **Configuração e Automação**: 3 workflows para administração
- **Comunicação**: 3 workflows para notificações
- **Integração**: 2 workflows para sistemas externos
- **Mobile e API**: 2 workflows para plataformas móveis
- **Segurança**: 2 workflows para proteção e auditoria

### Total de Workflows:
- ✅ **37 Workflows** cobrindo todos os aspectos do sistema (incluindo 4 workflows de autenticação com refresh token)
- ✅ **Triggers Variados**: Database triggers, cron jobs, API events, webhooks
- ✅ **Integração Completa**: Todos os workflows integrados com schema SAC
- ✅ **Automação Total**: Processos manuais minimizados
- ✅ **Monitoramento**: Logs e métricas em todos os workflows
- ✅ **Tratamento de Erros**: Retry logic e notificações de falha
- ✅ **Escalabilidade**: Workflows otimizados para alto volume

### Tecnologias N8N Utilizadas:
- **Database Triggers**: Para eventos em tempo real
- **Cron Jobs**: Para processamento agendado
- **HTTP Requests**: Para integrações externas
- **Email Nodes**: Para comunicação
- **Conditional Logic**: Para regras de negócio
- **Loops**: Para processamento em lote
- **Error Handling**: Para robustez
- **Webhooks**: Para eventos externos
