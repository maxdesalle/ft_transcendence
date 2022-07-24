#!/bin/bash

if [ ! -f "backend/.env" ]; then
	echo 'Error: Missing backend/.env' 1>&2
	exit 1
fi

set -e
set -x

cd frontend
if [ ! -d "node_modules" ]; then
  npm install
fi
npm run dev & P=$!

cd ../backend
if [ ! -d "node_modules" ]; then
  npm install
fi
docker-compose up -d
npm run start:dev

kill $P
