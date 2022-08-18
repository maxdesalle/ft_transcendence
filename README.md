## HOW TO RUN

- have the .env file at the ROOT of the repo

- `docker-composer up`

## How to deploy it to the cloud
Change the app's image tag to `194.233.174.172` in the docker-compose.yml file

The images are here: https://hub.docker.com/repository/docker/rcammaro/transcendence

### Database connection failure:
Consider clearing your docker volumes, specially if you changed the password in the .env file after launching the DB for the first time (DB config will persist...):
```
docker volume rm `docker volume ls`

```
Other useful docker clearing stuff:  
`docker-compose down`
`docker system prune`