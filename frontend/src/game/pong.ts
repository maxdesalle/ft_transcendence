import p5Type from "p5";
import { Slider } from "./slider";
import "../utils/p5soundfix";
import soundScore from "../assets/client_music_score.mp3";
import soundImpact from "../assets/client_music_impact.mp3";
import "p5/lib/addons/p5.sound";

const socketServerIP = "localhost";
const socketServerPort = 3000;
const httpServerIP = "localhost";
const httpServerPort = 3000;
const socketServerPath = "pong";
let isDisconnected = false;
let socketErrObject: any = undefined; // if not undefined, socket returned an error
let ws: any; // webSocket
let playerNumber = 0; // 0 if not set yet, otherwise 1 or 2
let heightOffset: number = 88; // bar and play button heaight
let canvasWidth: number = Math.min(window.innerHeight - heightOffset, window.innerWidth);
let canvasHeight: number = canvasWidth;
let widthOffset: number = (window.innerWidth - canvasWidth) / 2;
let sessionId = -1; // current game session id (will be sent by server)

//game variables (the server will send the correct values to df before the game starts)
const df: any = {
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
let powerUpsMap = new Map(); //cannot include it in df cuz it's a map...
//colors
const colors = [
  { r: 255, g: 255, b: 255 },
  { r: 255, g: 0, b: 0 },
  { r: 0, g: 255, b: 0 },
  { r: 0, g: 0, b: 255 },
  { r: 0, g: 255, b: 255 },
  { r: 255, g: 105, b: 180 },
  { r: 199, g: 21, b: 133 },
];
let colorIndex = 0; // default fill color is white
//interpolation vars
let sendTimeStamp = 0; //ms
//sound vars
let playImpact = false;
let playScore = false;
let impactSound: any = undefined;
let scoreSound: any = undefined;

//flags
let isReady = false; //this player is done with settings
let isOtherPlayerReady = false; //other player is done with settings
export function initSocket(): WebSocket {
  const serverAddress = `ws://${socketServerIP}:${socketServerPort}/${socketServerPath}`;
  ws = new WebSocket(serverAddress);

  ws.addEventListener("open", (e: any) => {
    console.log(`connected to ${serverAddress}`);
    console.log(e);
  });
  ws.addEventListener("close", (e: any) => {
    isDisconnected = true;
    playerNumber = 0;
    console.log("connection closed", e);
  });
  ws.addEventListener("error", (e: any) => {
    socketErrObject = e;
    console.error(`socket error:${e}`);
  });
  // set all the game variables
  ws.addEventListener("message", ({ data }: { data: any }) => {
    const dataOB = JSON.parse(String(data));
    sessionId = dataOB.id ?? sessionId;
    if (playerNumber === 1)
      isOtherPlayerReady = dataOB.p2Ready ?? isOtherPlayerReady;
    else if (playerNumber === 2)
      isOtherPlayerReady = dataOB.p1Ready ?? isOtherPlayerReady;
    playerNumber = dataOB.playerNumber ?? playerNumber;
    const scoreTmp = [df.p1Score, df.p2Score];
    const ballSpeedTmp = [df.ballSpeedX, df.ballSpeedY];
    if (dataOB.powerUpsMap)
      powerUpsMap = new Map(Object.entries(dataOB.powerUpsMap));
    for (const key in df) {
      if (key == `p${playerNumber}Press`) continue;
      df[key] = dataOB[key] ?? df[key];
    }
    // to avoid playing sounds when default vals are sent
    if (dataOB.playerNumber !== undefined)
      return;
    if (scoreTmp[0] !== df.p1Score || scoreTmp[1] !== df.p2Score)
      playScore = true;
    if (
      (df.ballSpeedX !== 0 || df.ballSpeedY !== 0) &&
        (ballSpeedTmp[0] !== df.ballSpeedX || ballSpeedTmp[1] !== df.ballSpeedY)
    )
      playImpact = true;
  });
  return ws;
}

export const sketch = (p5: p5Type) => {
  p5.disableFriendlyErrors = true;
  let sliders = [
    new Slider(
      p5,
      "volume",
      2 * (canvasWidth / 7),
      (canvasHeight / 5) * 3,
      canvasWidth / 7,
      canvasHeight / 10,
      0,
      1,
      1,
      0,
      false
    ),
    new Slider(
      p5,
      "color",
      4 * (canvasWidth / 7),
      (canvasHeight / 5) * 3,
      canvasWidth / 7,
      canvasHeight / 10,
      0,
      6,
      colorIndex,
      1,
      false
    ),
    new Slider(
      p5,
      "power ups",
      3 * (canvasWidth / 7),
      (canvasHeight / 5) * 1,
      canvasWidth / 7,
      canvasHeight / 10,
      0,
      1,
      0,
      1,
      true
    ),
  ];

  //returns true if one player won and displays the according menu
  //else returns false
  function handlePlayerWon() {
    if (df.playerWon == 0) return false;
    p5.textAlign(p5.CENTER, p5.CENTER);
    const col = p5.color(
      colors[colorIndex].r,
      colors[colorIndex].g,
      colors[colorIndex].b
    );
    p5.fill(col);
    p5.text(`Player ${df.playerWon} won!`, canvasWidth / 2, canvasHeight / 2);
    return true;
  }

  //if server not sent playerNumber or closed connection
  //  -> display the corresponding message and return true
  //else return false
  function handleClientNotConnected() {
    p5.textStyle(p5.BOLD);
    p5.textSize(canvasHeight * 0.03);
    const col = p5.color(
      colors[colorIndex].r,
      colors[colorIndex].g,
      colors[colorIndex].b
    );
    if (socketErrObject) {
      sliders.forEach((s) => s.p5Slider.remove());
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.fill(col);
      p5.text(
        `socket error: ${socketErrObject}`,
        canvasWidth / 4,
        canvasHeight / 4
      );
      return true;
    }
    if (isDisconnected) {
      sliders.forEach((s) => s.p5Slider.remove());
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.fill(col);
      p5.text(
        "the other player has been disconnected",
        canvasWidth / 2,
        canvasHeight / 2
      );
      return true;
    }
    if (playerNumber === 0) {
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.fill(col);
      p5.text(
        "waiting for the other player...",
        canvasWidth / 2,
        canvasHeight / 2
      );
      return true;
    }
    return false;
  }

  /* === draw functions === */
  function drawMiddleLine() {
    const col = p5.color(
      colors[colorIndex].r,
      colors[colorIndex].g,
      colors[colorIndex].b
    );
    p5.fill(col);
    const x = (0.5 - df.middleLineThickness / 2) * canvasWidth;
    for (let i = 0; i < 1; i += df.middleLineLength * 2) {
      const y = (i - df.middleLineLength / 2) * canvasHeight;
      p5.rect(
        x,
        y,
        df.middleLineThickness * canvasWidth,
        df.middleLineLength * canvasHeight
      );
    }
  }

  function drawPlayer1() {
    //left racket
    const col = p5.color(
      colors[colorIndex].r,
      colors[colorIndex].g,
      colors[colorIndex].b
    );
    p5.fill(col);
    let elTime = (Date.now() - df.sendTime) / 1000;
    if (playerNumber === 1)
      elTime = (Date.now() - Math.max(df.sendTime, sendTimeStamp)) / 1000;
    const xPos = df.p1X - df.racketThickness / 2;
    let yPos =
      df.p1Y - df.racketLength / 2 + elTime * df.racketSpeed * df.p1Press;
    if (yPos < 0) yPos = 0;
    if (yPos + df.racketLength > 1) yPos = 1 - df.racketLength;
    p5.rect(
      xPos * canvasWidth,
      yPos * canvasHeight,
      df.racketThickness * canvasWidth,
      df.racketLength * canvasHeight
    );
  }

  function drawPlayer2() {
    //right racket
    const col = p5.color(
      colors[colorIndex].r,
      colors[colorIndex].g,
      colors[colorIndex].b
    );
    p5.fill(col);
    let elTime = (Date.now() - df.sendTime) / 1000;
    if (playerNumber === 2)
      elTime = (Date.now() - Math.max(df.sendTime, sendTimeStamp)) / 1000;
    const xPos = df.p2X - df.racketThickness / 2;
    let yPos =
      df.p2Y - df.racketLength / 2 + elTime * df.racketSpeed * df.p2Press;
    if (yPos < 0) yPos = 0;
    if (yPos + df.racketLength > 1) yPos = 1 - df.racketLength;
    p5.rect(
      xPos * canvasWidth,
      yPos * canvasHeight,
      df.racketThickness * canvasWidth,
      df.racketLength * canvasHeight
    );
  }

  function drawBall() {
    const col = p5.color(
      colors[colorIndex].r,
      colors[colorIndex].g,
      colors[colorIndex].b
    );
    p5.fill(col);
    const elTime = (Date.now() - df.sendTime) / 1000;
    const xPos = (df.ballX - df.ballRad + elTime * df.ballSpeedX) * canvasWidth;
    const yPos =
      (df.ballY - df.ballRad + elTime * df.ballSpeedY) * canvasHeight;
    p5.rect(
      xPos,
      yPos,
      df.ballRad * 2 * canvasWidth,
      df.ballRad * 2 * canvasHeight
    );
  }

  function drawScore() {
    const col = p5.color(
      colors[colorIndex].r,
      colors[colorIndex].g,
      colors[colorIndex].b
    );
    p5.fill(col);
    p5.textStyle(p5.BOLD);
    p5.textSize(canvasHeight * 0.1);
    p5.textAlign(p5.CENTER, p5.TOP);
    p5.text(
      `${df.p1Score}   ${df.p2Score}`,
      canvasWidth / 2,
      canvasHeight * 0.1
    );
  }

  function drawPowerUps() {
    powerUpsMap.forEach((yAndType, x) => {
      switch (yAndType.type) {
        case "wall":
          p5.fill(255);
          break;
        case "upSpeed":
          p5.fill(255, 0, 0);
          break;
        case "downSpeed":
          p5.fill(0, 255, 0);
          break;
      }
      p5.rect(
        x * canvasWidth,
        yAndType.y * canvasHeight,
        df.powerUpsSize * canvasWidth,
        df.powerUpsSize * canvasHeight
      );
    });
  }

  // little text at the top-left corner
  function drawSessionId() {
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.fill(255, 255, 255, 100);
    p5.textSize(canvasWidth / 45);
    p5.text(`session id: ${sessionId}`, 0, 0);
  }
  /* === */

  /* === handleInput === */
  function handleInput() {
    const pPressTmp = playerNumber == 1 ? df.p1Press : df.p2Press;
    if (playerNumber == 1) {
      if (p5.keyIsPressed) {
        if (p5.keyIsDown(p5.UP_ARROW)) df.p1Press = -1;
        else if (p5.keyIsDown(p5.DOWN_ARROW)) df.p1Press = 1;
        else df.p1Press = 0;
      } else df.p1Press = 0;
    } else {
      if (p5.keyIsPressed) {
        if (p5.keyIsDown(p5.UP_ARROW)) df.p2Press = -1;
        else if (p5.keyIsDown(p5.DOWN_ARROW)) df.p2Press = 1;
        else df.p2Press = 0;
      } else df.p2Press = 0;
    }
    if (playerNumber == 1 && pPressTmp !== df.p1Press) {
      sendTimeStamp = Date.now();
      ws.send(
        JSON.stringify({
          p1Press: df.p1Press,
          sendTime: sendTimeStamp,
          p1Y: df.p1Y,
        })
      );
    } else if (playerNumber == 2 && pPressTmp !== df.p2Press) {
      sendTimeStamp = Date.now();
      ws.send(
        JSON.stringify({
          p2Press: df.p2Press,
          sendTime: sendTimeStamp,
          p2Y: df.p2Y,
        })
      );
    }
  }
  function initSliders() {
    sliders.forEach((s) =>
      s.setP5Slider(
        p5.createSlider(s.s1, s.s2, s.s3, s.s4),
        widthOffset,
        heightOffset
      ));
  }

  function handleSettings() {
    if (isReady && isOtherPlayerReady) {
      //don't display settings menu
      if (sliders) sliders.forEach((s) => s.p5Slider.remove());
      return false;
    }
    if (isReady) {
      const c = colors[colorIndex];
      p5.fill(c.r, c.g, c.b);
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.text(
        `waiting for player ${-playerNumber + 3}`,
        canvasWidth / 2,
        canvasHeight / 2
      );
      return true;
    }
    sliders = sliders.filter((s) => {
      if (!(playerNumber === 2 && s.isGlobal)) return true;
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
    p5.textStyle(p5.ITALIC);
    p5.fill(100);
    p5.textSize(canvasHeight / 25);
    p5.textAlign(p5.CENTER, p5.TOP);
    p5.text("local settings", canvasWidth / 2, canvasHeight / 2);
    if (playerNumber == 1)
      p5.text("global settings", canvasWidth / 2, canvasHeight * 0.01);
    else
      p5.text(
        "player 1 chooses\nthe global settings",
        canvasWidth / 2,
        canvasHeight * 0.2
      );
    sliders.forEach((s) => s.p5Slider.show());
    sliders.forEach((s) => {
      switch (s.text) {
        case "color":
          s.drawCell(
            colors[colorIndex].r,
            colors[colorIndex].g,
            colors[colorIndex].b
          );
          break;
        default:
          s.drawCell();
      }
    });

    p5.fill(50, 240, 42);
    p5.textStyle(p5.NORMAL);
    p5.textSize(canvasHeight / 20);
    p5.textAlign(p5.CENTER, p5.BOTTOM);
    p5.text("press enter to continue", canvasWidth / 2, canvasHeight * 0.9);
    if (p5.keyIsPressed && p5.keyIsDown(p5.ENTER)) {
      isReady = true;
      sliders.forEach((s) => s.p5Slider.remove());
      if (playerNumber === 1) {
        const ob: any = { p1Ready: true };
        sliders.forEach((s) => {
          if (s.isGlobal) ob[s.text] = s.p5Slider.value();
        });
        ws.send(JSON.stringify(ob));
      } else
        ws.send(
          JSON.stringify({
            p2Ready: true,
          })
        );
    }
    return true;
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

  // function that adapts the screen to its current size
  function handleWindowResize() {
    const newCanvasWidth = Math.min(window.innerHeight - heightOffset, window.innerWidth);
    const newCanvasHeight = newCanvasWidth;
    const newWidthOffset = (window.innerWidth - newCanvasWidth) / 2;
    const newHeightOffset = 88;
    sliders.forEach((s) => {
      s.x = (s.x / canvasWidth * newCanvasWidth);
      s.y = (s.y / canvasHeight * newCanvasHeight);
      s.width = (s.width / canvasWidth * newCanvasWidth);
      s.height = (s.height / canvasHeight * newCanvasHeight);
      s.p5Slider.position(
        s.x + newWidthOffset + (s.width * 0.1) / 2,
        s.y + newHeightOffset + s.height / 2
      );
      s.p5Slider.size(s.width * 0.9, s.height / 2);
    })
    p5.resizeCanvas(newCanvasWidth, newCanvasHeight);
    p5.background(0);
    canvasWidth = newCanvasWidth;
    canvasHeight = newCanvasHeight;
    widthOffset = newWidthOffset;
    heightOffset = newHeightOffset;
  }

  p5.preload = () => {
    //loading sound
    impactSound = p5.loadSound(soundImpact);
    scoreSound = p5.loadSound(soundScore);
  };

  p5.setup = () => {
    p5.createCanvas(canvasWidth, canvasHeight);
    p5.noStroke();
    initSliders();
  };

  p5.draw = () => {
    p5.background(0);
    handleWindowResize()
    if (handleClientNotConnected()) return; //check if we are connected to server
    drawSessionId();
    if (handleSettings()) return;
    if (handlePlayerWon()) return;
    playSounds();
    drawMiddleLine();
    drawPlayer1();
    drawPlayer2();
    drawPowerUps();
    drawBall();
    drawScore();
    handleInput();
  };
};
