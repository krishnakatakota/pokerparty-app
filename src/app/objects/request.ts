export interface Request {
	reqType: MsgTypes;
	message: any;
}

export enum MsgTypes {
	gameState,
	confirmJoin,
	rejectJoin,
	foldRequest,
	joinRequest,
	leaveRequest,
	endRequest,
}