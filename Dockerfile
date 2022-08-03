FROM node:18

# Cloning transcendence into image
RUN mkdir -p /usr/src/app && \
    git clone https://github.com/maxdesalle/ft_transcendence.git /usr/src/app

# If you change the workdir, change the location of the .env in the docker-compose
WORKDIR /usr/src/app

# Changing database's hostname to container name
RUN sed -i 's/host:\s*"127\.0\.0\.1"/host: "db"/g' \
    ./backend/src/config/typeorm.config.ts

# Building transcendence
RUN ./launch.sh --build

# --no-db becase the db will be ran by our docker-compose
ENTRYPOINT ["./launch.sh", "--no-db"]

# Backend
EXPOSE 3000
# Frontend
EXPOSE 8000
