# Documentação do Esquema do Banco de Dados - Sistema HelpDesk (SAC)

## 1. Visão Geral

Este documento detalha a arquitetura e o design do esquema do banco de dados `sac` (Serviço de Atendimento ao Cliente), desenvolvido para o novo sistema HelpDesk. O esquema foi projetado para ser robusto, escalável e de fácil manutenção, seguindo as melhores práticas de modelagem de dados e as convenções de nomenclatura do SQL Server.

O design do esquema foi derivado da análise da estrutura de banco de dados do TomTicket, com reinterpretações e melhorias para atender aos requisitos do novo sistema. As principais características do esquema `sac` incluem:

- **Estrutura Modular:** As tabelas são organizadas de forma lógica para representar as principais entidades do sistema, como Clientes, Contatos, Atendentes, Chamados e Atendimentos.
- **Sistema de Tags Flexível:** Um sistema de tags universal e flexível foi implementado para permitir a categorização e a organização de várias entidades do sistema.
- **Validação de Dados:** O esquema utiliza `constraints` e `triggers` para garantir a integridade e a consistência dos dados.
- **Documentação Integrada:** Todas as tabelas e campos são documentados diretamente no banco de dados usando metadados, facilitando a compreensão e a manutenção do esquema.
- **Convenções de Nomenclatura:** O esquema segue um conjunto rigoroso de convenções de nomenclatura para garantir a consistência e a legibilidade.

## 2. Convenções de Nomenclatura

O esquema `sac` adota as seguintes convenções de nomenclatura:

| Elemento | Prefixo | Exemplo |
| --- | --- | --- |
| Tabelas | `TB` | `sac.TBcliente` |
| Campos | `DF` | `DFid_cliente` |
| Primary Keys | `PK__sac_TB` | `PK__sac_TBcliente` |
| Unique Keys | `UQ__sac_TB` | `UQ__sac_TBcliente__DFemail` |
| Check Constraints | `CK__sac_TB` | `CK__sac_TBcliente__DFativo` |

## 3. Diagrama do Esquema




![Diagrama do Esquema do HelpDesk](/home/ubuntu/helpdesk_schema.png)

## 4. Descrição das Tabelas




### 4.1. sac.TBcliente

Esta tabela armazena informações sobre os clientes (empresas) que utilizam o sistema de HelpDesk.

**Colunas Principais:**

| Coluna | Tipo | Descrição |
| --- | --- | --- |
| `DFid_cliente` | `INTEGER` | Identificador único do cliente (chave primária). |
| `DFnome_cliente` | `NVARCHAR(255)` | Nome fantasia do cliente. |
| `DFrazao_social` | `NVARCHAR(255)` | Razão social do cliente. |
| `DFcnpj` | `NVARCHAR(18)` | CNPJ do cliente. |
| `DFativo` | `CHAR(1)` | Indica se o cliente está ativo (`S`) ou inativo (`N`). |
| `DFid_cliente_matriz` | `INTEGER` | Referência à própria tabela para criar uma hierarquia de clientes (matriz/filial). |
| `DFid_atendente_responsavel` | `INTEGER` | Chave estrangeira para `sac.TBatendente`, indicando o atendente responsável por este cliente. |

**Relacionamentos:**

- `sac.TBcontato` (um cliente pode ter vários contatos)
- `sac.TBchamado` (um cliente pode ter vários chamados)
- `sac.TBatendente` (um atendente pode ser responsável por vários clientes)



### 4.2. sac.TBcontato

Esta tabela armazena informações sobre os contatos (usuários finais) que abrem chamados no sistema de HelpDesk.

**Colunas Principais:**

| Coluna | Tipo | Descrição |
| --- | --- | --- |
| `DFid_contato` | `INTEGER` | Identificador único do contato (chave primária). |
| `DFnome_completo` | `NVARCHAR(255)` | Nome completo do contato. |
| `DFemail` | `NVARCHAR(255)` | Endereço de e-mail do contato, usado para login e notificações. É um campo único. |
| `DFid_cliente` | `INTEGER` | Chave estrangeira para `sac.TBcliente`, indicando a qual cliente este contato pertence. |
| `DFativo` | `CHAR(1)` | Indica se o contato está ativo (`S`) ou inativo (`N`). |

