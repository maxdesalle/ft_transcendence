import { Slider } from './slider';
import { p5 } from './newPong';

const socketServerIP = 'localhost';
const socketServerPort = 3000;
const httpServerIP = 'localhost';
const httpServerPort = 3000;
const socketServerPath = 'pong_viewer';
let socketErrObject: any = undefined;
let ws: any; // webSocket
let heightOffset: number = 46; // bar button height
let canvasWidth: number = Math.min(
  window.innerHeight - heightOffset,
  window.innerWidth,
);
let canvasHeight: number = canvasWidth;
let widthOffset: number = (window.innerWidth - canvasWidth) / 2;
let gameStarted = false;
let gameFinished = false;
let sessionIdsArray: any = []; // list of available game session (top of the screen)

// game variables (the server will send the correct values to df before the game starts)
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
//sound vars
let playImpact = false;
let playScore = false;
let impactSound: any = undefined;
let scoreSound: any = undefined;
//sliders (sound and color)

// all settings sliders

//connects to server
export function initViewerSocket() {
  const serverAddress = `ws://${socketServerIP}:${socketServerPort}/${socketServerPath}`;
  ws = new WebSocket(serverAddress);

  ws.addEventListener('open', () => {
    console.log(`connected to ${serverAddress}`);
  });
  ws.addEventListener('close', () => {
    console.log('connection closed');
  });
  ws.addEventListener('error', (e: any) => {
    socketErrObject = e;
    console.error(`socket error:${e.message}`);
  });
  // set all the game variables
  ws.addEventListener('message', ({ data }: any) => {
    const dataOB = JSON.parse(String(data));
    gameStarted = dataOB.gameStarted ?? gameStarted;
    gameFinished = dataOB.gameFinished ?? gameFinished;
    sessionIdsArray = dataOB.sessionIdsArray ?? sessionIdsArray;
    console.log(sessionIdsArray);
    const scoreTmp = [df.p1Score, df.p2Score];
    const ballSpeedTmp = [df.ballSpeedX, df.ballSpeedY];
    if (dataOB.powerUpsMap)
      powerUpsMap = new Map(Object.entries(dataOB.powerUpsMap));
    for (const key in df) df[key] = dataOB[key] ?? df[key];
    if (dataOB.playerNumber !== undefined)
      // to avoid playing sounds when default vals are sent
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

type MyP5 = typeof p5;

export const viewerSketch = (p5: MyP5) => {
  let sliders = [
    new Slider(
      p5,
      'color',
      5 * (canvasWidth / 7),
      canvasHeight / 20,
      canvasWidth / 7,
      canvasHeight / 10,
      0,
      6,
      colorIndex,
      1,
      false,
    ),
  ];

  //returns true if one player won and displays the according menu
  //else returns false
  function handlePlayerWon() {
    if (df.playerWon == 0) return false;
    p5.textAlign('center', 'center');

    p5.fill(
      colors[colorIndex].r,
      colors[colorIndex].g,
      colors[colorIndex].b,
      255,
    );
    p5.text(`Player ${df.playerWon} won!`, canvasWidth / 2, canvasHeight / 2);
    return true;
  }

  // handles socket errors
  function handleSocketError() {
    p5.textStyle('bold');
    p5.textSize(canvasHeight * 0.03);

    if (socketErrObject) {
      sliders.forEach((s) => s.p5Slider.remove());
      p5.textAlign('center', 'center');
      p5.fill(
        colors[colorIndex].r,
        colors[colorIndex].g,
        colors[colorIndex].b,
        255,
      );
      p5.text(
        `socket error: ${socketErrObject}`,
        canvasWidth / 4,
        canvasHeight / 4,
      );
      return true;
    }
    return false;
  }

  /* === draw functions === */
  function drawMiddleLine() {
    p5.fill(
      colors[colorIndex].r,
      colors[colorIndex].g,
      colors[colorIndex].b,
      255,
    );
    const x = (0.5 - df.middleLineThickness / 2) * canvasWidth;
    for (let i = 0; i < 1; i += df.middleLineLength * 2) {
      const y = (i - df.middleLineLength / 2) * canvasHeight;
      p5.rect(
        x,
        y,
        df.middleLineThickness * canvasWidth,
        df.middleLineLength * canvasHeight,
      );
    }
  }

  function drawPlayer1() {
    //left racket

    p5.fill(
      colors[colorIndex].r,
      colors[colorIndex].g,
      colors[colorIndex].b,
      255,
    );
    let elTime = (Date.now() - df.sendTime) / 1000;
    const xPos = df.p1X - df.racketThickness / 2;
    let yPos =
      df.p1Y - df.racketLength / 2 + elTime * df.racketSpeed * df.p1Press;
    if (yPos < 0) yPos = 0;
    if (yPos + df.racketLength > 1) yPos = 1 - df.racketLength;
    p5.rect(
      xPos * canvasWidth,
      yPos * canvasHeight,
      df.racketThickness * canvasWidth,
      df.racketLength * canvasHeight,
    );
  }

  function drawPlayer2() {
    //right racket

    p5.fill(
      colors[colorIndex].r,
      colors[colorIndex].g,
      colors[colorIndex].b,
      255,
    );
    let elTime = (Date.now() - df.sendTime) / 1000;
    const xPos = df.p2X - df.racketThickness / 2;
    let yPos =
      df.p2Y - df.racketLength / 2 + elTime * df.racketSpeed * df.p2Press;
    if (yPos < 0) yPos = 0;
    if (yPos + df.racketLength > 1) yPos = 1 - df.racketLength;
    p5.rect(
      xPos * canvasWidth,
      yPos * canvasHeight,
      df.racketThickness * canvasWidth,
      df.racketLength * canvasHeight,
    );
  }

  function drawBall() {
    p5.fill(
      colors[colorIndex].r,
      colors[colorIndex].g,
      colors[colorIndex].b,
      255,
    );
    const elTime = (Date.now() - df.sendTime) / 1000;
    const xPos = (df.ballX - df.ballRad + elTime * df.ballSpeedX) * canvasWidth;
    const yPos =
      (df.ballY - df.ballRad + elTime * df.ballSpeedY) * canvasHeight;
    p5.rect(
      xPos,
      yPos,
      df.ballRad * 2 * canvasWidth,
      df.ballRad * 2 * canvasHeight,
    );
  }

  function drawScore() {
    p5.fill(
      colors[colorIndex].r,
      colors[colorIndex].g,
      colors[colorIndex].b,
      255,
    );
    p5.textStyle('bold');
    p5.textSize(canvasHeight * 0.1);
    p5.textAlign('center', 'top');
    p5.text(
      `${df.p1Score}   ${df.p2Score}`,
      canvasWidth / 2,
      canvasHeight * 0.1,
    );
  }

  function drawPowerUps() {
    powerUpsMap.forEach((yAndType, x) => {
      switch (yAndType.type) {
        case 'wall':
          p5.fill(255, 255, 255, 255);
          break;
        case 'upSpeed':
          p5.fill(255, 0, 0, 255);
          break;
        case 'downSpeed':
          p5.fill(0, 255, 0, 255);
          break;
      }
      p5.rect(
        x * canvasWidth,
        yAndType.y * canvasHeight,
        df.powerUpsSize * canvasWidth,
        df.powerUpsSize * canvasHeight,
      );
    });
  }
  /* === */

  let input: any, button: any; // text box for input of id and submit button
  let idListOpacity = 1; // opacity of id list test
  let doneChoosing = false; // false if viewer still did not choose first session to watch
  function handleSubmit() {
    const idText = input.value();
    input.value(''); // empty box
    if (
      idText === '' ||
      isNaN(idText) ||
      !sessionIdsArray.includes(parseInt(idText))
    ) {
      console.log(`${idText} is an invalid id`);
      (document.getElementById('user_id') as HTMLInputElement)!.placeholder = 'Invalid id';
      (document.getElementById('user_id') as HTMLInputElement)!.value = '';
      return;
    }
    ws.send(JSON.stringify({ id: Number(idText) }));
    //
    doneChoosing = true;
    gameStarted = false;
    gameFinished = false;
    (document.getElementById('user_id') as HTMLInputElement)!.placeholder = 'Enter id';
    (document.getElementById('user_id') as HTMLInputElement)!.value = '';
  }

  //blocks user from displaying game if nothing chosen and handles box transparency
  function handleChooseSession() {
    if (doneChoosing) {
      let op = '0.3';
      if (p5.mouseY / canvasHeight < 0.25) op = '1';
      input.style('opacity', op);
      button.style('opacity', op);
      idListOpacity = parseFloat(op);
      sliders.forEach((s) => s.setOpacity(parseFloat(op) * 255));
      return false;
    }
    input.style('opacity', '1');
    button.style('opacity', '1');
    idListOpacity = 1;
    sliders.forEach((s) => s.setOpacity(255));
    return true;
  }

  // menu to diplay if p1 or p2 is not ready yet
  function handleGameNotStarted() {
    if (gameStarted) return false;
    p5.textAlign('center', 'center');
    const col = colors[colorIndex];
    p5.fill(col.r, col.g, col.b, 255);
    p5.textSize(canvasWidth / 50);
    p5.text('waiting for game to start...', canvasWidth / 2, canvasHeight / 2);
    return true;
  }

  // displays corresponding message if game stopped
  function handleGameFinished() {
    if (!gameFinished) return false;
    p5.textAlign('center', 'center');
    const col = colors[colorIndex];
    p5.fill(col.r, col.g, col.b, 255);
    p5.textSize(canvasWidth / 30);
    let msg;
    if (df.playerWon === 0) msg = 'the game session was interrupted';
    else msg = `player ${df.playerWon} won!`;
    p5.text(msg, canvasWidth / 2, canvasHeight / 2);
    return true;
  }

  // for framerate
  let lastLoop: number = new Date().getTime();
  let timeBeforeSendRequest = 1;
  // sends requestSessions: true every second + diplays the 10 first ones
  function getAndDisplayIds() {
    const newLoop: number = new Date().getTime();
    const frameRate: number = 1 / ((newLoop - lastLoop) / 1000);
    lastLoop = newLoop;
    timeBeforeSendRequest -= 1 / (frameRate + 2); // + 2 to avoid divion by zero or by one on the first frame
    if (timeBeforeSendRequest <= 0) {
      ws.send(JSON.stringify({ requestSessions: true }));
      timeBeforeSendRequest = 1;
    }
    // displaying the 20 first sessions
    p5.fill(255, 255, 255, idListOpacity * 255);
    p5.textAlign('center', 'top');
    p5.textSize(canvasWidth / 50);
    const max = Math.min(20, sessionIdsArray.length);
    for (let i = 0; i < max; i++)
      p5.text(`${sessionIdsArray[i]}`, (i + 1) * (canvasWidth / 40) * 1.8, 0);
    //display '...' if more than 20 sessions
    if (sessionIdsArray.length > max)
      p5.text('...', (max + 1) * (canvasWidth / 40) * 1.8, 0);
  }

  /* === sliders === */
  // creates and sets sliders to slider array
  function initSliders() {
    sliders.forEach((s) =>
      s.setP5Slider(
        p5.createSlider(s.s1, s.s2, s.s3, s.s4),
        widthOffset,
        heightOffset,
      ),
    );
  }

  // called each frame. calls drawcell on every sliders and gets their values
  function drawAndGetSliderValues() {
    sliders.forEach((s) => {
      switch (s.text) {
        case 'color':
          const c = colors[colorIndex];
          s.drawCell(c.r, c.g, c.b);
          colorIndex = s.p5Slider.value();
          break;
      }
    });
  }
  /* === */

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
        s.y + newHeightOffset + s.height / 1.5,
      );
      s.p5Slider.size(s.width * 0.9, s.height / 2);
    });

    //updating input box
    input.position(newWidthOffset, newCanvasHeight / 20 + newHeightOffset);
    input.size(newCanvasWidth / 7, newCanvasHeight / 25);
    //updating submit button box
    button.position(input.x + input.width, input.y);
    button.size(input.width / 1.5, input.height);

    p5.resizeCanvas(newCanvasWidth, newCanvasHeight);
    p5.background(0);
    canvasWidth = newCanvasWidth;
    canvasHeight = newCanvasHeight;
    widthOffset = newWidthOffset;
    heightOffset = newHeightOffset;
  }

  /* === p5.js main functions === */

  p5.setup = () => {
    initSliders();
    p5.createCanvas(canvasWidth, canvasHeight);
    p5.noStroke();
    // create input box
    input = p5.createInput();
    input.position(widthOffset, canvasHeight / 20 + heightOffset);
    input.size(canvasWidth / 7, canvasHeight / 25);
    input.id('user_id');
    (document.getElementById('user_id') as HTMLInputElement)!.placeholder = 'Enter id';
    (document.getElementById('user_id') as HTMLInputElement)!.value = '';
    // create submit button
    button = p5.createButton('submit');
    button.position(input.x + input.width, input.y);
    button.mousePressed(handleSubmit);
    button.size(input.width / 1.5, input.height);
    button.style('color', 'white');
    button.style('background-color', '#555555');
    // sliders
    p5.fill(255, 255, 255, 255);
    sliders.forEach((s) => s.p5Slider.show());
  };

  p5.draw = () => {
    console.log(doneChoosing);
    
    p5.background(0);
    handleWindowResize();
    if (handleSocketError()) return; //check if we are connected to server
    drawAndGetSliderValues();
    getAndDisplayIds();
    if (handleChooseSession()) return;
    if (handleGameFinished()) return;
    if (handleGameNotStarted()) return;
    drawMiddleLine();
    drawPlayer1();
    drawPlayer2();
    drawPowerUps();
    drawBall();
    drawScore();
  };
  return p5;
  /* === */
};
