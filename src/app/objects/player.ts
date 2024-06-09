import { Card } from "./card";

export interface Player {
    id: number;
    name: string;
    hand: Card[];
	turnNumber: number;
	status: any;
	joinCode: string;
}