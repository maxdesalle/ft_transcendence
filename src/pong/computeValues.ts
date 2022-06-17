// type of objects that will be passed to computeValues
interface playerObjectInterface {
	readonly p1Y?: number,
	readonly p2Y?: number,
	readonly p1Press?: number,
	readonly p2Press?: number,
	readonly sendTime?: number
	readonly p1Ready?: boolean,
	readonly p2Ready?: boolean
};
let p1Ready: boolean = false;
let p2Ready: boolean = false;
let powerUpsOn: boolean = false;
// key: x === left location, value: y === top location, type === 'wall' or 'upSpeed' or 'downSpeed'
let powerUpsMap: Map<number, {y: number, type: string}> = new Map();

const {
	df,
	pi,
	holdTime,
	ballSpeedMagFast,
	ballSpeedMagSlow
} = require('./defaultVals.js');

let holdTimeTmp: number = holdTime; // just for syntactic sugar when creating a new session

/* === multiple sessions handling === */
// type that has all the variable of a game sessoin
interface sessionInterface {
	id: number,
	p1Ready: boolean,
	p2Ready: boolean,
	powerUpsOn: boolean,
	powerUpsMap: Map<number, {y: number, type: string}>,
	df: any,
	holdTimeTmp: number
};
const sessions: sessionInterface[] = []; //array of sessions
let currentSession: sessionInterface | undefined = undefined; // will be assigned to current session
/* === end of multiple sessions handling === */

//if powerUpsOn => roll a number and maybe generate a power up
function generatePowerUps(): void {
	if (!currentSession.powerUpsOn) return;
	const n: number = Math.floor(Math.random() * 9);
	if (n <= 5) return; // no power up generated
	const x: number = Math.random() * 0.2 + 0.4;
	const y: number = Math.random() * 0.8 + 0.1
	switch (n) {
		case 6:
			currentSession.powerUpsMap.set(x, {y: y, type: 'wall'}); // ball bounces on it
			break;
		case 7:
			currentSession.powerUpsMap.set(x, {y: y, type: 'upSpeed'}); // ball's speed increases
			break;
		case 8:
			currentSession.powerUpsMap.set(x, {y: y, type: 'downSpeed'}); // ball's speed decreases
			break;
	}
}

// moves players if they pressed a key
function movePlayers(p1Ob: playerObjectInterface, p2Ob: playerObjectInterface): void {
	// moving
	if (p1Ob.p1Y && p1Ob.sendTime)
		currentSession.df.p1Y = p1Ob.p1Y + currentSession.df.p1Press * currentSession.df.racketSpeed * ((Date.now() - p1Ob.sendTime) / 1000);
	if (p2Ob.p2Y && p2Ob.sendTime)
		currentSession.df.p2Y = p2Ob.p2Y + currentSession.df.p2Press * currentSession.df.racketSpeed * ((Date.now() - p2Ob.sendTime) / 1000);
	// bounds checking
	if (currentSession.df.p1Y + currentSession.df.racketLength / 2 > 1)
		currentSession.df.p1Y = 1 - currentSession.df.racketLength / 2;
	if (currentSession.df.p1Y - currentSession.df.racketLength / 2 < 0)
		currentSession.df.p1Y = currentSession.df.racketLength / 2;
	if (currentSession.df.p2Y + currentSession.df.racketLength / 2 > 1)
		currentSession.df.p2Y = 1 - currentSession.df.racketLength / 2;
	if (currentSession.df.p2Y - currentSession.df.racketLength / 2 < 0)
		currentSession.df.p2Y = currentSession.df.racketLength / 2;
}

//returns 1 for horizontal collision and 2 for vertical collision with a player
function checkColBP(pX: number, pY: number, pLen: number, pThick: number): number {
	const ulbx: number = currentSession.df.ballX - currentSession.df.ballRad;
	const ulby: number = currentSession.df.ballY - currentSession.df.ballRad;
	const ulpx: number = pX - pThick / 2;
	const ulpy: number = pY - pLen / 2;
	if (ulbx > ulpx + pThick) return 0;
	if (ulby > ulpy + pLen) return 0;
	if (currentSession.df.ballX + currentSession.df.ballRad < ulpx) return 0;
	if (currentSession.df.ballY + currentSession.df.ballRad < ulpy) return 0;
	if ((currentSession.df.ballSpeedX > 0 && currentSession.df.ballX > pX)
		|| (currentSession.df.ballSpeedX < 0 && currentSession.df.ballX < pX))
		return 1;
	return 2;
}

