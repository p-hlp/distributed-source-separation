docker compose down
# docker compose --env-file ./.env.local -f docker-compose.yml build
docker compose --env-file ./.env.local -f docker-compose.yml up -d
docker compose --env-file ./.env.local -f docker-compose.yml logs -f