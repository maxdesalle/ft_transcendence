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

Wanna restart with a fresh DB? `./restart.sh`

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
    "login42": "filip_the_king"
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
You should ignore the routes under the "default" section, as they probably don't work well.

## Play Pong!
For now, no system is in place to invite a specific player to play against. And no auth yet for the pong websocket.

What can be done: `localhost:3000/player.html` will get you a player. Do the same in another tab so you can play... against yourself.

Wanna watch you VS you ? `localhost:3000/viewer.html`

## Chat
What you can do now:
### Users
* You can login:  POST /mock-auth/**login**  
* Then you can login again with a different user so you'll have a buddy to talk to
* You can check the existent users in GET /users
* Or see your own info at GET /users/me

### DM
* you can send your buddy a direct message via POST /chat/dm
* you can check DMs via  
    * GET /chat/dm/{your buddy's id} or
    * GET /chat/room_messages/{room_id} (see below under "Rooms")

### Group
* create a group: POST /chat/create_group
* add your buddy to a group: POST /chat/add_group_user

### Rooms (DM or Group: they are all rooms!)
* verify the rooms you're part of: GET /chat/rooms (this is how you find out the rooms' ids)
* send a message to a room: POST /chat/message_to_room
* see the messages in a room: /chat/room_messages/{room_id}
* get more info about a room: /chat/room_info/{room_id}


## Get real-time notifications via Websocket
Client-side:
```
// Create WebSocket connection (login first, so the JWT is included as cookie)
const socket = new WebSocket('ws://localhost:3000/');

// in case you wanna do something when connection is established
socket.addEventListener('open', function (event) {
    console.log('connected to WS server');
});

// in case you wanna do something when connection is closed
socket.addEventListener('close', function (event) {
    console.log('disconneted from WS server');
});

// now the real deal: event listener for received messages
socket.addEventListener('message', function(event) {
    const payload = event.data;
    console.log('message from ws server: ', payload);

    if (payload.event === 'chat_dm') {
        const new_msg = payload.message;
        // Do something
    }
    
    if (payload.event === 'chat_room_msg') {
        const new_msg = payload.message;
        // Do something
    }

    if (payload.event === 'chat_new_group') {
        const room_id = payload.room_id;
        // You were added to this room (group), do something
    }

    if (payload.event === 'chat_new_user_in_group') {
        const room_id = payload.room_id;
        const new_user = payload.user_id;
        // a new user was added to this room
    }
});
```

## Notifications via Websocket schemas/examples

### Chat
Direct Message
```
{
    "event": "chat_dm",
    "message": {
        "id": 2,
        "message": "yo",
        "timestamp": "2022-06-17T00:21:37.402Z",
        "room_id": 2,
        "user_id": 5,
        "login42": "user_7",
        "display_name": "user_7"
    }
}
```
new group for you (you are now part of this room = you were added, or you created it...)
```
{
    "event": "chat_new_group",
    "room_id": 3
}
```
a user was added to a group that you're part of
```
{
    "event": "chat_new_user_in_group",
    "room_id": 3,
    "user_id": 3
}
```
new group message
```
{
    "event": "chat_room_msg",
    "message": {
        "id": 3,
        "message": "whatup people in tha group??",
        "timestamp": "2022-06-17T00:29:31.649Z",
        "room_id": 3,
        "user_id": 5,
        "login42": "user_7",
        "display_name": "user_7"
    }
}
```

### Friends
Incoming Friendship request
```
 "event": "friends: new_request",
    "friend_request": {
        "requesting_user": {
            "id": 5,
            "login42": "user_7",
            "display_name": "user_7",
            "avatarId": null,
            "isTwoFactorAuthenticationEnabled": false,
            "status": null
        },
        "req_user_id": 5,
        "receiving_user": {
            "id": 3,
            "login42": "user_1",
            "display_name": "user_1",
            "avatarId": null,
            "isTwoFactorAuthenticationEnabled": false,
            "status": null
        },
        "recv_user_id": 3
    }
}
```

Friendship request was accepted
```
{
    "event": "friends: request_accepted",
    "friend_request": {
        "req_user_id": 5,
        "recv_user_id": 3,
        "status": 1
    }
}
```

Friendship request was rejected
```
{
    "event": "friends: request_rejected",
    "friend_request": {
        "req_user_id": 5,
        "recv_user_id": 3,
        "status": 2
    }
}
```

### Status (online/offline)
one of your friends became online
```
{
    "event": "status: friend_online",
    "user_id": 3
}
```
one of your friends became offline

```
{
    "event": "status: friend_offline",
    "user_id": 3
}
```