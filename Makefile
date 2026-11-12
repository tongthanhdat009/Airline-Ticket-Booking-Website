# Airline — task runner (pwsh, chạy được trên Windows + Linux/macOS có pwsh)
# Chạy: make setup | install | db | check | backend | frontend | dev | build | clean
# Yêu cầu: GNU Make + pwsh 7+, Java 21, Node 20+ (npm), MySQL qua docker
# (container airline-mysql-8) hoặc mysql client nếu không dùng docker
# QUAN TRỌNG: bản make Windows32 không truyền được UTF-8 qua command line,
# nên mọi DÒNG RECIPE (dòng bắt đầu bằng TAB) phải là ASCII thuần (tiếng Việt
# không dấu). Chữ có dấu chỉ được dùng trong comment và sau ## (help text).

ifeq ($(OS),Windows_NT)
SHELL := pwsh.exe
MVNW := ./mvnw.cmd
else
SHELL := pwsh
MVNW := ./mvnw
endif
.SHELLFLAGS := -NoProfile -Command
# Lưu ý: KHÔNG dùng .ONESHELL — bản make Windows32 chỉ tôn trọng SHELL
# ở chế độ mỗi-dòng-một-process; .ONESHELL sẽ rơi về cmd.exe.
# Vì vậy mỗi dòng recipe phải tự chứa (Push-Location/Pop-Location trên cùng dòng).

BACKEND_DIR := J2EE-Backend
FRONTEND_DIR := J2EE-Frontend
DB_NAME := datvemaybay

.PHONY: help setup install db check backend frontend dev build clean

help: ## Hiện trợ giúp
	@Select-String -Path $(MAKEFILE_LIST) -Pattern '^([A-Za-z0-9_.-]+)\s*:.*##\s*(.*)$$' | ForEach-Object { $$m = $$_.Matches[0].Groups; Write-Host ("  {0,-12} {1}" -f $$m[1].Value, $$m[2].Value) }

setup: ## Copy .env.example -> .env nếu thiếu
	if (!(Test-Path "$(BACKEND_DIR)/.env")) { Copy-Item "$(BACKEND_DIR)/.env.example" "$(BACKEND_DIR)/.env"; Write-Output "Copied $(BACKEND_DIR)/.env" }
	if (!(Test-Path "$(FRONTEND_DIR)/.env")) { Copy-Item "$(FRONTEND_DIR)/.env.example" "$(FRONTEND_DIR)/.env"; Write-Output "Copied $(FRONTEND_DIR)/.env" }
	Write-Output "OK: .env san sang. Sua DB_PASSWORD/JWT_SECRET truoc khi dev."

install: setup ## Cài deps frontend (backend tự fetch qua mvnw)
	Push-Location "$(FRONTEND_DIR)"; npm install; Pop-Location

db: ## Tạo DB MySQL nếu chưa có (ưu tiên docker airline-mysql-8)
	$$pw = ''; if (Test-Path "$(BACKEND_DIR)/.env") { $$mm = Select-String -Path "$(BACKEND_DIR)/.env" -Pattern '^DB_PASSWORD=(.*)$$'; if ($$mm) { $$pw = ($$mm.Matches.Groups[1].Value.Trim() -replace '^[''"]|[''"]$$', '') } }; if (docker ps --format '{{.Names}}' 2>$$null | Select-String -Pattern '^airline-mysql-8$$' -Quiet) { if ([string]::IsNullOrEmpty($$pw)) { Write-Error 'Thieu DB_PASSWORD trong $(BACKEND_DIR)/.env'; exit 1 }; docker exec airline-mysql-8 mysql -uroot --password=$$pw -e "CREATE DATABASE IF NOT EXISTS $(DB_NAME) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" } else { mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS $(DB_NAME) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" }

check: ## Check java/node/npm/mysql + .env
	java -version
	node -v
	npm -v
	if (Get-Command mysql -ErrorAction SilentlyContinue) { mysql --version } else { $$pw2 = ''; if (Test-Path "$(BACKEND_DIR)/.env") { $$mm2 = Select-String -Path "$(BACKEND_DIR)/.env" -Pattern '^DB_PASSWORD=(.*)$$'; if ($$mm2) { $$pw2 = ($$mm2.Matches.Groups[1].Value.Trim() -replace '^[''"]|[''"]$$', '') } }; if ([string]::IsNullOrEmpty($$pw2)) { Write-Error 'Thieu DB_PASSWORD trong $(BACKEND_DIR)/.env'; exit 1 }; $$o = docker exec airline-mysql-8 mysqladmin ping -h localhost -uroot --password=$$pw2 2>&1 | Out-String; if ($$o -notmatch 'mysqld is alive') { Write-Error 'MySQL khong truy cap duoc - chay: docker start airline-mysql-8'; exit 1 }; Write-Output 'OK: MySQL (docker airline-mysql-8)' }
	if (!(Test-Path "$(BACKEND_DIR)/.env")) { Write-Error "Thieu $(BACKEND_DIR)/.env, chay: make setup"; exit 1 }
	if (!(Test-Path "$(FRONTEND_DIR)/.env")) { Write-Error "Thieu $(FRONTEND_DIR)/.env, chay: make setup"; exit 1 }

backend: ## Chạy backend :8080/api
	Push-Location "$(BACKEND_DIR)"; & $(MVNW) spring-boot:run; Pop-Location

frontend: ## Chạy frontend :5181
	Push-Location "$(FRONTEND_DIR)"; npm run dev; Pop-Location

dev: check ## Chạy cả backend + frontend (Ctrl+C dừng hết)
	$(MAKE) -j2 backend frontend

build: ## Build prod cả 2 phía
	Push-Location "$(BACKEND_DIR)"; & $(MVNW) package -DskipTests; Pop-Location
	Push-Location "$(FRONTEND_DIR)"; npm run build; Pop-Location

clean: ## Xóa build output
	Push-Location "$(BACKEND_DIR)"; & $(MVNW) clean; Pop-Location
	if (Test-Path "$(FRONTEND_DIR)/dist") { Remove-Item -Recurse -Force "$(FRONTEND_DIR)/dist" }
