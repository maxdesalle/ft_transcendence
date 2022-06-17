// websocket library
const Websocket = require('ws');
const {
    computeValues, // function that will do the game logic
    deleteGameSession // to call when a game session is over (does hidden stuff for computeValues)
} = require('./computeValues.js');
// object that containes the default values to send to client
const defaultVals = require('./defaultVals').df;

// type of object that represents a game session
interface gameSocketsInterface {
    id: number, // game session id
    p1Socket: typeof Websocket | undefined,
    p2Socket: typeof Websocket | undefined,
    p1Ob: object, // will contain info that p1 sent
    p2Ob: object, // will contain info that p2 sent
};
// array that conatins all viewers sockets (id is game session id that the viewer is watching)
const viewerSockets: {id: number, ws: typeof Websocket}[] = [];
// object that will be returned by linkPlayers (contains final score)
interface playerScoresInterface {
    p1Score: number,
    p2Score: number
};
const sockets: gameSocketsInterface[] = []; // array that will contain session objects
const socketServerPort: number = 4242; // players will connect to that port
const viewerServerPort: number = 4241; // viewers will connect to that port
const wss = new Websocket.Server({ port: socketServerPort });
const wssViewer = new Websocket.Server({ port: viewerServerPort });

//express server (so that players/ viewers can fetch the .html / .js files and the game sounds)
const httpServerPort: number = 4269;
const express = require('express')
const app = express();
const cors = require('cors');
app.use(cors()); // to fix that annoying CORS error (it's an error displayed in the browser's console)
app.use(express.static('../public')); // /ok will route to ../public/ok
app.listen(httpServerPort, () => console.log(`Express http server listening on port ${httpServerPort}`));
//end of express

// viewer websocket server config ws is socket of viewer
wssViewer.on('connection', (ws: typeof Websocket) => {
    console.log('new viewer connected to server')
    viewerSockets.push({id: -1, ws: ws});
    ws.send(JSON.stringify(defaultVals)); //sending viewer the default values
    ws.on('error', (e) => console.error(`viewer socket error: ${e.message}`));
    ws.on('close', () => {
        const i: number = viewerSockets.findIndex((s: {id: number, ws: any}) => s.ws === ws);
        console.log(`viewer socket leaving game session ${viewerSockets[i].id}`);
        viewerSockets.splice(i, 1);
    });
    ws.on('message', (data: any) => {
        const ob: any = JSON.parse(String(data));
        const i: number = viewerSockets.findIndex((s: {id: number, ws: any}) => s.ws === ws);
        // if viewer wants to get the ongoing sessions
        if (ob.requestSessions === true)
        {
            const sessionIdsArray: number[] = [];
            sockets.forEach((s: gameSocketsInterface) => {
                if (!sessionIdsArray.includes(s.id))
                    sessionIdsArray.push(s.id);
            });
            ws.send(JSON.stringify({sessionIdsArray: sessionIdsArray}));
        }
        // if the viewer wants to change session (id is guaranteed to be valid)
        if (ob.id !== undefined)
        {
            console.log(`setting id ${ob.id} to viewer socket`);
            viewerSockets[i].id = ob.id;
        }
    });
});

