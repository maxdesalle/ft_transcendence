import { p5 } from '../game/newPong';

import { Slider } from './slider';

import { urls } from '../api/utils';
import { useSockets } from '../Providers/SocketProvider';
import { createEffect } from 'solid-js';

// const socketServerIP = 'localhost';
// const socketServerPort = 3000;
const socketServerPath = 'pong';
let isDisconnected = false;
let socketErrObject: any = undefined; // if not undefined, socket returned an error
let ws: any; // webSocket
let playerNumber = 0; // 0 if not set yet, otherwise 1 or 2
let heightOffset: number = 46; // top bar height
let canvasWidth: number = Math.min(
  window.innerHeight - heightOffset,
  window.innerWidth,
);
let canvasHeight: number = canvasWidth;
let widthOffset: number = (window.innerWidth - canvasWidth) / 2;
let sessionId = -1; // current game session id (will be sent by server)
let okButton: any = undefined;

//game variables (the server will send the correct values to df before the game starts)
let df: any = {
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

//function executed when okButton is pressed (resests everything)
function handleOkButtonPressed(): void {
  isDisconnected = false;
  socketErrObject = undefined;
  playerNumber = 0;
  sessionId = -1;

  df = {
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

  powerUpsMap = new Map();
  colorIndex = 0;
  sendTimeStamp = 0;
  playImpact = false;
  playScore = false;
  isReady = false;
  isOtherPlayerReady = false;
}

export function initSocket(): WebSocket {
  const serverAddress = `${urls.wsUrl}/${socketServerPath}`;
  ws = new WebSocket(serverAddress);

  ws.addEventListener('open', (e: any) => {
    handleOkButtonPressed();
  });

  ws.addEventListener('close', (e: any) => {
    handleOkButtonPressed();
  });
  ws.addEventListener('error', (e: any) => {
    socketErrObject = e;
    console.error(`socket error:${e}`);
  });
  // set all the game variables
  ws.addEventListener('message', (e: any) => {
    const dataOB = JSON.parse(String(e.data));
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
    if (dataOB.playerNumber !== undefined) return;
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

type P5Type = typeof p5;

export const sketch = (
  myP5: typeof p5,
  navigate?: (path: string) => void,
): P5Type => {
  const [sockets] = useSockets();

  if (sockets.pongWs && sockets.pongWs.readyState === WebSocket.OPEN) {
    sockets.pongWs.addEventListener('close', () => {
      if (navigate) navigate('/');
    });
  }

  let sliders = [
    new Slider(
      myP5,
      'color',
      4 * (canvasWidth / 7),
      (canvasHeight / 5) * 3,
      canvasWidth / 7,
      canvasHeight / 10,
      0,
      6,
      colorIndex,
      1,
      false,
    ),
    new Slider(
      myP5,
      'power ups',
      3 * (canvasWidth / 7),
      (canvasHeight / 5) * 1,
      canvasWidth / 7,
      canvasHeight / 10,
      0,
      1,
      0,
      1,
      true,
    ),
  ];

  //function executed when okButton is pressed (resests everything)
  function handleOkButtonPressed(): void {
    isDisconnected = false;
    socketErrObject = undefined;
    playerNumber = 0;
    sessionId = -1;

    df = {
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

    powerUpsMap = new Map();
    colorIndex = 0;
    sendTimeStamp = 0;
    playImpact = false;
    playScore = false;
    isReady = false;
    isOtherPlayerReady = false;

    // Sliders are removed, so let's init them again!
    initSliders();

    okButton.hide();
    if (navigate) navigate('/');
  }

  // Wrapper function called when okButton needs to be displayed
  function displayOkButton(): void {
    okButton.show();
  }

  //returns true if one player won and displays the according menu
  //else returns false
  function handlePlayerWon() {
    if (df.playerWon == 0) return false;
    myP5.textAlign('center', 'center');

    myP5.fill(
      colors[colorIndex].r,
      colors[colorIndex].g,
      colors[colorIndex].b,
      255,
    );

    myP5.text(`Player ${df.playerWon} won!`, canvasWidth / 2, canvasHeight / 2);
    displayOkButton();
    return true;
  }

  //if server not sent playerNumber or closed connection
  //  -> display the corresponding message and return true
  //else return false
  function handleClientNotConnected() {
    myP5.textStyle('bold');
    myP5.textSize(canvasHeight * 0.03);

    if (socketErrObject) {
      sliders.forEach((s) => s.p5Slider.remove());
      myP5.textAlign('center', 'center');
      myP5.fill(
        colors[colorIndex].r,
        colors[colorIndex].g,
        colors[colorIndex].b,
        255,
      );
      myP5.text(
        `Socket error: ${socketErrObject}`,
        canvasWidth / 4,
        canvasHeight / 4,
      );
      displayOkButton();
      return true;
    }

    if (isDisconnected) {
      sliders.forEach((s) => s.p5Slider.remove());
      myP5.textAlign('center', 'center');
      myP5.fill(
        colors[colorIndex].r,
        colors[colorIndex].g,
        colors[colorIndex].b,
        255,
      );
      myP5.text(
        'The other player has been disconnected.',
        canvasWidth / 2,
        canvasHeight / 2,
      );
      displayOkButton();
      return true;
    }
    if (sessionId === -1) {
      myP5.textAlign('center', 'center');
      myP5.fill(
        colors[colorIndex].r,
        colors[colorIndex].g,
        colors[colorIndex].b,
        255,
      );
      myP5.text(
        'Waiting for the other player...',
        canvasWidth / 2,
        canvasHeight / 2,
      );
      // const el = document.querySelectorAll('slider');
      const el = document.getElementById('slider_0');
      const el1 = document.getElementById('slider_1');
      if (el) {
        el.style.display = 'none';
      }
      if (el1) el1.style.display = 'none';
    } else if (sessionId === -1) {
      myP5.textAlign('center', 'center');
      myP5.fill(
        colors[colorIndex].r,
        colors[colorIndex].g,
        colors[colorIndex].b,
        255,
      );
      myP5.text(
        'Press play to start a game.',
        canvasWidth / 2,
        canvasHeight / 2,
      );
    }
    if (playerNumber === 0) {
      return true;
    }
    return false;
  }

  /* === draw functions === */
  function drawMiddleLine() {
    myP5.fill(
      colors[colorIndex].r,
      colors[colorIndex].g,
      colors[colorIndex].b,
      255,
    );
    const x = (0.5 - df.middleLineThickness / 2) * canvasWidth;
    for (let i = 0; i < 1; i += df.middleLineLength * 2) {
      const y = (i - df.middleLineLength / 2) * canvasHeight;
      myP5.rect(
        x,
        y,
        df.middleLineThickness * canvasWidth,
        df.middleLineLength * canvasHeight,
      );
    }
  }

  function drawPlayer1() {
    //left racket
    myP5.fill(
      colors[colorIndex].r,
      colors[colorIndex].g,
      colors[colorIndex].b,
      255,
    );
    let elTime = (Date.now() - df.sendTime) / 1000;
    if (playerNumber === 1)
      elTime = (Date.now() - Math.max(df.sendTime, sendTimeStamp)) / 1000;
    const xPos = df.p1X - df.racketThickness / 2;
    let yPos =
      df.p1Y - df.racketLength / 2 + elTime * df.racketSpeed * df.p1Press;
    if (yPos < 0) yPos = 0;
    if (yPos + df.racketLength > 1) yPos = 1 - df.racketLength;
    myP5.rect(
      xPos * canvasWidth,
      yPos * canvasHeight,
      df.racketThickness * canvasWidth,
      df.racketLength * canvasHeight,
    );
  }

  function drawPlayer2() {
    //right racket
    myP5.fill(
      colors[colorIndex].r,
      colors[colorIndex].g,
      colors[colorIndex].b,
      255,
    );
    let elTime = (Date.now() - df.sendTime) / 1000;
    if (playerNumber === 2)
      elTime = (Date.now() - Math.max(df.sendTime, sendTimeStamp)) / 1000;
    const xPos = df.p2X - df.racketThickness / 2;
    let yPos =
      df.p2Y - df.racketLength / 2 + elTime * df.racketSpeed * df.p2Press;
    if (yPos < 0) yPos = 0;
    if (yPos + df.racketLength > 1) yPos = 1 - df.racketLength;
    myP5.rect(
      xPos * canvasWidth,
      yPos * canvasHeight,
      df.racketThickness * canvasWidth,
      df.racketLength * canvasHeight,
    );
  }

  function drawBall() {
    myP5.fill(
      colors[colorIndex].r,
      colors[colorIndex].g,
      colors[colorIndex].b,
      255,
    );
    const elTime = (Date.now() - df.sendTime) / 1000;
    const xPos = (df.ballX - df.ballRad + elTime * df.ballSpeedX) * canvasWidth;
    const yPos =
      (df.ballY - df.ballRad + elTime * df.ballSpeedY) * canvasHeight;
    myP5.rect(
      xPos,
      yPos,
      df.ballRad * 2 * canvasWidth,
      df.ballRad * 2 * canvasHeight,
    );
  }

  function drawScore() {
    myP5.fill(
      colors[colorIndex].r,
      colors[colorIndex].g,
      colors[colorIndex].b,
      255,
    );
    myP5.textStyle('bold');
    myP5.textSize(canvasHeight * 0.1);
    myP5.textAlign('center', 'top');
    myP5.text(
      `${df.p1Score}   ${df.p2Score}`,
      canvasWidth / 2,
      canvasHeight * 0.1,
    );
  }

  function drawPowerUps() {
    powerUpsMap.forEach((yAndType, x) => {
      switch (yAndType.type) {
        case 'wall':
          myP5.fill(255, 255, 255, 255);
          break;
        case 'upSpeed':
          myP5.fill(255, 0, 0, 255);
          break;
        case 'downSpeed':
          myP5.fill(0, 255, 0, 255);
          break;
      }
      myP5.rect(
        x * canvasWidth,
        yAndType.y * canvasHeight,
        df.powerUpsSize * canvasWidth,
        df.powerUpsSize * canvasHeight,
      );
    });
  }

  // little text at the top-left corner
  function drawSessionId() {
    myP5.textAlign('left', 'top');
    myP5.fill(255, 255, 255, 100);
    myP5.textSize(canvasWidth / 45);
    myP5.text(`session id: ${sessionId}`, 0, 0);
  }
  /* === */

  /* === handleInput === */
  function handleInput() {
    const pPressTmp = playerNumber == 1 ? df.p1Press : df.p2Press;
    if (playerNumber == 1) {
      if (myP5.keyIsPressed) {
        if (myP5.keyIsDown(myP5.UP_ARROW)) df.p1Press = -1;
        else if (myP5.keyIsDown(myP5.DOWN_ARROW)) df.p1Press = 1;
        else df.p1Press = 0;
      } else df.p1Press = 0;
    } else {
      if (myP5.keyIsPressed) {
        if (myP5.keyIsDown(myP5.UP_ARROW)) df.p2Press = -1;
        else if (myP5.keyIsDown(myP5.DOWN_ARROW)) df.p2Press = 1;
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
        }),
      );
    } else if (playerNumber == 2 && pPressTmp !== df.p2Press) {
      sendTimeStamp = Date.now();
      ws.send(
        JSON.stringify({
          p2Press: df.p2Press,
          sendTime: sendTimeStamp,
          p2Y: df.p2Y,
        }),
      );
    }
  }

  function initSliders() {
    sliders.forEach((s, index) => {
      s.setP5Slider(
        myP5.createSlider(s.s1, s.s2, s.s3, s.s4),
        widthOffset,
        heightOffset,
      );
      s.p5Slider.sliderElement.setAttribute('id', `slider_${index}`);
    });
  }

  function handleSettings() {
    if (isReady && isOtherPlayerReady) {
      //don't display settings menu
      if (sliders) sliders.forEach((s) => s.p5Slider.remove());
      return false;
    }
    if (isReady) {
      const c = colors[colorIndex];
      myP5.fill(c.r, c.g, c.b, 255);
      myP5.textAlign('center', 'center');
      myP5.text(
        `waiting for player ${-playerNumber + 3}`,
        canvasWidth / 2,
        canvasHeight / 2,
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
        case 'color':
          colorIndex = s.p5Slider.value();
          break;
      }
    });
    myP5.textStyle('italic');
    myP5.fill(100, 100, 100, 255);
    myP5.textSize(canvasHeight / 25);
    myP5.textAlign('center', 'top');
    myP5.text('local settings', canvasWidth / 2, canvasHeight / 2);
    if (playerNumber == 1)
      myP5.text('global settings', canvasWidth / 2, canvasHeight * 0.01);
    else
      myP5.text(
        'player 1 chooses\nthe global settings',
        canvasWidth / 2,
        canvasHeight * 0.2,
      );
    sliders.forEach((s) => s.p5Slider.show());
    sliders.forEach((s) => {
      switch (s.text) {
        case 'color':
          s.drawCell(
            colors[colorIndex].r,
            colors[colorIndex].g,
            colors[colorIndex].b,
          );
          break;
        default:
          s.drawCell();
      }
    });

    myP5.fill(50, 240, 42, 255);
    myP5.textStyle('normal');
    myP5.textSize(canvasHeight / 20);
    myP5.textAlign('center', 'bottom');
    myP5.text('press enter to continue', canvasWidth / 2, canvasHeight * 0.9);
    if (myP5.keyIsPressed && myP5.keyIsDown(myP5.ENTER)) {
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
          }),
        );
    }
    return true;
  }

  // function that adapts the screen to its current size
  function handleWindowResize() {
    const newCanvasWidth = Math.min(
      window.innerHeight - heightOffset,
      window.innerWidth,
    );
    const newCanvasHeight = newCanvasWidth;
    const newWidthOffset = (window.innerWidth - newCanvasWidth) / 2;
    const newHeightOffset = heightOffset;
    sliders.forEach((s) => {
      s.x = (s.x / canvasWidth) * newCanvasWidth;
      s.y = (s.y / canvasHeight) * newCanvasHeight;
      s.width = (s.width / canvasWidth) * newCanvasWidth;
      s.height = (s.height / canvasHeight) * newCanvasHeight;
      s.p5Slider.position(
        s.x + newWidthOffset + (s.width * 0.1) / 2,
        s.y + newHeightOffset + s.height / 2,
      );
      s.p5Slider.size(s.width * 0.9, s.height / 2);
    });

    // setting new pos/size to okButton
    okButton.position(
      newWidthOffset + newCanvasWidth / 2,
      newHeightOffset + newCanvasHeight / 1.5,
    );
    okButton.size(newCanvasWidth / 10, newCanvasHeight / 25);

    myP5.resizeCanvas(newCanvasWidth, newCanvasHeight);
    myP5.background(0);
    canvasWidth = newCanvasWidth;
    canvasHeight = newCanvasHeight;
    widthOffset = newWidthOffset;
    heightOffset = newHeightOffset;
  }

  myP5.setup = (ref) => {
    // const btn = document.getElementById('back-btn');
    createEffect(() => {
      if (ref) {
        ref.addEventListener('click', () => {
          handleOkButtonPressed();
        });
      }
    });
    myP5.createCanvas(canvasWidth, canvasHeight);
    myP5.noStroke();
    initSliders();
    okButton = myP5.createButton('Ok');
    okButton.position(
      widthOffset + canvasWidth / 2,
      heightOffset + canvasHeight / 1.5,
    );
    okButton.size(canvasWidth / 10, canvasHeight / 25);
    okButton.mousePressed(handleOkButtonPressed);
    okButton.style('color', 'white');
    okButton.style('background-color', '#555555');
    okButton.hide();
  };

  myP5.draw = () => {
    okButton.hide();
    myP5.background(0);
    handleWindowResize();
    if (handleClientNotConnected()) return; //check if we are connected to server
    drawSessionId();
    if (handleSettings()) return;
    if (handlePlayerWon()) return;
    drawMiddleLine();
    drawPlayer1();
    drawPlayer2();
    drawPowerUps();
    drawBall();
    drawScore();
    handleInput();
  };
  return p5;
};
