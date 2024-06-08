import { Card } from "./card";

export interface Player {
    id: number;
    name: string;
    hand: Card[];
}