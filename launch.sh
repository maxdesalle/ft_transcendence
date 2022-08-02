#!/bin/bash

set -e

ROOT_DIR=$(pwd)

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
    if [ ! -f "backend/.env" ]; then
        echo 'Error: Missing backend/.env' 1>&2
        exit 1
    fi
    # Launch backend and db
    cd $ROOT_DIR/backend
    npm install
    docker-compose up -d
    npm run start:dev
}

exec_backend_no_db () {
    # Check for .env file
    if [ ! -f "backend/.env" ]; then
        echo 'Error: Missing backend/.env' 1>&2
        exit 1
    fi
    # Launch backend
    cd $ROOT_DIR/backend
    npm install
    npm run start:dev
}

exec_frontend() {
    # Launch frontend
    cd $ROOT_DIR/frontend
    npm install
    npm run dev
}

exec_all () {
    exec_frontend & P=$!
    exec_backend
    kill $P
}

exec_all_no_db () {
    exec_frontend & P=$!
    exec_backend_no_db
    kill $P
}

# Argument handling
BDB=true
if [[ $# = 1 && $1 = '--build' ]]; then
    BBACK=true
    BFRONT=true
    BEXEC=false
elif [[  $# = 1 && $1 = '--build-backend' ]]; then
    BBACK=true
    BFRONT=false
    BEXEC=false
elif [[  $# = 1 && $1 = '--build-frontend' ]]; then
    BBACK=false
    BFRONT=true
    BEXEC=false
elif [[ $# = 1 && $1 = '--no-db' ]]; then
     BBACK=true
     BFRONT=true
     BEXEC=true
     BDB=false
elif [[  $# = 0 ]]; then
    BBACK=true
    BFRONT=true
    BEXEC=true
else
    echo 'launch.sh -- launch or build ft_transcendence
    (none)              --> builds (if necessary) and launches ft_transcendance
    --build-backend     --> only builds backend
    --build-frontend    --> only builds frontend
    --no-db             --> runs transcendence with the database' 1>&2
    exit 1
fi

set -x

# Executing functions according to arguments
if $BBACK && $BFRONT && $BEXEC; then
    if $BDB; then exec_all;
    else exec_all_no_db; fi
    exit 0
fi

if ! $BEXEC; then
    if $BBACK; then
        build_backend
    fi
    if $BFRONT; then
        build_frontend
    fi
    exit 0
fi
