# Base image
FROM node:18

#update npm
RUN npm install -g npm@8.18.0

# install node dependencies (slowest part)
# backend 
WORKDIR /usr/src/backend
COPY backend/package*.json ./
RUN npm install

# frontend
WORKDIR /usr/src/frontend
COPY frontend/package*.json ./
RUN npm install

# build apps
# backend
WORKDIR /usr/src/backend
COPY backend/ .
RUN npm run build

# frontend
WORKDIR /usr/src/frontend
COPY frontend/ .
ARG VITE_HOST
RUN npm run build

# Start backend node server
WORKDIR /usr/src/backend
CMD [ "node", "dist/main.js" ]
# CMD [ "bin/bash"]
