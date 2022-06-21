interface playerObjectInterface {
    readonly p1Y?: number;
    readonly p2Y?: number;
    readonly p1Press?: number;
    readonly p2Press?: number;
    readonly sendTime?: number;
    readonly p1Ready?: boolean;
    readonly p2Ready?: boolean;
}
export declare function computeValues(p1Ob: playerObjectInterface, p2Ob: playerObjectInterface, dt: number, id: number): object;
export declare function deleteGameSession(id: number): void;
export {};
