lint:
	pnpm eslint .

lint.fix:
	pnpm eslint . --fix

astra.service:
	cross-env NODE_ENV="development" env-cmd -f astra/service/.env pnpm nx run astra/service:serve

astra.ui:
	cross-env NODE_ENV="development" env-cmd -f astra/ui/.env pnpm nx serve astra/ui

astra.ui.build:
	pnpm nx build astra/ui

astra.docker:
	docker-compose up astra_db

astra.docker.stop:
	docker-compose stop astra_db

astra.docker.prune:
	docker-compose down --remove-orphans

astra.sandbox.build:
	docker build . -f ./astra/service/env.dockerfile -t astra_sandbox
