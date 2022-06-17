const socketServerIP = 'localhost';
const socketServerPort = 3000;
const httpServerIP = 'localhost';
const httpServerPort = 3000;
let socketErrObject = undefined;
let ws; // webSocket
const canvasWidth = (innerWidth > innerHeight ? innerHeight : innerWidth);
const canvasHeight = canvasWidth;
let gameStarted = false;
let gameFinished = false;
let sessionIdsArray = []; // list of available game session (top of the screen)

// game variables (the server will send the correct values to df before the game starts)
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
	powerUpsSize: 0
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
	{ r: 199, g: 21, b: 133 }
];
let colorIndex = 0; // default fill color is white
//sound vars
let playImpact = false;
let playScore = false;
let impactSound = undefined;
let scoreSound = undefined;
//sliders (sound and color)
class Slider {
	// x y and width and height in pixels, s1, s2, s3, s4 are arguments passed to p5.js slider constructor
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
		this.a = 255;
	}
	// call this function to set a p5.js slider to this slider object
	setP5Slider(p5Slider) {
		this.p5Slider = p5Slider;
		this.p5Slider.position(this.x + (this.width * 0.1) / 2, this.y + this.height / 2);
		this.p5Slider.size(this.width * 0.9, this.height / 2);
		this.p5Slider.hide();
	}
	// changes cell opacity to a (0-255)
	setOpacity(a) {
		this.a = a;
		if (this.p5Slider !== undefined)
			this.p5Slider.style('opacity', (a / 255).toString());
	}
	// draws surrounding cell of slider (with the text)
	drawCell(r, g, b) {
		if (r === undefined && g === undefined && b === undefined)
			r = g = b = 255;
		r = (r === undefined ? 0 : r);
		g = (g === undefined ? 0 : g);
		b = (b === undefined ? 0 : b);
		textStyle(NORMAL);
		noFill();
		stroke(100, 100, 100, this.a);
		rect(this.x, this.y, this.width, this.height);
		noStroke();
		textSize(this.width / this.text.length * 1.3);
		textAlign(CENTER, TOP);
		fill(r, g, b, this.a);
		text(this.text, this.x + this.width / 2, this.y + this.height / 8);
	}
};
// all settings sliders
let sliders = [
	new Slider('volume',
			   3 * (canvasWidth / 7), canvasHeight / 20,
			   canvasWidth / 7, canvasHeight / 15,
			   0, 1, 1, 0,
			   false),
	new Slider('color',
			   5 * (canvasWidth / 7), canvasHeight / 20,
			   canvasWidth / 7, canvasHeight / 15,
			   0, 6, colorIndex, 1,
			   false)
];

//connects to server
function initSocket() {
	const serverAddress = `ws://${socketServerIP}:${socketServerPort}/pong_viewer`;
	ws = new WebSocket(serverAddress);

	ws.addEventListener('open', () => {
		console.log(`connected to ${serverAddress}`);
	});
	ws.addEventListener('close', () => {
		console.log('connection closed');
	});
	ws.addEventListener('error', (e) => {
		socketErrObject = e;
		console.error(`socket error:${e.message}`);
	});
	// set all the game variables
	ws.addEventListener('message', ({ data }) => {
		const dataOB = JSON.parse(String(data));
		gameStarted = dataOB.gameStarted ?? gameStarted;
		gameFinished = dataOB.gameFinished ?? gameFinished;
		sessionIdsArray = dataOB.sessionIdsArray ?? sessionIdsArray;
		const scoreTmp = [df.p1Score, df.p2Score];
		const ballSpeedTmp = [df.ballSpeedX, df.ballSpeedY];
		if (dataOB.powerUpsMap)
			powerUpsMap = new Map(Object.entries(dataOB.powerUpsMap));
		for (const key in df)
			df[key] = (dataOB[key] ?? df[key]);
		if (dataOB.playerNumber !== undefined) // to avoid playing sounds when default vals are sent
			return;
		if (scoreTmp[0] !== df.p1Score || scoreTmp[1] !== df.p2Score)
			playScore = true;
		if ((df.ballSpeedX !== 0 || df.ballSpeedY !== 0)
			&& (ballSpeedTmp[0] !== df.ballSpeedX || ballSpeedTmp[1] !== df.ballSpeedY))
			playImpact = true;
	});
}

