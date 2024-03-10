docker compose --env-file ./.env -f docker-compose.yml build
docker compose --env-file ./.env -f docker-compose.yml down
docker compose --env-file ./.env -f docker-compose.yml up -d
docker compose --env-file ./.env -f docker-compose.yml logs -f