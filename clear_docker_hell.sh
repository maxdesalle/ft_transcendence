docker-compose down
cd backend && docker-compose --env-file ../.env down
docker system prune --force