**Relacionamentos:**

- `sac.TBcliente` (um contato pertence a um cliente)
- `sac.TBchamado` (um contato pode criar vários chamados)
- `sac.TBchamado_satisfacao` (um contato pode avaliar vários chamados)


### 4.3. sac.TBatendente

Esta tabela armazena informações sobre os atendentes (operadores) que trabalham no sistema de HelpDesk.

**Colunas Principais:**

| Coluna | Tipo | Descrição |
| --- | --- | --- |
| `DFid_atendente` | `INTEGER` | Identificador único do atendente (chave primária). |
| `DFnome_completo` | `NVARCHAR(255)` | Nome completo do atendente. |
| `DFemail` | `NVARCHAR(255)` | Endereço de e-mail do atendente, usado para login e notificações. É um campo único. |
| `DFativo` | `CHAR(1)` | Indica se o atendente está ativo (`S`) ou inativo (`N`). |
| `DFstatus_disponibilidade` | `CHAR(1)` | Indica o status de disponibilidade do atendente (`O`nline, `A`usente, O`c`upado, `I`nativo). |

**Relacionamentos:**

- `sac.TBchamado` (um atendente pode ser responsável por vários chamados)
- `sac.TBatendimento` (um atendente pode realizar vários atendimentos)
- `sac.TBatendente_departamento` (um atendente pode pertencer a vários departamentos)



### 4.4. sac.TBdepartamento

Esta tabela define os departamentos ou produtos para os quais o suporte é oferecido. Os chamados são atribuídos a um departamento para direcionar o atendimento à equipe correta.

**Colunas Principais:**

| Coluna | Tipo | Descrição |
| --- | --- | --- |
| `DFid_departamento` | `INTEGER` | Identificador único do departamento (chave primária). |
| `DFnome_departamento` | `NVARCHAR(255)` | Nome do departamento. |
| `DFcodigo_departamento` | `NVARCHAR(50)` | Código único para identificar o departamento. |
| `DFativo` | `CHAR(1)` | Indica se o departamento está ativo (`S`) ou inativo (`N`). |

**Relacionamentos:**

- `sac.TBchamado` (um departamento pode ter vários chamados)
- `sac.TBatendente_departamento` (um departamento pode ter vários atendentes)
- `sac.TBsla_configuracao` (um departamento pode ter várias configurações de SLA)



### 4.5. sac.TBcategoria

Esta tabela é usada para categorizar os chamados, permitindo uma classificação mais granular dos tipos de solicitação.

**Colunas Principais:**

| Coluna | Tipo | Descrição |
| --- | --- | --- |
| `DFid_categoria` | `INTEGER` | Identificador único da categoria (chave primária). |
| `DFnome_categoria` | `NVARCHAR(255)` | Nome da categoria. |
| `DFcodigo_categoria` | `NVARCHAR(50)` | Código único para identificar a categoria. |
| `DFid_categoria_pai` | `INTEGER` | Chave estrangeira para `sac.TBcategoria`, permitindo a criação de uma hierarquia de categorias. |
| `DFativo` | `CHAR(1)` | Indica se a categoria está ativa (`S`) ou inativa (`N`). |

**Relacionamentos:**

- `sac.TBchamado` (uma categoria pode ser aplicada a vários chamados)
- `sac.TBcategoria` (uma categoria pode ter uma categoria pai)



### 4.6. sac.TBstatus_chamado

Esta tabela define os diferentes status que um chamado pode ter ao longo de seu ciclo de vida, como "Aberto", "Em Atendimento" e "Resolvido".

**Colunas Principais:**