// changes ball direction if it collided with a player
function handleColBP(pX: number, pY: number, pLen: number, pThick: number): void {
	const rVal = checkColBP(pX, pY, pLen, pThick);
	if (rVal == 1) // horizontal collision
		currentSession.df.ballSpeedY *= -1;
	else if (rVal == 2) // vertical collision
	{
		generatePowerUps();
		const d: number = (pi / 180 * 60) * ((currentSession.df.ballY - pY) / ((pLen / 2 + currentSession.df.ballRad)));
		currentSession.df.ballSpeedX = Math.cos(d) * ballSpeedMagFast;
		currentSession.df.ballSpeedY = Math.sin(d) * ballSpeedMagFast;
		if (currentSession.df.ballX < pX)
			currentSession.df.ballSpeedX *= -1;
	}
	// putting ball out of racket
	if (Math.abs(currentSession.df.ballX - pX) < pThick / 2 + currentSession.df.ballRad
		&& Math.abs(currentSession.df.ballY - pY) < pLen / 2 + currentSession.df.ballRad) {
		const newBallX: number = pX + Math.sign(currentSession.df.ballSpeedX) * (pThick / 2 + currentSession.df.ballRad);
		currentSession.df.ballY += (newBallX - currentSession.df.ballX) * (currentSession.df.ballSpeedY / currentSession.df.ballSpeedX);
		currentSession.df.ballX = newBallX;
	}
}

function moveBall(dt: number): void {
	if (currentSession.holdTimeTmp <= 0) // little pause before launching ball
	{
		currentSession.df.ballX += currentSession.df.ballSpeedX * dt;
		currentSession.df.ballY += currentSession.df.ballSpeedY * dt;
	}
	else
		currentSession.holdTimeTmp -= dt;
}

// changes game state accordingly if ball hit upper/lower surface of went to score
function handleBallOOB(): void {
	//collision with up/down borders
	if (currentSession.df.ballY - currentSession.df.ballRad <= 0) {
		generatePowerUps();
		currentSession.df.ballY = currentSession.df.ballRad;
		currentSession.df.ballSpeedY *= -1;
	}
	if (currentSession.df.ballY + currentSession.df.ballRad >= 1) {
		generatePowerUps();
		currentSession.df.ballY = 1 - currentSession.df.ballRad;
		currentSession.df.ballSpeedY *= -1;
	}
	//player scoring
	if (currentSession.df.ballX - currentSession.df.ballRad <= 0) {
		currentSession.powerUpsMap.clear();
		currentSession.df.p2Score++;
		currentSession.holdTimeTmp = holdTime;
		const sign: number = ((currentSession.df.p1Score + currentSession.df.p2Score) % 2 == 0 ? 1 : -1);
		currentSession.df.ballX = 0.5 + 0.02 * sign;
		currentSession.df.ballY = 0.5 + 0.02 * sign;
		currentSession.df.ballSpeedX = Math.cos(pi / 4) * ballSpeedMagSlow * sign;
		currentSession.df.ballSpeedY = Math.sin(pi / 4) * ballSpeedMagSlow * sign;
		if (currentSession.df.p2Score == 10)
			currentSession.df.playerWon = 2
	}
	else if (currentSession.df.ballX - currentSession.df.ballRad >= 1) {
		currentSession.powerUpsMap.clear();
		currentSession.df.p1Score++;
		currentSession.holdTimeTmp = holdTime;
		const sign: number = ((currentSession.df.p1Score + currentSession.df.p2Score) % 2 == 0 ? 1 : -1);
		currentSession.df.ballX = 0.5 + 0.02 * sign;
		currentSession.df.ballY = 0.5 + 0.02 * sign;
		currentSession.df.ballSpeedX = Math.cos(pi / 4) * ballSpeedMagSlow * sign;
		currentSession.df.ballSpeedY = Math.sin(pi / 4) * ballSpeedMagSlow * sign;
		if (currentSession.df.p1Score == 10)
			currentSession.df.playerWon = 1
	}
}