//returns true if one player won and displays the according menu
//else returns false 
function handlePlayerWon() {
	if (df.playerWon == 0)
		return false;
	textAlign(CENTER, CENTER);
	const col = color(colors[colorIndex].r, colors[colorIndex].g, colors[colorIndex].b);
	fill(col);
	text(`Player ${df.playerWon} won!`, canvasWidth / 2, canvasHeight / 2);
	return true;
}

// handles socket errors
function handleSocketError() {
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
	return false;
}

/* === draw functions === */
function drawMiddleLine() {
	const col = color(colors[colorIndex].r, colors[colorIndex].g, colors[colorIndex].b);
	fill(col);
	const x = (0.5 - df.middleLineThickness / 2) * canvasWidth;
	for (let i = 0; i < 1; i += df.middleLineLength * 2) {
		const y = (i - df.middleLineLength / 2) * canvasHeight;
		rect(x, y, df.middleLineThickness * canvasWidth, df.middleLineLength * canvasHeight);
	}
}

function drawPlayer1() { //left racket
	const col = color(colors[colorIndex].r, colors[colorIndex].g, colors[colorIndex].b);
	fill(col);
	let elTime = (Date.now() - df.sendTime) / 1000;
	const xPos = (df.p1X - df.racketThickness / 2);
	let yPos = (df.p1Y - df.racketLength / 2 + elTime * df.racketSpeed * df.p1Press);
	if (yPos < 0)
		yPos = 0;
	if (yPos + df.racketLength > 1)
		yPos = 1 - df.racketLength;
	rect(xPos * canvasWidth, yPos * canvasHeight, df.racketThickness * canvasWidth, df.racketLength * canvasHeight);
}

function drawPlayer2() { //right racket
	const col = color(colors[colorIndex].r, colors[colorIndex].g, colors[colorIndex].b);
	fill(col);
	let elTime = (Date.now() - df.sendTime) / 1000;
	const xPos = (df.p2X - df.racketThickness / 2);
	let yPos = (df.p2Y - df.racketLength / 2 + elTime * df.racketSpeed * df.p2Press);
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
		switch(yAndType.type) {
			case 'wall':
				fill(255);
				break;
			case 'upSpeed':
				fill(255, 0, 0);
				break;
			case 'downSpeed':
				fill(0, 255, 0);
				break;
		}
		rect(
			x * canvasWidth,
			yAndType.y * canvasHeight,
			df.powerUpsSize * canvasWidth,
			df.powerUpsSize * canvasHeight
		)
	});
}
/* === */

/* === music and sounds === */
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
/* === */

let input, button; // text box for input of id and submit button
let idListOpacity = 1; // opacity of id list test
let doneChoosing = false; // false if viewer still did not choose first session to watch
function handleSubmit() {
	const idText = input.value();
	input.value(''); // empty box
	if (idText === '' || isNaN(idText) || !sessionIdsArray.includes(int(idText)))
	{
		console.log(`${idText} is an invalid id`);
		document.querySelector('input').placeholder = 'invalid id';
		return;
	}
	ws.send(JSON.stringify({id: int(idText)}));
	doneChoosing = true;
	gameStarted = false;
	gameFinished = false;
	document.querySelector('input').placeholder = 'enter id';
}

//blocks user from displaying game if nothing chosen and handles box transparency
function handleChooseSession() {
	if (doneChoosing)
	{
		let op = '0.3';
		if (mouseY / canvasHeight < 0.25)
			op = '1';
		input.style('opacity', op);
		button.style('opacity', op);
		idListOpacity = parseFloat(op);
		sliders.forEach(s => s.setOpacity(parseFloat(op) * 255));
		return false;
	}
	input.style('opacity', '1');
	button.style('opacity', '1');
	idListOpacity = 1;
	sliders.forEach(s => s.setOpacity(255));
	return true;
}

