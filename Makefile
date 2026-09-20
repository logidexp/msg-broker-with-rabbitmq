.PHONY: up down restart logs status install client server

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

install:
	npm --prefix broker/server install
	npm --prefix broker/client install

run-broker-server:
	npm run start --prefix broker/server

run-broker-client:
	npm run dev --prefix broker/client