| Coluna | Tipo | Descrição |
| --- | --- | --- |
| `DFid_status_chamado` | `INTEGER` | Identificador único do status (chave primária). |
| `DFnome_status` | `NVARCHAR(100)` | Nome do status. |
| `DFcodigo_status` | `NVARCHAR(20)` | Código único para identificar o status. |
| `DFtipo_status` | `CHAR(1)` | Tipo do status (`A`berto, `P`rogresso, `F`echado, `C`ancelado). |
| `DFativo` | `CHAR(1)` | Indica se o status está ativo (`S`) ou inativo (`N`). |

**Relacionamentos:**

- `sac.TBchamado` (um status pode ser aplicado a vários chamados)



### 4.7. sac.TBchamado

Esta é a tabela central do sistema, armazenando os detalhes de cada chamado (ticket) aberto.

**Colunas Principais:**

| Coluna | Tipo | Descrição |
| --- | --- | --- |
| `DFid_chamado` | `INTEGER` | Identificador único do chamado (chave primária). |
| `DFtitulo_chamado` | `NVARCHAR(500)` | Título ou assunto do chamado. |
| `DFdescricao_inicial` | `NVARCHAR(MAX)` | Descrição inicial e detalhada do problema. |
| `DFid_contato` | `INTEGER` | Chave estrangeira para `sac.TBcontato`, indicando quem abriu o chamado. |
| `DFid_cliente` | `INTEGER` | Chave estrangeira para `sac.TBcliente`, indicando a qual cliente o chamado pertence. |
| `DFid_departamento` | `INTEGER` | Chave estrangeira para `sac.TBdepartamento`, indicando o departamento responsável. |
| `DFid_categoria` | `INTEGER` | Chave estrangeira para `sac.TBcategoria`, classificando o chamado. |
| `DFid_status_chamado` | `INTEGER` | Chave estrangeira para `sac.TBstatus_chamado`, indicando o status atual do chamado. |
| `DFid_atendente_responsavel` | `INTEGER` | Chave estrangeira para `sac.TBatendente`, indicando o atendente responsável. |

**Relacionamentos:**

- `sac.TBcontato` (um chamado é aberto por um contato)
- `sac.TBcliente` (um chamado pertence a um cliente)
- `sac.TBdepartamento` (um chamado é atribuído a um departamento)
- `sac.TBcategoria` (um chamado é classificado em uma categoria)
- `sac.TBstatus_chamado` (um chamado tem um status)
- `sac.TBatendente` (um chamado tem um atendente responsável)
- `sac.TBchamado_comentario` (um chamado pode ter vários comentários)
- `sac.TBchamado_satisfacao` (um chamado pode ter uma avaliação de satisfação)
- `sac.TBchamado_historico` (um chamado pode ter vários registros de histórico)
- `sac.TBchamado_anexo` (um chamado pode ter vários anexos)
- `sac.TBatendimento` (um chamado pode ter vários atendimentos)


### 4.8. sac.TBchamado_comentario

Esta tabela armazena os comentários internos e externos associados a um chamado.

**Colunas Principais:**

| Coluna | Tipo | Descrição |
| --- | --- | --- |
| `DFid_comentario` | `INTEGER` | Identificador único do comentário (chave primária). |
| `DFid_chamado` | `INTEGER` | Chave estrangeira para `sac.TBchamado`, indicando a qual chamado o comentário pertence. |
| `DFtexto_comentario` | `NVARCHAR(MAX)` | O conteúdo do comentário. |
| `DFid_usuario` | `INTEGER` | Identificador do usuário que fez o comentário (pode ser um atendente ou um contato). |
| `DFtipo_usuario` | `CHAR(1)` | Tipo do usuário que fez o comentário (`A`tendente ou `C`ontato). |
| `DFprivado` | `CHAR(1)` | Indica se o comentário é privado (`S`) ou visível para o cliente (`N`). |

**Relacionamentos:**

- `sac.TBchamado` (um comentário pertence a um chamado)



### 4.9. sac.TBchamado_satisfacao