// menu to diplay if p1 or p2 is not ready yet
function handleGameNotStarted()
{
	if (gameStarted) return false;
	textAlign(CENTER, CENTER);
	const col = colors[colorIndex];
	fill(col.r, col.g, col.b);
	textSize(canvasWidth / 50);
	text('waiting for game to start...', canvasWidth / 2, canvasHeight / 2);
	return true;
}

// displays corresponding message if game stopped
function handleGameFinished() {
	if (!gameFinished) return false;
	textAlign(CENTER, CENTER);
	const col = colors[colorIndex];
	fill(col.r, col.g, col.b);
	textSize(canvasWidth / 30);
	let msg;
	if (df.playerWon === 0)
		msg = 'the game session was interrupted';
	else
		msg = `player ${df.playerWon} won!`;
	text(msg, canvasWidth / 2, canvasHeight / 2);
	return true;
}

let timeBeforeSendRequest = 1;
// sends requestSessions: true every second + diplays the 10 first ones
function getAndDisplayIds() {
	timeBeforeSendRequest -= 1 / (frameRate() + 2); // + 2 to avoid divion by zero or by one on the first frame
	if (timeBeforeSendRequest <= 0)
	{
		ws.send(JSON.stringify({requestSessions: true}));
		timeBeforeSendRequest = 1;
	}
	// displaying the 20 first sessions
	fill(255, 255, 255, idListOpacity * 255); textAlign(CENTER, TOP); textSize(canvasWidth / 50);
	const max = Math.min(20, sessionIdsArray.length);
	for (let i = 0; i < max; i++)
		text(`${sessionIdsArray[i]}`, (i + 1) * (canvasWidth / 40) * 1.8, 0);
	//display '...' if more than 20 sessions
	if (sessionIdsArray.length > max)
		text('...',  (max + 1) * (canvasWidth / 40) * 1.8, 0);
}

/* === sliders === */
// creates and sets sliders to slider array
function initSliders() {
	sliders.forEach((s) => s.setP5Slider(createSlider(s.s1, s.s2, s.s3, s.s4)));
}

// called each frame. calls drawcell on every sliders and gets their values
function drawAndGetSliderValues() {
	sliders.forEach((s) => {
		s.drawCell();
		switch (s.text) {
			case 'color':
				colorIndex = s.p5Slider.value();
				break;
			case 'volume':
				const volumeLevel = s.p5Slider.value();
				impactSound.setVolume(volumeLevel);
				scoreSound.setVolume(volumeLevel);
				break;
		}
	});
}
/* === */

/* === p5.js main functions === */
function preload() {
	impactSound = loadSound(`http://${httpServerIP}:${httpServerPort}/music/impact.mp3`);
	scoreSound = loadSound(`http://${httpServerIP}:${httpServerPort}/music/score.mp3`);
}

function setup() {
	initSocket();
	createCanvas(canvasWidth, canvasHeight);
	noStroke();
	// create input box
	input = createInput();
	input.position(0, canvasHeight / 20);
	input.size(canvasWidth / 7, canvasHeight / 25);
	document.querySelector('input').placeholder = 'enter id';
	// create submit button
	button = createButton('submit');
	button.position(input.x + input.width, input.y);
	button.mousePressed(handleSubmit);
	button.size(input.width / 1.5, input.height);
	// sliders
	initSliders();
	fill(255);
	sliders.forEach((s) => s.p5Slider.show());
}

function draw() {
	background(0);
	if (handleSocketError()) return; //check if we are connected to server
	drawAndGetSliderValues();
	getAndDisplayIds();
	if (handleChooseSession()) return;
	if (handleGameFinished()) return;
	if (handleGameNotStarted()) return;
	playSounds();
	drawMiddleLine();
	drawPlayer1();
	drawPlayer2();
	drawPowerUps();
	drawBall();
	drawScore();
}
/* === */
