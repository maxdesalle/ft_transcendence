FROM node:18

# Cloning transcendence into image
RUN mkdir -p /usr/src/app && \
    git clone https://github.com/maxdesalle/ft_transcendence.git /usr/src/app

WORKDIR /usr/src/app

# Building transcendence
RUN ./launch --build

# --no-db becase the db will be ran by our docker-compose
ENTRYPOINT ['/usr/src/app/launch', '--no-db']

EXPOSE 3000 # Backend
EXPOSE 8000 # Frontend
