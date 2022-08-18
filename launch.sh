#!/bin/bash

set -e

PID_FILE_NAME='.pid_list'
ROOT_DIR=$(pwd)

# execute if --stop argument provided
kill_all() {
	cd $ROOT_DIR/backend
    docker-compose down
	cd $ROOT_DIR
    [[ -f $PID_FILE_NAME ]] || return 0
    grep FRONTEND_PID $ROOT_DIR/$PID_FILE_NAME | awk '{print $2}' | xargs kill
    grep BACKEND_PID $ROOT_DIR/$PID_FILE_NAME | awk '{print $2}' | xargs kill
    rm $ROOT_DIR/$PID_FILE_NAME
}

# cleanup function
kill_subprocesses() {
    cat <<< "$(jobs -p)"
    for proc in $(jobs -p);
    do
        kill $proc
    done
    # so that kill_all does not kill again the processes
    [[ -f "$ROOT_DIR/$PID_FILE_NAME" ]] && rm "$ROOT_DIR/$PID_FILE_NAME" || return 0
}
# cleaning everything if ^C is pressed
trap kill_subprocesses SIGINT

check_env() {
    if [ ! -f "$ROOT_DIR/backend/.env" ]; then
        echo 'Error: Missing backend/.env' 1>&2
        kill_subprocesses
        exit 1
    fi
}

build_backend () {
    cd $ROOT_DIR/backend
    npm install
    # npm run prebuild # To avoid the "Cannot find stats.service module' error.
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
    # Execute docker db if no argument passed
    [[ $1 = '--no-db' ]] || docker-compose up -d
    npm run start:dev & BACKEND_PID=$!
    echo BACKEND_PID $BACKEND_PID >> $ROOT_DIR/$PID_FILE_NAME
    wait $BACKEND_PID
}

exec_frontend() {
    cd $ROOT_DIR/frontend
    npm install
    npm run dev & FRONTEND_PID=$!
    echo FRONTEND_PID $FRONTEND_PID >> $ROOT_DIR/$PID_FILE_NAME
}

exec_all() {
    exec_frontend
    exec_backend $1
}

# Argument handling
if [[ $# = 1 && $1 = '--stop' ]]; then
    kill_all
elif [[ $# = 1 && $1 = '--build' ]]; then
    build_backend
    build_frontend
elif [[ $# = 1 && $1 = '--no-db' ]]; then
    build_backend
    build_frontend
    exec_all --no-db
elif [[ $# = 0 ]]; then
    build_backend
    build_frontend
    exec_all
else
    echo "launch.sh -- build/launch ft_transcendence
    (none)              --> builds (if necessary) and launches transcendance
    --build             --> builds (if nexessary) transcendence
    --no-db             --> builds (if nexessary) and runs transcendence without the database
    --stop              --> stops transcendence's running processes" 1>&2
    exit 1
fi

# cleaning processes
kill_subprocesses
