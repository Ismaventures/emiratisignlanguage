.PHONY: help install dev build test lint clean docker-up docker-down db-setup db-migrate db-seed

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies
	pnpm install

dev: ## Start all services in development mode
	pnpm dev

build: ## Build all packages and apps
	pnpm build

test: ## Run all tests
	pnpm test

lint: ## Run linter on all packages
	pnpm lint

typecheck: ## Run type checking on all packages
	pnpm typecheck

clean: ## Clean all build artifacts
	pnpm clean

docker-up: ## Start Docker infrastructure
	docker compose up -d

docker-down: ## Stop Docker infrastructure
	docker compose down

docker-logs: ## View Docker logs
	docker compose logs -f

db-setup: docker-up ## Setup database (generate + push)
	sleep 3
	pnpm db:generate
	pnpm db:push

db-migrate: ## Run database migrations
	pnpm db:migrate

db-seed: ## Seed the database
	pnpm db:seed

db-studio: ## Open Prisma Studio
	pnpm db:studio

format: ## Format code with Prettier
	pnpm exec prettier --write .

format:check: ## Check code formatting
	pnpm exec prettier --check .
