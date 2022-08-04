FROM node:18

# Dockerfile arguments (defined in .env)
ARG DB_HOSTNAME
ARG APP_DIR

# Cloning transcendence into image
RUN mkdir -p $APP_DIR && \
    git clone https://github.com/maxdesalle/ft_transcendence.git $APP_DIR

WORKDIR $APP_DIR

# Changing database's hostname to container name
RUN sed -i "s/host:\s*\"127\.0\.0\.1\"/host: \"$DB_HOSTNAME\"/g" \
    ./backend/src/config/typeorm.config.ts

# Building transcendence
RUN ./launch.sh --build

# --no-db becase the db will be ran by our docker-compose
ENTRYPOINT ["./launch.sh", "--no-db"]

# Backend
EXPOSE 3000
# Frontend
EXPOSE 8000
