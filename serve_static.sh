cd frontend && npm run build
cd ../backend
docker-compose down
docker-compose up -d
FRONTEND_URL="" # overwrite this variable 
# npm run build
# node dist/main.js
npm run start:dev

