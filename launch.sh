#!/bin/bash

# Check for .env file
if [ ! -f "backend/.env" ]; then
	echo 'Error: Missing backend/.env' 1>&2
	exit 1
fi

set -e
set -x

# Launch frontend
cd frontend
if [ ! -d "node_modules" ]; then
 	npm install
fi
npm run dev & P=$!

# Launch backend and db
cd ../backend
if [ ! -d "node_modules" ]; then
	npm install
fi
docker-compose up -d
npm run prebuild # To avoid the "Cannot find stats.service module' error.
npm run start:dev

kill $P
