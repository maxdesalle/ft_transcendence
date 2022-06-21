"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default_values = void 0;
const pi = 3.141592654;
const holdTime = 1;
const ballSpeedMagFast = 0.9;
const ballSpeedMagSlow = 0.4;
const defaultVals = {
    p1Y: 0.5,
    p2Y: 0.5,
    ballX: 0.52,
    ballY: 0.52,
    p1Score: 0,
    p2Score: 0,
    playerWon: 0,
    racketLength: 0.2,
    racketThickness: 0.03,
    p1X: 0.1,
    p2X: 0.9,
    ballRad: 0.015,
    middleLineThickness: 0.02,
    middleLineLength: 1. / 15,
    ballSpeedX: Math.cos(pi / 4) * ballSpeedMagSlow,
    ballSpeedY: Math.sin(pi / 4) * ballSpeedMagSlow,
    racketSpeed: 1.5,
    p1Press: 0,
    p2Press: 0,
    sendTime: 0,
    powerUpsSize: 0.03,
};
exports.default_values = {
    df: defaultVals,
    pi: pi,
    holdTime: holdTime,
    ballSpeedMagFast: ballSpeedMagFast,
    ballSpeedMagSlow: ballSpeedMagSlow
};
//# sourceMappingURL=defaultVals.js.map