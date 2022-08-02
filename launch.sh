#!/bin/bash

set -e

ROOT_DIR=$(pwd)
FRONTEND_PID=''

kill_frontend() {
    if ! [[ $FRONTEND_PID = '' ]]; then
        kill $FRONTEND_PID
    fi
    FRONTEND_PID=''
}

check_env() {
    if [ ! -f "$ROOT_DIR/backend/.env" ]; then
        echo 'Error: Missing backend/.env' 1>&2
        kill_frontend
        exit 1
    fi
}

build_backend () {
    cd $ROOT_DIR/backend
    npm install
    npm run prebuild # To avoid the "Cannot find stats.service module' error.
}

build_frontend () {
    cd $ROOT_DIR/frontend
    npm install
}

exec_backend () {
    # Check for .env file
    check_env
    # Launch backend and db
    cd $ROOT_DIR/backend
    npm install
    docker-compose up -d
    npm run start:dev
}

exec_backend_no_db () {
    # Check for .env file
    check_env
    # Launch backend
    cd $ROOT_DIR/backend
    npm install
    npm run start:dev
}

exec_frontend() {
    cd $ROOT_DIR/frontend
    npm install
    npm run dev & FRONTEND_PID=$!
}

exec_all () {
    exec_frontend
    exec_backend
}

exec_all_no_db () {
    exec_frontend || exit 1
    exec_backend_no_db
}

# Argument handling
if [[ $# = 1 && $1 = '--build' ]]; then
    build_backend
    build_frontend
elif [[ $# = 1 && $1 = '--no-db' ]]; then
    build_backend
    build_frontend
    exec_all_no_db
elif [[ $# = 0 ]]; then
    build_backend
    build_frontend
    exec_all
else
    echo 'launch.sh -- build/launch ft_transcendence
    (none)              --> builds (if necessary) and launches transcendance
    --build             --> builds (if nexessary) transcendence
    --no-db             --> builds (if nexessary) and runs transcendence without the database' 1>&2
    exit 1
fi

# To make sure frontend does not block the script
kill_frontend