// wss is websocket server. ws is websocket
wss.on('connection', (ws: typeof Websocket) => {
    console.log('connection received');
    if (sockets.length === 0 || sockets[sockets.length - 1].p2Socket !== undefined) {
        // create new session
        const id: number = (sockets.reduce(
            (prev, cur) => prev.id < cur.id ? cur : prev, {id: 0}
        )).id + 1;
        sockets.push({id: id, p1Socket: ws, p2Socket: undefined, p1Ob: {}, p2Ob: {}});
        console.log(`p1Socket set to id ${id}`);
    }
    else {
        // join waiting session
        sockets[sockets.length - 1].p2Socket = ws;
        console.log(`p2Socket set to id ${sockets[sockets.length - 1].id}`);
        const id = sockets[sockets.length - 1].id;
        // starting game
        linkPlayers(id).then((playerScores: playerScoresInterface) =>
            console.log(`Session ${id} ended with scores: p1 ${playerScores.p1Score}, p2 ${playerScores.p2Score}`));
    }
    ws.on('error', (e) => console.error(`socket error: ${e.message}`));
    ws.on('close', () => {
        const i = sockets.findIndex((s) => (s.p1Socket === ws || s.p2Socket === ws));
        if (sockets[i].p1Socket === ws) {
            sockets[i].p1Socket = undefined;
            console.log(`p1 of session ${sockets[i].id} left`);
            if (sockets[i].p2Socket) {
                console.log(`closing connection with p2 of session ${sockets[i].id}...`);
                sockets[i].p2Socket.close();
            }
            else
                sockets.splice(i, 1); // deleting game session from array
        }
        else {
            sockets[i].p2Socket = undefined;
            console.log(`p2 of session ${sockets[i].id} left`);
            if (sockets[i].p1Socket) {
                console.log(`closing connection with p1 of session ${sockets[i].id}...`);
                sockets[i].p1Socket.close();
            }
            else
                sockets.splice(i, 1); // deleting game session from array
        }
    });
});

//function to execute right after second player has been connected
async function linkPlayers(id: number)
{
    const gameSockets: gameSocketsInterface = sockets.find((s) => id === s.id);
    console.log(`linking players for session ${id}`);
    gameSockets.p1Socket.on('message', (data: any) => gameSockets.p1Ob = JSON.parse(String(data)));
    gameSockets.p2Socket.on('message', (data: any) => gameSockets.p2Ob = JSON.parse(String(data)));
    //players will automatically start after receiving their number
    gameSockets.p1Socket.send(JSON.stringify({...defaultVals, playerNumber: 1})); //sending players their number
    gameSockets.p2Socket.send(JSON.stringify({...defaultVals, playerNumber: 2})); //and default values
    return await startGame(id);
}

//game loop
async function startGame(id: number) {
    console.log(`creating new game session ${id}`); // compute values will create the game session for the id the first time it's called
    const playerScores: playerScoresInterface = {p1Score: 0, p2Score:0};
    const gameSockets: gameSocketsInterface = sockets.find((s) => id === s.id);
    const minUpdateTime = 20; //ms (higher -> laggier, lower -> heavier for the bandwidth)
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms)); //function used to sleep
    let deltaTime = 0.1; //dummy value for the very first frame
    let ob: any = {};
    while (1) {
        const beginTime = performance.now();
        //getting object to send to players/viewers
        ob = computeValues(gameSockets.p1Ob, gameSockets.p2Ob, deltaTime, gameSockets.id);
        //updating startGame's return value
        if (ob.p1Score !== undefined) playerScores.p1Score = ob.p1Score;
        if (ob.p2Score !== undefined) playerScores.p2Score = ob.p2Score;
        //sending data
        if (gameSockets.p1Socket) gameSockets.p1Socket.send(JSON.stringify(ob)); else break;
        if (gameSockets.p2Socket) gameSockets.p2Socket.send(JSON.stringify(ob)); else break;
        viewerSockets.forEach((s) => {
            if (s.id === gameSockets.id) s.ws.send(JSON.stringify(ob))
        });
        if (ob.playerWon !== undefined && ob.playerWon !== 0) break; // 1 if p1 won, 2 if p2 won, 0 if no one won yet
        //trying to avoid DDOSing my clients by waiting a little bit (if the loop is too fast)
        const execTime = performance.now() - beginTime;
        await delay(minUpdateTime > execTime ? minUpdateTime - execTime : 0);
        deltaTime = (performance.now() - beginTime) / 1000.;
    }
    console.log(`deleting session ${id}`);
    deleteGameSession(gameSockets.id);
    viewerSockets.forEach((s) => {
        if (s.id === gameSockets.id) {
            s.id = -1;
            s.ws.send(JSON.stringify({
                ...ob, // viewers need the final game state
                gameFinished: true // to notify the viwers that the game has ended/was interrupted
            }));
        };
    });
    return playerScores; // contains the final score of the game
}
