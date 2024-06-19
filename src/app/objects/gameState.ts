import { DealerService } from "../services/dealer.service";

export interface GameState {
	ds: DealerService;
	gameCode: string;
}

export enum DealingStage {
	Preflop,
	Flop,
	Turn,
	River,
}