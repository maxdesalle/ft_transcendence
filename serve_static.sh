export VITE_HOST=127.0.0.1
echo "!! Host IP is set to" $VITE_HOST "- make sure this matches your .env file!!"
cd frontend && npm run build
cd ..

cd backend

docker-compose down
docker-compose up -d
export FRONTEND_URL="" # overwrite this variable 
export SERVE_STATIC=true
# npm run build
# node dist/main.js
npm run start:dev

