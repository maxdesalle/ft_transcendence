FROM node:18

# Dockerfile arguments (defined in .env)
ARG DB_HOSTNAME
ARG APP_DIR

# Cloning transcendence into image
RUN mkdir -p $APP_DIR && \
    git clone https://github.com/maxdesalle/ft_transcendence.git $APP_DIR

WORKDIR $APP_DIR

# Changing database's hostname to container name
# then changing frontend bind-address
RUN sed -i "s/host:\s*\"127\.0\.0\.1\"/host: \"$DB_HOSTNAME\"/g" \
        ./backend/src/config/typeorm.config.ts \
    && \
    [ $(grep host ./frontend/vite.config.ts | wc -l) -eq 0 ] && \
        sed -i "s/^\s*port:\s*8000,\s*$/    port: 8000,\n    host: true,/g" \
            ./frontend/vite.config.ts || \
        (echo "ERROR: host is already defined in vite.config.ts" 2>&1 && exit 1)

# Building transcendence
RUN ./launch.sh --build

# --no-db becase the db will be ran by our docker-compose
ENTRYPOINT ["./launch.sh", "--no-db"]

# Frontend
EXPOSE 8000