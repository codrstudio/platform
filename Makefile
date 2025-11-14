# =============================================================================
# Platform Project - Docker Makefile
# =============================================================================

.PHONY: help build up down restart logs clean dev prod tools status health

# Default target
.DEFAULT_GOAL := help

# Colors
CYAN := \033[0;36m
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m

## help: Show this help message
help:
	@echo "$(CYAN)Platform Project - Docker Commands$(NC)"
	@echo ""
	@echo "$(GREEN)Production:$(NC)"
	@echo "  make prod         - Start production environment"
	@echo "  make build        - Build production images"
	@echo "  make up           - Start all services"
	@echo "  make down         - Stop all services"
	@echo "  make restart      - Restart all services"
	@echo ""
	@echo "$(GREEN)Development:$(NC)"
	@echo "  make dev          - Start development environment with hot-reload"
	@echo "  make dev-build    - Build and start development environment"
	@echo "  make dev-down     - Stop development environment"
	@echo ""
	@echo "$(GREEN)Monitoring:$(NC)"
	@echo "  make logs         - View logs (all services)"
	@echo "  make logs-backend - View backend logs"
	@echo "  make logs-redis   - View Redis logs"
	@echo "  make status       - Show services status"
	@echo "  make health       - Check services health"
	@echo ""
	@echo "$(GREEN)Tools:$(NC)"
	@echo "  make tools        - Start Redis Commander"
	@echo "  make redis-cli    - Open Redis CLI"
	@echo ""
	@echo "$(GREEN)Maintenance:$(NC)"
	@echo "  make clean        - Remove containers, volumes, and images"
	@echo "  make prune        - Clean Docker system (careful!)"
	@echo "  make rebuild      - Rebuild and restart (production)"
	@echo "  make rebuild-dev  - Rebuild and restart (development)"

# =============================================================================
# Production Commands
# =============================================================================

## build: Build production images
build:
	@echo "$(CYAN)Building production images...$(NC)"
	docker-compose build

## up: Start all production services
up:
	@echo "$(CYAN)Starting production services...$(NC)"
	docker-compose up -d

## prod: Build and start production environment
prod: build up
	@echo "$(GREEN)Production environment started!$(NC)"
	@echo "Frontend: http://localhost"
	@echo "Backend: http://localhost:3000"

## down: Stop all services
down:
	@echo "$(CYAN)Stopping services...$(NC)"
	docker-compose down

## restart: Restart all services
restart: down up
	@echo "$(GREEN)Services restarted!$(NC)"

## rebuild: Rebuild and restart production
rebuild:
	@echo "$(CYAN)Rebuilding production environment...$(NC)"
	docker-compose down
	docker-compose build --no-cache
	docker-compose up -d
	@echo "$(GREEN)Production environment rebuilt!$(NC)"

# =============================================================================
# Development Commands
# =============================================================================

## dev: Start development environment
dev:
	@echo "$(CYAN)Starting development environment...$(NC)"
	docker-compose -f docker-compose.dev.yml up -d
	@echo "$(GREEN)Development environment started!$(NC)"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend: http://localhost:3000"
	@echo "Redis Commander: http://localhost:8081"

## dev-build: Build and start development environment
dev-build:
	@echo "$(CYAN)Building development environment...$(NC)"
	docker-compose -f docker-compose.dev.yml build
	docker-compose -f docker-compose.dev.yml up -d
	@echo "$(GREEN)Development environment started!$(NC)"

## dev-down: Stop development environment
dev-down:
	@echo "$(CYAN)Stopping development environment...$(NC)"
	docker-compose -f docker-compose.dev.yml down

## rebuild-dev: Rebuild and restart development
rebuild-dev:
	@echo "$(CYAN)Rebuilding development environment...$(NC)"
	docker-compose -f docker-compose.dev.yml down
	docker-compose -f docker-compose.dev.yml build --no-cache
	docker-compose -f docker-compose.dev.yml up -d
	@echo "$(GREEN)Development environment rebuilt!$(NC)"

# =============================================================================
# Monitoring Commands
# =============================================================================

## logs: View logs from all services
logs:
	docker-compose logs -f

## logs-backend: View backend logs
logs-backend:
	docker-compose logs -f backend

## logs-frontend: View frontend logs
logs-frontend:
	docker-compose logs -f frontend

## logs-redis: View Redis logs
logs-redis:
	docker-compose logs -f redis

## logs-dev: View development logs
logs-dev:
	docker-compose -f docker-compose.dev.yml logs -f

## status: Show services status
status:
	@echo "$(CYAN)Services Status:$(NC)"
	docker-compose ps

## health: Check services health
health:
	@echo "$(CYAN)Health Checks:$(NC)"
	@echo ""
	@echo "$(YELLOW)Backend:$(NC)"
	@curl -s http://localhost:3000/api/1/health || echo "$(RED)Backend unreachable$(NC)"
	@echo ""
	@echo "$(YELLOW)Frontend:$(NC)"
	@curl -s http://localhost/health || echo "$(RED)Frontend unreachable$(NC)"
	@echo ""
	@echo "$(YELLOW)Redis:$(NC)"
	@docker exec platform-redis redis-cli ping || echo "$(RED)Redis unreachable$(NC)"

# =============================================================================
# Tools Commands
# =============================================================================

## tools: Start Redis Commander
tools:
	@echo "$(CYAN)Starting Redis Commander...$(NC)"
	docker-compose --profile tools up -d redis-commander
	@echo "$(GREEN)Redis Commander: http://localhost:8081$(NC)"

## redis-cli: Open Redis CLI
redis-cli:
	@docker exec -it platform-redis redis-cli

# =============================================================================
# Maintenance Commands
# =============================================================================

## clean: Remove containers, volumes, and images
clean:
	@echo "$(RED)Removing all containers, volumes, and images...$(NC)"
	docker-compose down -v --rmi all
	@echo "$(GREEN)Cleanup complete!$(NC)"

## clean-dev: Remove development containers and volumes
clean-dev:
	@echo "$(RED)Removing development environment...$(NC)"
	docker-compose -f docker-compose.dev.yml down -v --rmi all
	@echo "$(GREEN)Development cleanup complete!$(NC)"

## prune: Clean Docker system (careful!)
prune:
	@echo "$(RED)WARNING: This will remove all unused Docker resources!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker system prune -a --volumes -f; \
		echo "$(GREEN)System pruned!$(NC)"; \
	else \
		echo "$(YELLOW)Cancelled.$(NC)"; \
	fi

# =============================================================================
# Utility Commands
# =============================================================================

## shell-backend: Open shell in backend container
shell-backend:
	docker exec -it platform-backend sh

## shell-frontend: Open shell in frontend container
shell-frontend:
	docker exec -it platform-frontend sh

## shell-redis: Open shell in Redis container
shell-redis:
	docker exec -it platform-redis sh
