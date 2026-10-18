BACKEND_DIR := J2EE-Backend
FRONTEND_DIR := J2EE-Frontend
DB_NAME := datvemaybay

.PHONY: help setup install dev backend frontend build clean db check

help: ## Hiện trợ giúp
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

setup: ## Copy .env.example -> .env nếu thiếu
	@test -f $(BACKEND_DIR)/.env || cp $(BACKEND_DIR)/.env.example $(BACKEND_DIR)/.env
	@test -f $(FRONTEND_DIR)/.env || cp $(FRONTEND_DIR)/.env.example $(FRONTEND_DIR)/.env
	@echo "OK: .env sẵn sàng. Sửa DB_PASSWORD/JWT_SECRET trước khi dev."

install: setup ## Cài deps frontend (backend tự fetch qua mvnw)
	cd $(FRONTEND_DIR) && pnpm install

db: ## Tạo DB MySQL local nếu chưa có
	mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS $(DB_NAME) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

check: ## Check java/node/pnpm/mysql + .env
	@java -version 2>&1 | head -n 1
	@node -v && pnpm -v
	@mysql --version
	@test -f $(BACKEND_DIR)/.env || (echo "Thiếu $(BACKEND_DIR)/.env, chạy: make setup" && exit 1)
	@test -f $(FRONTEND_DIR)/.env || (echo "Thiếu $(FRONTEND_DIR)/.env, chạy: make setup" && exit 1)

backend: ## Chạy backend :8080/api
	cd $(BACKEND_DIR) && ./mvnw spring-boot:run

frontend: ## Chạy frontend :5173
	cd $(FRONTEND_DIR) && pnpm run dev

dev: check ## Chạy cả backend + frontend (Ctrl+C dừng hết)
	trap 'kill 0' INT TERM EXIT; \
	$(MAKE) backend & $(MAKE) frontend & wait

build: ## Build prod cả 2 phía
	cd $(BACKEND_DIR) && ./mvnw package -DskipTests
	cd $(FRONTEND_DIR) && pnpm run build

clean: ## Xóa build output
	cd $(BACKEND_DIR) && ./mvnw clean
	rm -rf $(FRONTEND_DIR)/dist
