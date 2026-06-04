.PHONY: help all makeall install env docker-up docker-down docker-logs db-generate db-push db-setup dev build start lint typecheck check setup clean

# Default DATABASE_URL matches docker-compose.yml
DATABASE_URL ?= postgresql://resume:resume@localhost:5432/ai_resume_builder
export DATABASE_URL

help:
	@echo "AI Resume Builder — available targets:"
	@echo ""
	@echo "  make all       Full first-time setup (install + env + docker + db)"
	@echo "  make makeall   Same as 'make all'"
	@echo "  make setup     install + env + db-generate"
	@echo "  make dev       Start Next.js dev server"
	@echo "  make build     Production build"
	@echo "  make check     lint + typecheck + build"
	@echo ""
	@echo "  make install       npm install"
	@echo "  make env           Copy .env.example -> .env"
	@echo "  make docker-up     Start Postgres + Redis (Docker Desktop must be running)"
	@echo "  make docker-down   Stop Docker services"
	@echo "  make db-push       Push Prisma schema to database"
	@echo "  make db-generate   Generate Prisma client"
	@echo "  make db-setup      db-generate + db-push"

all makeall: install env docker-up db-setup
	@echo ""
	@echo "Setup complete. Edit .env with OAuth + OpenAI keys, then run: make dev"

setup: install env db-generate
	@echo "Run 'make docker-up && make db-push' if using local Docker Postgres."

install:
	npm install

env:
	@if [ ! -f .env ]; then cp .env.example .env && echo "Created .env from .env.example"; else echo ".env already exists"; fi

docker-up:
	docker compose up -d postgres redis

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f postgres redis

db-generate:
	npm run db:generate

db-push:
	npm run db:push

db-setup: db-generate db-push

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

lint:
	npm run lint

typecheck:
	npm run typecheck

check: lint typecheck build

clean:
	rm -rf .next node_modules
