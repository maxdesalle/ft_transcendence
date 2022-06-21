"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.draw = exports.setup = void 0;
const socketServerIP = "localhost";
const socketServerPort = 4242;
const httpServerIP = "localhost";
const httpServerPort = 4269;
let isDisconnected = false;
let socketErrObject = undefined;
let ws;
let playerNumber = 0;
const canvasWidth = innerWidth > innerHeight ? innerHeight : innerWidth;
const canvasHeight = canvasWidth;
let sessionId = -1;
const df = {
    p1Y: 0,
    p2Y: 0,
    ballX: 0,
    ballY: 0,
    p1Score: 0,
    p2Score: 0,
    playerWon: 0,
    racketLength: 0,
    racketThickness: 0,
    p1X: 0,
    p2X: 0,
    ballRad: 0,
    middleLineThickness: 0,
    middleLineLength: 0,
    ballSpeedX: 0,
    ballSpeedY: 0,
    racketSpeed: 0,
    p1Press: 0,
    p2Press: 0,
    sendTime: 0,
    powerUpsSize: 0,
};
let powerUpsMap = new Map();
const colors = [
    { r: 255, g: 255, b: 255 },
    { r: 255, g: 0, b: 0 },
    { r: 0, g: 255, b: 0 },
    { r: 0, g: 0, b: 255 },
    { r: 0, g: 255, b: 255 },
    { r: 255, g: 105, b: 180 },
    { r: 199, g: 21, b: 133 },
];
let colorIndex = 0;
let sendTimeStamp = 0;
let playImpact = false;
let playScore = false;
let impactSound = undefined;
let scoreSound = undefined;
class Slider {
    constructor(t, x, y, w, h, s1, s2, s3, s4, isGlobal) {
        this.text = t;
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.s1 = s1;
        this.s2 = s2;
        this.s3 = s3;
        this.s4 = s4;
        this.isGlobal = isGlobal;
    }
    setP5Slider(p5Slider) {
        this.p5Slider = p5Slider;
        this.p5Slider.position(this.x + (this.width * 0.1) / 2, this.y + this.height / 2);
        this.p5Slider.size(this.width * 0.9, this.height / 2);
        this.p5Slider.hide();
    }
    drawCell(r, g, b) {
        if (r === undefined && g === undefined && b === undefined)
            r = g = b = 255;
        r = r === undefined ? 0 : r;
        g = g === undefined ? 0 : g;
        b = b === undefined ? 0 : b;
        textStyle(NORMAL);
        noFill();
        stroke(100, 100, 100);
        rect(this.x, this.y, this.width, this.height);
        noStroke();
        textSize((this.width / this.text.length) * 1.3);
        textAlign(CENTER, TOP);
        fill(r, g, b);
        text(this.text, this.x + this.width / 2, this.y + this.height / 8);
    }
}
let sliders = [
    new Slider("volume", 2 * (canvasWidth / 7), (canvasHeight / 5) * 3, canvasWidth / 7, canvasHeight / 10, 0, 1, 1, 0, false),
    new Slider("color", 4 * (canvasWidth / 7), (canvasHeight / 5) * 3, canvasWidth / 7, canvasHeight / 10, 0, 6, colorIndex, 1, false),
    new Slider("power ups", 3 * (canvasWidth / 7), (canvasHeight / 5) * 1, canvasWidth / 7, canvasHeight / 10, 0, 1, 0, 1, true),
];
let isReady = false;
let isOtherPlayerReady = false;
function initSocket() {
    const serverAddress = `ws://${socketServerIP}:${socketServerPort}`;
    ws = new WebSocket(serverAddress);
    ws.addEventListener("open", () => {
        console.log(`connected to ${serverAddress}`);
    });
    ws.addEventListener("close", () => {
        isDisconnected = true;
        playerNumber = 0;
        console.log("connection closed");
    });
    ws.addEventListener("error", (e) => {
        socketErrObject = e;
        console.error(`socket error:${e.message}`);
    });
    ws.addEventListener("message", ({ data }) => {
        var _a, _b, _c, _d, _e;
        const dataOB = JSON.parse(String(data));
        sessionId = (_a = dataOB.id) !== null && _a !== void 0 ? _a : sessionId;
        if (playerNumber === 1)
            isOtherPlayerReady = (_b = dataOB.p2Ready) !== null && _b !== void 0 ? _b : isOtherPlayerReady;
        else if (playerNumber === 2)
            isOtherPlayerReady = (_c = dataOB.p1Ready) !== null && _c !== void 0 ? _c : isOtherPlayerReady;
        playerNumber = (_d = dataOB.playerNumber) !== null && _d !== void 0 ? _d : playerNumber;
        const scoreTmp = [df.p1Score, df.p2Score];
        const ballSpeedTmp = [df.ballSpeedX, df.ballSpeedY];
        if (dataOB.powerUpsMap)
            powerUpsMap = new Map(Object.entries(dataOB.powerUpsMap));
        for (const key in df) {
            if (key == `p${playerNumber}Press`)
                continue;
            df[key] = (_e = dataOB[key]) !== null && _e !== void 0 ? _e : df[key];
        }
        if (dataOB.playerNumber !== undefined)
            return;
        if (scoreTmp[0] !== df.p1Score || scoreTmp[1] !== df.p2Score)
            playScore = true;
        if ((df.ballSpeedX !== 0 || df.ballSpeedY !== 0) &&
            (ballSpeedTmp[0] !== df.ballSpeedX || ballSpeedTmp[1] !== df.ballSpeedY))
            playImpact = true;
    });
}
function handlePlayerWon() {
    if (df.playerWon == 0)
        return false;
    textAlign(CENTER, CENTER);
    const col = color(colors[colorIndex].r, colors[colorIndex].g, colors[colorIndex].b);
    fill(col);
    text(`Player ${df.playerWon} won!`, canvasWidth / 2, canvasHeight / 2);
    return true;
}
function handleClientNotConnected() {
    textStyle(BOLD);
    textSize(canvasHeight * 0.03);
    const col = color(colors[colorIndex].r, colors[colorIndex].g, colors[colorIndex].b);
    if (socketErrObject) {
        sliders.forEach((s) => s.p5Slider.remove());
        textAlign(CENTER, CENTER);
        fill(col);
        text(`socket error: ${socketErrObject}`, canvasWidth / 4, canvasHeight / 4);
        return true;
    }
    if (isDisconnected) {
        sliders.forEach((s) => s.p5Slider.remove());
        textAlign(CENTER, CENTER);
        fill(col);
        text("the other player has been disconnected", canvasWidth / 2, canvasHeight / 2);
        return true;
    }
    if (playerNumber === 0) {
        textAlign(CENTER, CENTER);
        fill(col);
        text("waiting for the other player...", canvasWidth / 2, canvasHeight / 2);
        return true;
    }
    return false;
}
function drawMiddleLine() {
    const col = color(colors[colorIndex].r, colors[colorIndex].g, colors[colorIndex].b);
    fill(col);
    const x = (0.5 - df.middleLineThickness / 2) * canvasWidth;
    for (let i = 0; i < 1; i += df.middleLineLength * 2) {
        const y = (i - df.middleLineLength / 2) * canvasHeight;
        rect(x, y, df.middleLineThickness * canvasWidth, df.middleLineLength * canvasHeight);
    }
}
function drawPlayer1() {
    const col = color(colors[colorIndex].r, colors[colorIndex].g, colors[colorIndex].b);
    fill(col);
    let elTime = (Date.now() - df.sendTime) / 1000;
    if (playerNumber === 1)
        elTime = (Date.now() - Math.max(df.sendTime, sendTimeStamp)) / 1000;
    const xPos = df.p1X - df.racketThickness / 2;
    let yPos = df.p1Y - df.racketLength / 2 + elTime * df.racketSpeed * df.p1Press;
    if (yPos < 0)
        yPos = 0;
    if (yPos + df.racketLength > 1)
        yPos = 1 - df.racketLength;
    rect(xPos * canvasWidth, yPos * canvasHeight, df.racketThickness * canvasWidth, df.racketLength * canvasHeight);
}
function drawPlayer2() {
    const col = color(colors[colorIndex].r, colors[colorIndex].g, colors[colorIndex].b);
    fill(col);
    let elTime = (Date.now() - df.sendTime) / 1000;
    if (playerNumber === 2)
        elTime = (Date.now() - Math.max(df.sendTime, sendTimeStamp)) / 1000;
    const xPos = df.p2X - df.racketThickness / 2;
    let yPos = df.p2Y - df.racketLength / 2 + elTime * df.racketSpeed * df.p2Press;
    if (yPos < 0)
        yPos = 0;
    if (yPos + df.racketLength > 1)
        yPos = 1 - df.racketLength;
    rect(xPos * canvasWidth, yPos * canvasHeight, df.racketThickness * canvasWidth, df.racketLength * canvasHeight);
}
function drawBall() {
    const col = color(colors[colorIndex].r, colors[colorIndex].g, colors[colorIndex].b);
    fill(col);
    const elTime = (Date.now() - df.sendTime) / 1000;
    const xPos = (df.ballX - df.ballRad + elTime * df.ballSpeedX) * canvasWidth;
    const yPos = (df.ballY - df.ballRad + elTime * df.ballSpeedY) * canvasHeight;
    rect(xPos, yPos, df.ballRad * 2 * canvasWidth, df.ballRad * 2 * canvasHeight);
}
function drawScore() {
    const col = color(colors[colorIndex].r, colors[colorIndex].g, colors[colorIndex].b);
    fill(col);
    textStyle(BOLD);
    textSize(canvasHeight * 0.1);
    textAlign(CENTER, TOP);
    text(`${df.p1Score}   ${df.p2Score}`, canvasWidth / 2, canvasHeight * 0.1);
}
function drawPowerUps() {
    powerUpsMap.forEach((yAndType, x) => {
        switch (yAndType.type) {
            case "wall":
                fill(255);
                break;
            case "upSpeed":
                fill(255, 0, 0);
                break;
            case "downSpeed":
                fill(0, 255, 0);
                break;
        }
        rect(x * canvasWidth, yAndType.y * canvasHeight, df.powerUpsSize * canvasWidth, df.powerUpsSize * canvasHeight);
    });
}
function drawSessionId() {
    textAlign(LEFT, TOP);
    fill(255, 255, 255, 100);
    textSize(canvasWidth / 45);
    text(`session id: ${sessionId}`, 0, 0);
}
function handleInput() {
    const pPressTmp = playerNumber == 1 ? df.p1Press : df.p2Press;
    if (playerNumber == 1) {
        if (keyIsPressed) {
            if (keyIsDown(UP_ARROW))
                df.p1Press = -1;
            else if (keyIsDown(DOWN_ARROW))
                df.p1Press = 1;
            else
                df.p1Press = 0;
        }
        else
            df.p1Press = 0;
    }
    else {
        if (keyIsPressed) {
            if (keyIsDown(UP_ARROW))
                df.p2Press = -1;
            else if (keyIsDown(DOWN_ARROW))
                df.p2Press = 1;
            else
                df.p2Press = 0;
        }
        else
            df.p2Press = 0;
    }
    if (playerNumber == 1 && pPressTmp !== df.p1Press) {
        sendTimeStamp = Date.now();
        ws.send(JSON.stringify({
            p1Press: df.p1Press,
            sendTime: sendTimeStamp,
            p1Y: df.p1Y,
        }));
    }
    else if (playerNumber == 2 && pPressTmp !== df.p2Press) {
        sendTimeStamp = Date.now();
        ws.send(JSON.stringify({
            p2Press: df.p2Press,
            sendTime: sendTimeStamp,
            p2Y: df.p2Y,
        }));
    }
}
function playSounds() {
    if (playScore) {
        scoreSound.play();
        playScore = false;
    }
    if (playImpact) {
        impactSound.play();
        playImpact = false;
    }
}
function initSliders() {
    sliders.forEach((s) => s.setP5Slider(createSlider(s.s1, s.s2, s.s3, s.s4)));
}
function handleSettings() {
    if (isReady && isOtherPlayerReady) {
        if (sliders)
            sliders.forEach((s) => s.p5Slider.remove());
        return false;
    }
    if (isReady) {
        const c = colors[colorIndex];
        fill(c.r, c.g, c.b);
        textAlign(CENTER, CENTER);
        text(`waiting for player ${-playerNumber + 3}`, canvasWidth / 2, canvasHeight / 2);
        return true;
    }
    sliders = sliders.filter((s) => {
        if (!(playerNumber === 2 && s.isGlobal))
            return true;
        s.p5Slider.remove();
        return false;
    });
    sliders.forEach((s) => {
        switch (s.text) {
            case "color":
                colorIndex = s.p5Slider.value();
                break;
            case "volume":
                const volumeLevel = s.p5Slider.value();
                impactSound.setVolume(volumeLevel);
                scoreSound.setVolume(volumeLevel);
                break;
        }
    });
    textStyle(ITALIC);
    fill(100);
    textSize(canvasHeight / 25);
    textAlign(CENTER, TOP);
    text("local settings", canvasWidth / 2, canvasHeight / 2);
    if (playerNumber == 1)
        text("global settings", canvasWidth / 2, canvasHeight * 0.01);
    else
        text("player 1 chooses\nthe global settings", canvasWidth / 2, canvasHeight * 0.2);
    sliders.forEach((s) => s.p5Slider.show());
    sliders.forEach((s) => {
        switch (s.text) {
            case "color":
                s.drawCell(colors[colorIndex].r, colors[colorIndex].g, colors[colorIndex].b);
                break;
            default:
                s.drawCell();
        }
    });
    fill(50, 240, 42);
    textStyle(NORMAL);
    textSize(canvasHeight / 20);
    textAlign(CENTER, BOTTOM);
    text("press enter to continue", canvasWidth / 2, canvasHeight * 0.9);
    if (keyIsPressed && keyIsDown(ENTER)) {
        isReady = true;
        sliders.forEach((s) => s.p5Slider.remove());
        if (playerNumber === 1) {
            const ob = { p1Ready: true };
            sliders.forEach((s) => {
                if (s.isGlobal)
                    ob[s.text] = s.p5Slider.value();
            });
            ws.send(JSON.stringify(ob));
        }
        else
            ws.send(JSON.stringify({
                p2Ready: true,
            }));
    }
    return true;
}
function preload() {
    impactSound = loadSound(`http://${httpServerIP}:${httpServerPort}/music/impact.mp3`);
    scoreSound = loadSound(`http://${httpServerIP}:${httpServerPort}/music/score.mp3`);
}
function setup() {
    initSocket();
    createCanvas(canvasWidth, canvasHeight);
    noStroke();
    initSliders();
}
exports.setup = setup;
function draw() {
    background(0);
    if (handleClientNotConnected())
        return;
    drawSessionId();
    if (handleSettings())
        return;
    if (handlePlayerWon())
        return;
    playSounds();
    drawMiddleLine();
    drawPlayer1();
    drawPlayer2();
    drawPowerUps();
    drawBall();
    drawScore();
    handleInput();
}
exports.draw = draw;
//# sourceMappingURL=player.js.map