// changes game state according to hit power up (if it is hit by one)
function handleColBPow() {
	if (!currentSession.powerUpsOn) return;
	currentSession.powerUpsMap.forEach((yAndType: {y: number, type: string}, x: number) => {
		if (!(currentSession.df.ballX + currentSession.df.ballRad < x
			|| currentSession.df.ballY + currentSession.df.ballRad < yAndType.y
			|| currentSession.df.ballX > x + currentSession.df.powerUpsSize
			|| currentSession.df.ballY > yAndType.y + currentSession.df.powerUpsSize))
		{
			switch(yAndType.type)
			{
				case 'wall':
					currentSession.df.ballSpeedY *= -1;
					break;
				case 'upSpeed':
					currentSession.df.ballSpeedX *= 1.5;
					currentSession.df.ballSpeedY *= 1.5;
					break;
				case 'downSpeed':
					currentSession.df.ballSpeedX /= 1.5;
					currentSession.df.ballSpeedY /= 1.5;
					break;
			}
			currentSession.powerUpsMap.delete(x);
		}
	});
}

// gets the two last objects sent by the players, the elapsed time between now and the last frame and the game id
// returns the object to send to all players and watchers
// automatically creates the session if it is a new one
function computeValues(
	p1Ob: playerObjectInterface,
	p2Ob: playerObjectInterface,
	dt: number,
	id: number
): object
{
	currentSession = sessions.find((s) => s.id === id);
	// creating the session
	if (currentSession === undefined)
	{
		sessions.push({id: id,
					   p1Ready: p1Ready,
					   p2Ready: p2Ready,
					   powerUpsOn: powerUpsOn,
					   powerUpsMap: new Map<number, {y: number, type: string}>(),
					   df: {...df},
					   holdTimeTmp: holdTimeTmp
					  });
		currentSession = sessions.find((s) => s.id === id);
	}
	// waits for both players to be ready
	if (!currentSession.p1Ready || !currentSession.p2Ready) {
		currentSession.p1Ready = (p1Ob.p1Ready ?? currentSession.p1Ready);
		currentSession.p2Ready = (p2Ob.p2Ready ?? currentSession.p2Ready);
		const ob = {
			p1Ready: currentSession.p1Ready,
			p2Ready: currentSession.p2Ready,
			gameStarted: false,
			id: currentSession.id // so the players can know their session id
		};
		if (p1Ob['power ups'] !== undefined)
			currentSession.powerUpsOn = p1Ob['power ups'];
		return ob;
	}
	// game logic
	currentSession.df.p1Press = (p1Ob.p1Press ?? currentSession.df.p1Press);
	currentSession.df.p2Press = (p2Ob.p2Press ?? currentSession.df.p2Press);
	movePlayers(p1Ob, p2Ob);
	moveBall(dt);
	handleColBP(currentSession.df.p1X, currentSession.df.p1Y, currentSession.df.racketLength, currentSession.df.racketThickness);
	handleColBP(currentSession.df.p2X, currentSession.df.p2Y, currentSession.df.racketLength, currentSession.df.racketThickness);
	handleBallOOB(); //Out Of bounds (bounce on walls or score)
	handleColBPow(); // ball and power ups
	currentSession.df.sendTime = Date.now();
	return {
		...currentSession.df,
		ballSpeedX: (currentSession.holdTimeTmp <= 0 ? currentSession.df.ballSpeedX : 0),
		ballSpeedY: (currentSession.holdTimeTmp <= 0 ? currentSession.df.ballSpeedY : 0),
		powerUpsMap: Object.fromEntries(currentSession.powerUpsMap),
		gameStarted: true
	};
}

// function to call when game has ended (to clean values for next game with same id)
function deleteGameSession(id: number) {

	const sess: sessionInterface = sessions.find((s) => s.id === id);
	if (sess)
		sessions.splice(sessions.findIndex((s) => s.id === id), 1);
	else
		console.error(`could not delete session ${id}: session id not found in sessions array`);
}

module.exports = {computeValues, deleteGameSession};
