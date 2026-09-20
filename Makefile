.PHONY: up down restart logs status build install run-broker-server run-broker-client run-consumer-server run-consumer-client

up:
	docker-compose up -d --build

down:
	docker-compose down

restart:
	docker-compose restart

logs:
	docker-compose logs -f

status:
	docker-compose ps

build:
	docker-compose build

install:
	npm --prefix broker/server install
	npm --prefix broker/client install
	npm --prefix consumer/server install
	npm --prefix consumer/client install

run-broker-server:
	npm run start --prefix broker/server

run-broker-client:
	npm run dev --prefix broker/client

run-consumer-server:
	npm run start --prefix consumer/server

run-consumer-client:
	npm run dev --prefix consumer/client
