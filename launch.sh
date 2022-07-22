#!/bin/bash

set -x
set -e

cd frontend
npm i
npm run dev & P=$!

cd ../backend
npm i --force
docker-compose up -d
npm run start:dev

kill $P
