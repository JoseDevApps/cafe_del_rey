# ─────────────────────────────────────────────────────────
#  Café del Rey — Makefile
#  Targets for Docker and Podman workflows
# ─────────────────────────────────────────────────────────

.PHONY: help \
        up down build logs shell-api shell-fe \
        podman-up podman-down podman-build podman-logs \
        podman-shell-api podman-shell-fe \
        podman-install podman-reset \
        clean

COMPOSE_FILE        := docker-compose.yml
PODMAN_COMPOSE_FILE := podman-compose.yml

# ── Help ─────────────────────────────────────────────────
help:
	@echo ""
	@echo "  Café del Rey — available targets"
	@echo ""
	@echo "  DOCKER"
	@echo "    make up            Build + start all services"
	@echo "    make down          Stop and remove containers"
	@echo "    make build         Rebuild images without cache"
	@echo "    make logs          Follow logs (all services)"
	@echo "    make shell-api     Shell inside the API container"
	@echo "    make shell-fe      Shell inside the frontend container"
	@echo ""
	@echo "  PODMAN"
	@echo "    make podman-install   Install podman-compose via pip"
	@echo "    make podman-up        Build + start with Podman"
	@echo "    make podman-down      Stop and remove Podman containers"
	@echo "    make podman-build     Rebuild Podman images"
	@echo "    make podman-logs      Follow Podman logs"
	@echo "    make podman-shell-api Shell inside Podman API container"
	@echo "    make podman-shell-fe  Shell inside Podman frontend"
	@echo "    make podman-reset     Remove all Podman volumes + containers"
	@echo ""
	@echo "  UTILS"
	@echo "    make clean         Remove __pycache__ and .next artifacts"
	@echo ""

# ── Docker targets ────────────────────────────────────────
up:
	docker compose -f $(COMPOSE_FILE) up --build

down:
	docker compose -f $(COMPOSE_FILE) down

build:
	docker compose -f $(COMPOSE_FILE) build --no-cache

logs:
	docker compose -f $(COMPOSE_FILE) logs -f

shell-api:
	docker compose -f $(COMPOSE_FILE) exec api sh

shell-fe:
	docker compose -f $(COMPOSE_FILE) exec frontend sh

# ── Podman targets ────────────────────────────────────────
podman-install:
	pip install --user podman-compose

# Prefer the native `podman compose` (Podman >= 4.4); fall back to podman-compose CLI
PODMAN_COMPOSE := $(shell podman compose version >/dev/null 2>&1 && echo "podman compose" || echo "podman-compose")

podman-up:
	$(PODMAN_COMPOSE) -f $(PODMAN_COMPOSE_FILE) up --build

podman-down:
	$(PODMAN_COMPOSE) -f $(PODMAN_COMPOSE_FILE) down

podman-build:
	$(PODMAN_COMPOSE) -f $(PODMAN_COMPOSE_FILE) build --no-cache

podman-logs:
	$(PODMAN_COMPOSE) -f $(PODMAN_COMPOSE_FILE) logs -f

podman-shell-api:
	podman exec -it cafe_api sh

podman-shell-fe:
	podman exec -it next_frontend_dev sh

podman-reset:
	$(PODMAN_COMPOSE) -f $(PODMAN_COMPOSE_FILE) down -v
	podman volume prune -f

# ── Utils ─────────────────────────────────────────────────
clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -name "*.pyc" -delete 2>/dev/null || true
	rm -rf .next 2>/dev/null || true
	@echo "Cleaned."
