## How to make stuff happen

First you need a .env file at the repo's root, like this: (cannot put secret stuff in a public repo, sorry)
```
    # auth
    FORTYTWO_CLIENT_ID=<you gotta provide the right one>  
    FORTYTWO_CLIENT_SECRET=<you gotta provide the right one>  
    FORTYTWO_CALLBACK_URL="http://127.0.0.1:3000/login/42/return"  
    JWT_TOKEN_SECRET=<whatever you wish>  
    JWT_TOKEN_EXPIRY=<some time, like "3600s"> 

    # database
    DB_PASSWORD=<whatever you wish, but DON'T USE QUOTES around it>

    # avatar photo
    AVATAR_DEFAULT_FILE="images/avatardefault.png"
    AVATAR_MAX_SIZE=1000000
```
Then:
* install node dependencies (if not yet done): `npm install`
* launch database container: `docker-compose up -d`
* launch node server in watch mode: `npm run start:dev`

OR: `./launch.sh` (have the **.env** file ready)

The app should be available at localhost:3000

-----------------------

### How to access the database:
**Adminer** is available at localhost:8080
System: PostgreSQL  
Server:db  
Username: postgres	  
Password: <the value of DB_PASSWORD in your .env file>  
Database: postgres	  

----------------------------

### How to access the database with the psql client (if you really like the terminal):
`docker exec -it db psql -U postgres`

Useful commands:
* \d (show tables)
* \d [table name] (describe table)


----------------------
### Mock-authentication
You can log in as a mock user bypassing the OAuth-intra-42 drill via 
```
POST localhost:3000/mock-auth/login
request body:
{
    "username": "filip_the_king"
}
```
This will create a new user if necessary.

To log out:
```
GET localhost:3000/mock-auth/logout
```

(Why? So you can make tests with different users without having to ask your buddy's 42 intra password, and use Postman for your tests)  

## API documentation (by Swagger)  
    localhost:3000/api
