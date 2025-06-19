# Makefile for My Health Companion
# Usage: make <target>

.PHONY: help install-postgres setup-db install-deps init-db insert-data dev prod clean

# Default target
help:
	@echo "Available targets:"
	@echo "  install-postgres  - Install PostgreSQL (Ubuntu/Debian)"
	@echo "  setup-db         - Create database and user"
	@echo "  install-deps     - Install all dependencies"
	@echo "  init-db          - Initialize database tables"
	@echo "  insert-data      - Insert default data"
	@echo "  setup           - Complete setup (postgres + deps + db)"
	@echo "  dev             - Start development environment"
	@echo "  prod            - Start production environment"
	@echo "  clean           - Clean up temporary files"

# Install PostgreSQL (Ubuntu/Debian)
install-postgres:
	@echo "Installing PostgreSQL..."
	sudo apt update
	sudo apt install -y postgresql postgresql-contrib
	@echo "PostgreSQL installed successfully!"

# Setup database and user
setup-db:
	@echo "Setting up database..."
	sudo -u postgres createuser --interactive --pwprompt postgres || true
	sudo -u postgres createdb health_app || true
	@echo "Database setup completed!"

# Install all dependencies
install-deps:
	@echo "Installing dependencies..."
	npm run install:all
	@echo "Dependencies installed successfully!"

# Initialize database tables
init-db:
	@echo "Initializing database tables..."
	cd backend && python init_db.py
	@echo "Database tables created successfully!"

# Insert default data
insert-data:
	@echo "Inserting default data..."
	cd backend && python insert_defaults.py
	@echo "Default data inserted successfully!"

# Complete setup (everything except PostgreSQL installation)
setup: setup-db install-deps init-db insert-data
	@echo "Setup completed! You can now run 'make dev'"

# Start development environment
dev:
	@echo "Starting development environment..."
	npm run dev

# Start development environment with Docker database
dev-docker:
	@echo "Starting development environment with Docker database..."
	sudo docker compose up -d db
	sleep 5
	concurrently -n "backend,frontend" -c "auto,blue" "npm run start:backend" "npm run start:frontend"

# Start production environment
prod:
	@echo "Starting production environment..."
	npm run start:prod

# Clean up temporary files
clean:
	@echo "Cleaning up..."
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	@echo "Cleanup completed!"

# Quick start for developers with PostgreSQL already installed
quick-start: install-deps init-db insert-data
	@echo "Quick setup completed! You can now run 'make dev'"

# Setup for macOS (using Homebrew)
setup-mac:
	@echo "Setting up PostgreSQL on macOS..."
	brew install postgresql
	brew services start postgresql
	@echo "PostgreSQL installed and started on macOS!"
	@echo "Now run 'make setup' to complete the setup"

# Docker database commands
db-up:
	@echo "Starting database with Docker..."
	sudo docker compose up -d db

db-down:
	@echo "Stopping database with Docker..."
	sudo docker compose down

db-reset:
	@echo "Resetting database with Docker..."
	sudo docker compose down -v
	sudo docker compose up -d db 