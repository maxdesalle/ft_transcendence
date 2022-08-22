export VITE_HOST=127.0.0.1

# display warning
printf "\033[31;1m"
echo "!! Host IP is set to" $VITE_HOST "- make sure this matches your .env file!!"
echo "If not, change the 1st line of serve_static.sh"
printf "\033[39m\n"
echo "This script does not install node modules (so do it first if you haven't done so yet)"

# build frontend
# cd frontend && npm run build && cd ..

# restart DB with a fresh one
cd backend
docker-compose down
docker-compose up -d

# set env vars
export FRONTEND_URL="" # overwriting this variable 
export SERVE_STATIC=true
# build backend
# npm run build

# launch server
# node dist/main.js
npm run start:dev

