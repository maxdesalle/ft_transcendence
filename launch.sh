#!/bin/bash

set -x
set -e

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