Esta tabela armazena as avaliações de satisfação fornecidas pelos contatos após a resolução de um chamado.

**Colunas Principais:**

| Coluna | Tipo | Descrição |
| --- | --- | --- |
| `DFid_satisfacao` | `INTEGER` | Identificador único da avaliação (chave primária). |
| `DFid_chamado` | `INTEGER` | Chave estrangeira para `sac.TBchamado`, indicando o chamado que foi avaliado. É um campo único, permitindo apenas uma avaliação por chamado. |
| `DFid_contato` | `INTEGER` | Chave estrangeira para `sac.TBcontato`, indicando o contato que fez a avaliação. |
| `DFnota_avaliacao` | `INTEGER` | A nota da avaliação (por exemplo, de 1 a 5). |
| `DFcomentario_avaliacao` | `NVARCHAR(MAX)` | Comentário adicional fornecido pelo contato durante a avaliação. |

**Relacionamentos:**

- `sac.TBchamado` (uma avaliação pertence a um chamado)
- `sac.TBcontato` (uma avaliação é feita por um contato)



### 4.10. sac.TBtag

Esta tabela define as tags que podem ser aplicadas a diferentes entidades do sistema, como chamados, contatos e clientes. O sistema de tags é flexível e permite a criação de tags específicas para cada tipo de entidade.

**Colunas Principais:**

| Coluna | Tipo | Descrição |
| --- | --- | --- |
| `DFtag` | `NVARCHAR(50)` | O nome da tag (chave primária composta). |
| `DFtipo_entidade` | `NVARCHAR(20)` | O tipo de entidade à qual a tag se aplica (chave primária composta e chave estrangeira para `sac.TBtipo_entidade`). |
| `DFnome_exibicao` | `NVARCHAR(100)` | O nome de exibição da tag. |
| `DFcor` | `NVARCHAR(20)` | A cor semântica da tag (chave estrangeira para `sac.TBcor_semantica`). |
| `DFativo` | `CHAR(1)` | Indica se a tag está ativa (`S`) ou inativa (`N`). |

**Relacionamentos:**

- `sac.TBentidade_tag` (uma tag pode ser aplicada a várias entidades)
- `sac.TBtipo_entidade` (uma tag pertence a um tipo de entidade)
- `sac.TBcor_semantica` (uma tag tem uma cor semântica)



### 4.11. sac.TBentidade_tag

Esta tabela de junção (linking table) cria o relacionamento N:N entre as entidades e as tags. Ela permite que uma ou mais tags sejam associadas a uma entidade específica (como um chamado, contato ou cliente).

**Colunas Principais:**

| Coluna | Tipo | Descrição |
| --- | --- | --- |
| `DFtag` | `NVARCHAR(50)` | Chave estrangeira para `sac.TBtag`, indicando a tag que está sendo associada. Faz parte da chave primária composta. |
| `DFid_entidade` | `INTEGER` | O identificador da entidade que está sendo marcada. Faz parte da chave primária composta. |
| `DFdata_atribuicao` | `DATETIME` | A data e a hora em que a tag foi atribuída. |

**Relacionamentos:**

- `sac.TBtag` (uma associação de tag pertence a uma tag)

**Gatilhos (Triggers):**

- `TR_TBentidade_tag_ValidarCompatibilidade`: Garante que uma tag só possa ser associada a uma entidade do tipo correto (por exemplo, uma tag de "chamado" só pode ser aplicada a um chamado).
- `TR_TB*_LimparTags`: Gatilhos de exclusão em cascata que removem as associações de tags quando a entidade correspondente é excluída.



### 4.12. sac.TBtipo_entidade

Esta tabela de metadados define os tipos de entidade que existem no sistema, como "chamado", "contato", "cliente", etc. Ela é usada para garantir a integridade referencial no sistema de tags, assegurando que as tags sejam aplicadas apenas a tipos de entidade válidos.

**Colunas Principais:**

