.PHONY: help install build run dev

help:
	@echo "  help         - Show this help message"
	@echo "  install      - Install deps"
	@echo "  build        - Build project"
	@echo "  run          - Build and run"
	@echo "  dev          - Run in dev mode - no build"

install:
	npm install

build: install
	npm run build

run: check_for_dotenv
	node build/index.js

dev: build check_for_dotenv
	node build/index.js -v

# ------------- non public -------------

check_for_dotenv:
	@if [ ! -f .env ]; then \
        echo "Error: .env file not found."; \
        exit 1; \
    fi

.DEFAULT_GOAL := help
