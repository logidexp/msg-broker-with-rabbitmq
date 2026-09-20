.PHONY: up down restart logs status

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose restart

logs:
	docker compose logs -f rabbitmq

status:
	docker compose ps