| Coluna | Tipo | Descrição |
| --- | --- | --- |
| `DFtipo_entidade` | `NVARCHAR(20)` | O nome do tipo de entidade (chave primária). |
| `DFnome_tabela` | `NVARCHAR(50)` | O nome da tabela correspondente a este tipo de entidade. |
| `DFnome_exibicao` | `NVARCHAR(100)` | O nome de exibição amigável para o tipo de entidade. |
| `DFpermite_tags` | `CHAR(1)` | Indica se este tipo de entidade pode ter tags associadas (`S` ou `N`). |

**Relacionamentos:**

- `sac.TBtag` (um tipo de entidade pode ter várias tags)



### 4.13. sac.TBcor_semantica

Esta tabela define uma paleta de cores semânticas para o sistema, permitindo que as cores sejam gerenciadas de forma centralizada e aplicadas a diferentes elementos da interface, como tags e status.

**Colunas Principais:**

| Coluna | Tipo | Descrição |
| --- | --- | --- |
| `DFcor` | `NVARCHAR(20)` | O nome da cor (chave primária). |
| `DFnome_exibicao` | `NVARCHAR(50)` | O nome de exibição da cor. |
| `DFhex_claro` | `CHAR(7)` | O código hexadecimal da cor para o tema claro. |
| `DFhex_escuro` | `CHAR(7)` | O código hexadecimal da cor para o tema escuro. |

**Relacionamentos:**

- `sac.TBtag` (uma cor pode ser aplicada a várias tags)
- `sac.TBtipo_entidade` (uma cor pode ser aplicada a vários tipos de entidade)


### 4.14. sac.TBtipo_prioridade

Esta tabela de lookup define os diferentes níveis de prioridade que podem ser atribuídos a um chamado, como "Baixa", "Normal", "Alta" e "Urgente".

**Colunas Principais:**

| Coluna | Tipo | Descrição |
| --- | --- | --- |
| `DFtipo_prioridade` | `CHAR(1)` | O código da prioridade (chave primária). |
| `DFnome_prioridade` | `NVARCHAR(50)` | O nome da prioridade. |
| `DFcor` | `NVARCHAR(20)` | A cor semântica associada à prioridade. |
| `DFpeso_ordenacao` | `INTEGER` | Um peso para ordenar as prioridades (quanto maior, mais prioritário). |

**Relacionamentos:**

- `sac.TBchamado` (uma prioridade pode ser aplicada a vários chamados)



## 5. Conclusão

O esquema `sac` foi projetado para fornecer uma base sólida e flexível para o novo sistema HelpDesk. A estrutura modular, o sistema de tags, a validação de dados e a documentação integrada contribuem para um banco de dados robusto, escalável e de fácil manutenção. As convenções de nomenclatura e as melhores práticas de modelagem de dados garantem a consistência e a legibilidade do esquema, facilitando o desenvolvimento e a manutenção do sistema a longo prazo.

### 4.15. sac.TBatendente_departamento

Esta tabela de junção (linking table) cria o relacionamento N:N entre os atendentes e os departamentos. Ela permite que um atendente seja associado a um ou mais departamentos, com um nível de permissão específico.

**Colunas Principais:**

| Coluna | Tipo | Descrição |
| --- | --- | --- |
| `DFid_atendente` | `INTEGER` | Chave estrangeira para `sac.TBatendente`, indicando o atendente. Faz parte da chave primária composta. |
| `DFid_departamento` | `INTEGER` | Chave estrangeira para `sac.TBdepartamento`, indicando o departamento. Faz parte da chave primária composta. |
| `DFpermissao_nivel` | `CHAR(1)` | O nível de permissão do atendente no departamento (`A`tendimento, `S`upervisor, `G`erente). |
| `DFativo` | `CHAR(1)` | Indica se a associação está ativa (`S`) ou inativa (`N`). |

**Relacionamentos:**

- `sac.TBatendente` (uma associação pertence a um atendente)
- `sac.TBdepartamento` (uma associação pertence a um departamento)

