import { Card } from "./card";
import { PokerHandResult } from "./pokerHandResult";

export interface Player {
    id: number;
    name: string;
    hand: Card[];
	turnNumber: number;
	status: any;
	joinCode: string;
}

export interface Winner {
    player: Player;
    hand: PokerHandResult;
}