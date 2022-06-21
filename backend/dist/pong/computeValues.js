"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteGameSession = exports.computeValues = void 0;
const defaultVals_1 = require("./defaultVals");
;
let p1Ready = false;
let p2Ready = false;
let powerUpsOn = false;
let powerUpsMap = new Map();
const { df, pi, holdTime, ballSpeedMagFast, ballSpeedMagSlow } = defaultVals_1.default_values;
let holdTimeTmp = holdTime;
;
const sessions = [];
let currentSession = undefined;
function generatePowerUps() {
    if (!currentSession.powerUpsOn)
        return;
    const n = Math.floor(Math.random() * 9);
    if (n <= 5)
        return;
    const x = Math.random() * 0.2 + 0.4;
    const y = Math.random() * 0.8 + 0.1;
    switch (n) {
        case 6:
            currentSession.powerUpsMap.set(x, { y: y, type: 'wall' });
            break;
        case 7:
            currentSession.powerUpsMap.set(x, { y: y, type: 'upSpeed' });
            break;
        case 8:
            currentSession.powerUpsMap.set(x, { y: y, type: 'downSpeed' });
            break;
    }
}
function movePlayers(p1Ob, p2Ob) {
    if (p1Ob.p1Y && p1Ob.sendTime)
        currentSession.df.p1Y = p1Ob.p1Y + currentSession.df.p1Press * currentSession.df.racketSpeed * ((Date.now() - p1Ob.sendTime) / 1000);
    if (p2Ob.p2Y && p2Ob.sendTime)
        currentSession.df.p2Y = p2Ob.p2Y + currentSession.df.p2Press * currentSession.df.racketSpeed * ((Date.now() - p2Ob.sendTime) / 1000);
    if (currentSession.df.p1Y + currentSession.df.racketLength / 2 > 1)
        currentSession.df.p1Y = 1 - currentSession.df.racketLength / 2;
    if (currentSession.df.p1Y - currentSession.df.racketLength / 2 < 0)
        currentSession.df.p1Y = currentSession.df.racketLength / 2;
    if (currentSession.df.p2Y + currentSession.df.racketLength / 2 > 1)
        currentSession.df.p2Y = 1 - currentSession.df.racketLength / 2;
    if (currentSession.df.p2Y - currentSession.df.racketLength / 2 < 0)
        currentSession.df.p2Y = currentSession.df.racketLength / 2;
}
function checkColBP(pX, pY, pLen, pThick) {
    const ulbx = currentSession.df.ballX - currentSession.df.ballRad;
    const ulby = currentSession.df.ballY - currentSession.df.ballRad;
    const ulpx = pX - pThick / 2;
    const ulpy = pY - pLen / 2;
    if (ulbx > ulpx + pThick)
        return 0;
    if (ulby > ulpy + pLen)
        return 0;
    if (currentSession.df.ballX + currentSession.df.ballRad < ulpx)
        return 0;
    if (currentSession.df.ballY + currentSession.df.ballRad < ulpy)
        return 0;
    if ((currentSession.df.ballSpeedX > 0 && currentSession.df.ballX > pX)
        || (currentSession.df.ballSpeedX < 0 && currentSession.df.ballX < pX))
        return 1;
    return 2;
}
function handleColBP(pX, pY, pLen, pThick) {
    const rVal = checkColBP(pX, pY, pLen, pThick);
    if (rVal == 1)
        currentSession.df.ballSpeedY *= -1;
    else if (rVal == 2) {
        generatePowerUps();
        const d = (pi / 180 * 60) * ((currentSession.df.ballY - pY) / ((pLen / 2 + currentSession.df.ballRad)));
        currentSession.df.ballSpeedX = Math.cos(d) * ballSpeedMagFast;
        currentSession.df.ballSpeedY = Math.sin(d) * ballSpeedMagFast;
        if (currentSession.df.ballX < pX)
            currentSession.df.ballSpeedX *= -1;
    }
    if (Math.abs(currentSession.df.ballX - pX) < pThick / 2 + currentSession.df.ballRad
        && Math.abs(currentSession.df.ballY - pY) < pLen / 2 + currentSession.df.ballRad) {
        const newBallX = pX + Math.sign(currentSession.df.ballSpeedX) * (pThick / 2 + currentSession.df.ballRad);
        currentSession.df.ballY += (newBallX - currentSession.df.ballX) * (currentSession.df.ballSpeedY / currentSession.df.ballSpeedX);
        currentSession.df.ballX = newBallX;
    }
}
function moveBall(dt) {
    if (currentSession.holdTimeTmp <= 0) {
        currentSession.df.ballX += currentSession.df.ballSpeedX * dt;
        currentSession.df.ballY += currentSession.df.ballSpeedY * dt;
    }
    else
        currentSession.holdTimeTmp -= dt;
}
function handleBallOOB() {
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
    if (currentSession.df.ballX - currentSession.df.ballRad <= 0) {
        currentSession.powerUpsMap.clear();
        currentSession.df.p2Score++;
        currentSession.holdTimeTmp = holdTime;
        const sign = ((currentSession.df.p1Score + currentSession.df.p2Score) % 2 == 0 ? 1 : -1);
        currentSession.df.ballX = 0.5 + 0.02 * sign;
        currentSession.df.ballY = 0.5 + 0.02 * sign;
        currentSession.df.ballSpeedX = Math.cos(pi / 4) * ballSpeedMagSlow * sign;
        currentSession.df.ballSpeedY = Math.sin(pi / 4) * ballSpeedMagSlow * sign;
        if (currentSession.df.p2Score == 10)
            currentSession.df.playerWon = 2;
    }
    else if (currentSession.df.ballX - currentSession.df.ballRad >= 1) {
        currentSession.powerUpsMap.clear();
        currentSession.df.p1Score++;
        currentSession.holdTimeTmp = holdTime;
        const sign = ((currentSession.df.p1Score + currentSession.df.p2Score) % 2 == 0 ? 1 : -1);
        currentSession.df.ballX = 0.5 + 0.02 * sign;
        currentSession.df.ballY = 0.5 + 0.02 * sign;
        currentSession.df.ballSpeedX = Math.cos(pi / 4) * ballSpeedMagSlow * sign;
        currentSession.df.ballSpeedY = Math.sin(pi / 4) * ballSpeedMagSlow * sign;
        if (currentSession.df.p1Score == 10)
            currentSession.df.playerWon = 1;
    }
}
function handleColBPow() {
    if (!currentSession.powerUpsOn)
        return;
    currentSession.powerUpsMap.forEach((yAndType, x) => {
        if (!(currentSession.df.ballX + currentSession.df.ballRad < x
            || currentSession.df.ballY + currentSession.df.ballRad < yAndType.y
            || currentSession.df.ballX > x + currentSession.df.powerUpsSize
            || currentSession.df.ballY > yAndType.y + currentSession.df.powerUpsSize)) {
            switch (yAndType.type) {
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
function computeValues(p1Ob, p2Ob, dt, id) {
    var _a, _b, _c, _d;
    currentSession = sessions.find((s) => s.id === id);
    if (currentSession === undefined) {
        sessions.push({ id: id,
            p1Ready: p1Ready,
            p2Ready: p2Ready,
            powerUpsOn: powerUpsOn,
            powerUpsMap: new Map(),
            df: Object.assign({}, df),
            holdTimeTmp: holdTimeTmp });
        currentSession = sessions.find((s) => s.id === id);
    }
    if (!currentSession.p1Ready || !currentSession.p2Ready) {
        currentSession.p1Ready = ((_a = p1Ob.p1Ready) !== null && _a !== void 0 ? _a : currentSession.p1Ready);
        currentSession.p2Ready = ((_b = p2Ob.p2Ready) !== null && _b !== void 0 ? _b : currentSession.p2Ready);
        const ob = {
            p1Ready: currentSession.p1Ready,
            p2Ready: currentSession.p2Ready,
            gameStarted: false,
            id: currentSession.id
        };
        if (p1Ob['power ups'] !== undefined)
            currentSession.powerUpsOn = p1Ob['power ups'];
        return ob;
    }
    currentSession.df.p1Press = ((_c = p1Ob.p1Press) !== null && _c !== void 0 ? _c : currentSession.df.p1Press);
    currentSession.df.p2Press = ((_d = p2Ob.p2Press) !== null && _d !== void 0 ? _d : currentSession.df.p2Press);
    movePlayers(p1Ob, p2Ob);
    moveBall(dt);
    handleColBP(currentSession.df.p1X, currentSession.df.p1Y, currentSession.df.racketLength, currentSession.df.racketThickness);
    handleColBP(currentSession.df.p2X, currentSession.df.p2Y, currentSession.df.racketLength, currentSession.df.racketThickness);
    handleBallOOB();
    handleColBPow();
    currentSession.df.sendTime = Date.now();
    return Object.assign(Object.assign({}, currentSession.df), { ballSpeedX: (currentSession.holdTimeTmp <= 0 ? currentSession.df.ballSpeedX : 0), ballSpeedY: (currentSession.holdTimeTmp <= 0 ? currentSession.df.ballSpeedY : 0), powerUpsMap: Object.fromEntries(currentSession.powerUpsMap), gameStarted: true });
}
exports.computeValues = computeValues;
function deleteGameSession(id) {
    const sess = sessions.find((s) => s.id === id);
    if (sess)
        sessions.splice(sessions.findIndex((s) => s.id === id), 1);
    else
        console.error(`could not delete session ${id}: session id not found in sessions array`);
}
exports.deleteGameSession = deleteGameSession;
//# sourceMappingURL=computeValues.js.map