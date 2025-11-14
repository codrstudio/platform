# Docker Setup - Platform Project

Configuração Docker para o projeto Platform com suporte para desenvolvimento e produção.

## Estrutura

```
docker/
├── Dockerfile         # Multi-stage build (frontend + backend)
├── nginx.conf        # Configuração Nginx para frontend
└── README.md         # Este arquivo
```

## Serviços

### Produção
- **redis** - Cache, Pub/Sub, e Streams (porta 6379)
- **backend** - Express + Node.js (porta 3000)
- **frontend** - Nginx servindo React (porta 80)

### Desenvolvimento (opcional)
- **dev** - Ambiente de desenvolvimento com hot-reload (portas 5173 e 3001)

### Ferramentas (opcional)
- **redis-commander** - Interface web para gerenciar Redis (porta 8081)

## Uso

### Produção

```bash
# Build e iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Reconstruir após mudanças
docker-compose up -d --build
```

Acessar:
- Frontend: http://localhost
- Backend API: http://localhost:3000/api
- Health check: http://localhost/health

### Desenvolvimento

```bash
# Iniciar ambiente de desenvolvimento
docker-compose --profile dev up -d

# Ver logs do ambiente dev
docker-compose logs -f dev

# Parar ambiente dev
docker-compose --profile dev down
```

Acessar:
- Frontend dev: http://localhost:5173
- Backend dev: http://localhost:3001/api

### Com Redis Commander

```bash
# Iniciar com ferramenta de gerenciamento Redis
docker-compose --profile tools up -d redis-commander

# Acessar Redis Commander
# http://localhost:8081
```

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this

# CORS
CORS_ORIGIN=http://localhost:5173

# Redis (opcional, usa defaults)
REDIS_HOST=redis
REDIS_PORT=6379

# n8n Backbone
N8N_URL=https://n8n.codrstudio.dev
```

## Build Manual

### Build apenas o backend
```bash
docker build -f docker/Dockerfile --target runtime -t platform-backend .
```

### Build ambiente de desenvolvimento
```bash
docker build -f docker/Dockerfile --target development -t platform-dev .
```

## Volumes

- **redis-data** - Dados persistentes do Redis
- **backend-uploads** - Arquivos enviados ao backend
- **backend-logs** - Logs do backend
- **frontend-dist** - Build do frontend (produção)

## Rede

Todos os serviços estão na rede `platform-network` e podem se comunicar usando os nomes dos serviços.

Exemplo: Backend acessa Redis via `redis://redis:6379`

## Health Checks

Todos os serviços possuem health checks configurados:

```bash
# Verificar status dos serviços
docker-compose ps

# Ver health status detalhado
docker inspect --format='{{.State.Health.Status}}' platform-backend
docker inspect --format='{{.State.Health.Status}}' platform-redis
```

## Troubleshooting

### Redis não está acessível
```bash
# Verificar logs do Redis
docker-compose logs redis

# Testar conexão manualmente
docker exec -it platform-redis redis-cli ping
```

### Backend não inicia
```bash
# Verificar logs do backend
docker-compose logs backend

# Verificar variáveis de ambiente
docker exec -it platform-backend env
```

### Frontend não carrega
```bash
# Verificar logs do Nginx
docker-compose logs frontend

# Testar configuração do Nginx
docker exec -it platform-frontend nginx -t
```

### Reconstruir tudo do zero
```bash
# Parar todos os serviços
docker-compose down -v

# Remover imagens
docker-compose down --rmi all

# Reconstruir e iniciar
docker-compose up -d --build
```

## Profiles

O docker-compose usa profiles para serviços opcionais:

- **dev** - Ambiente de desenvolvimento com hot-reload
- **tools** - Ferramentas de gerenciamento (Redis Commander)

Para usar múltiplos profiles:
```bash
docker-compose --profile dev --profile tools up -d
```

## Notas Importantes

1. O Dockerfile usa multi-stage build para otimizar o tamanho da imagem
2. A imagem de produção roda como usuário não-root (nodejs:nodejs)
3. O frontend é servido via Nginx para melhor performance
4. O backend se comunica com n8n (Backbone) via HTTPS
5. Redis está configurado com persistência e políticas de memória

## Requisitos

- Docker 20.10+
- Docker Compose 2.0+
- 2GB RAM disponível (mínimo)
- 10GB espaço em disco

## Performance

Configurações de performance:
- Redis: maxmemory 512mb, política allkeys-lru
- Backend: Health check a cada 30s
- Frontend: Gzip ativado, cache de 1 ano para assets estáticos
- Nginx: Proxy buffering desabilitado para SSE
