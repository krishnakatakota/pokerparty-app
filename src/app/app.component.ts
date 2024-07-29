import { Subscription } from "rxjs";
import { Component, OnInit, inject } from "@angular/core";

import { DealerService } from "./services/dealer.service";
import { PpWsService } from "./services/pp-ws.service";

import { Player, Winner } from "./objects/player";
import { GameState, DealingStage } from "./objects/gameState";
import { Request, MsgTypes } from "./objects/request";
@Component({
	selector: "app-root",
	templateUrl: "app.component.html",
	styleUrls: ["app.component.css"],
})
export class AppComponent implements OnInit {
	title = "pokerparty";

	private wsService: PpWsService = inject(PpWsService);
	dealerService: DealerService = inject(DealerService);
	private subscription!: Subscription;

	winners: Winner[] = [];
	userId: number = 0;
	localGameCode: string = "";
	gameState: GameState = {
		ds: this.dealerService,
		gameCode: ""
	}
	player: Player = {
		id: 0,
		name: "",
		hand: [],
		turnNumber: 0,
		status: " ",
		joinCode: ""
	};

	choosingMode: boolean = true;
	isHost: boolean = true;
	gameStarted: boolean = false;
	joiningGame: boolean = true;
	dealingStage: DealingStage = 0;

	ngOnInit() {
		const wsUrl = "wss://websocket.pokerparty.click";

		this.wsService.connect(wsUrl);

		this.subscription = this.subscribe();

		this.deal();
	}

	refreshPlayer() {
		for (let player of this.dealerService.playerList) {
			if (player.name != this.player.name) {
				continue;
			}
			this.player = player;
			return;
		}
	}

	deal() {
		console.log("REDEAL");
		this.dealerService.unfoldPlayers();
		this.dealerService.shuffleDeck();
		this.dealerService.dealHands();
		this.dealerService.dealCommunityCards();
		// this.winners = this.dealerService.determineWinner();
		this.dealingStage = DealingStage.Preflop;

		this.wsService.sendMessage(MsgTypes.gameState , this.dealerService);
	}

	showNextCommunityCards() {
		// console.log(this.dealingStage);
		// console.log(this.dealerService.playerList);
		if (this.dealingStage == DealingStage.Reveal) {
			return;
		} else {
			this.dealingStage++;
			if (this.dealingStage == DealingStage.Reveal) {
				this.winners = this.dealerService.determineWinner();	
			}
		}
	}

	incrementUserId() {
		this.userId++;
		if (this.userId >= this.dealerService.playerList.length) {
			this.userId = 0;
		}
	}

	generateJoinCode(length: any) {
		let result = '';
		const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
		const charactersLength = characters.length;
		let counter = 0;
		while (counter < length) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength)); 
			counter += 1;
		}
		console.log(result);
		return result;
	}

	isNewPlayer(requestPlayer: Player) {
		for (let player of this.dealerService.playerList) {
			if (player.name === requestPlayer.name) {
				return false;
			}
		}
		return true;
	}

	addPlayer(newPlayer: Player) {
		// TODO Send error message if there is a name collision
		if (this.isNewPlayer(newPlayer)) {
			// send confirmation by changing status to "joined" and echoing back Player object
			// CHANGED TO: send confirmation by echoing Player object with MsgType confirmJoin
			console.log("NEW PLAYER ADDED");
			this.dealerService.addPlayer(newPlayer);
			var newPlayerIndex = this.dealerService.playerList.findIndex(player => player.name === newPlayer.name);
			// this.dealerService.playerList[newPlayerIndex].status = "joined";
			this.wsService.sendMessage(MsgTypes.confirmJoin, this.dealerService.playerList[newPlayerIndex]);
		} else {
			// send rejection by keeping status as "requesting-join" and echoing back Player object
			// CHANGED TO: send rejection by echoing Player object with MsgType rejectJoin
			console.log("NEW PLAYER REJECTED");
			this.wsService.sendMessage(MsgTypes.rejectJoin, newPlayer);
		}
		return;
	}

	sendJoinRequest() {
		this.wsService.sendMessage(MsgTypes.joinRequest, this.player);
	}

	subscribe() {
		return this.wsService.lastMessage.subscribe(msg => {
			var req = this.msgCast(msg);
			var reqType = req.reqType;
			var reqBody = req.message;

			switch (reqType) {
				// GAMESTATE UPDATES
				case MsgTypes.gameState: {
					//	gameState update
					if (!this.isHost) {
						this.gameStarted = true;
						this.gameState.ds = <DealerService>reqBody;
						this.dealerService = this.gameState.ds;
						this.refreshPlayer();
					}
				}
				break;
				case MsgTypes.rejectJoin: {
					//	player join request was rejected
					if (reqBody.name == this.player.name) {
						this.joiningGame = true;
						console.log("CONFIRMATION REJECTED");
					}
				}
				break;
				case MsgTypes.confirmJoin: {
					//	player join request was accepted
					if (reqBody.name == this.player.name) {
						this.joiningGame = false;
						this.player.status = "joined";
						console.log("CONFIRMATION ACCEPTED");
					}
				}
				break;
				case MsgTypes.endRequest: {
					//	TODO: IMPLEMENT GAME END REQUESTS
					//	host ended game
				}
				break;
				case MsgTypes.joinRequest: {
					//	player is trying to join game
					if (this.isHost) {
						if (!this.gameStarted) {
							var reqPlayer = <Player>reqBody;
							if (reqPlayer.joinCode === this.localGameCode) {
								this.addPlayer(reqPlayer);
							}
						}
						else {
							// TODO: IMPLEMENT JOIN QUEUE
							// Add players to a join queue for when current round ends
						}
					}
				}
				break;
				case MsgTypes.foldRequest: {
					//	player is folding
					if (this.isHost) {
						var currPlayerIndex = this.dealerService.playerList.findIndex(player => player.name === reqBody.name);
						this.dealerService.playerList[currPlayerIndex].status = "folded";
					}
				}
				break;
				case MsgTypes.leaveRequest: {
					//	TODO: IMPLEMENT LEAVE REQUESTS
					//	player is leaving game
				}
				break;
			}
		});
	}

	sendGameState() {
		this.wsService.sendMessage(MsgTypes.gameState, this.gameState);
	}

	setPlayer(playerEvent: Player) {
		this.player = playerEvent;
	}


	// Don't touch these - used only for UI screen control.
	// Still should be tested - player in lobby screen has not been tested yet!

	// <!-- User wants to host a lobby, set choosingMode to false and isHost to true. Also, generate join code here. -->
	createLobby() {
		this.localGameCode = this.generateJoinCode(6);
		this.gameState = {
			ds: this.dealerService,
			gameCode: this.localGameCode
		}

		// this.sendGameState();

		this.choosingMode = false;
		this.isHost = true;
	}

	// <!-- User wants to join a lobby, set choosingMode to false and isHost tofalse -->
	joinLobby() {
		this.choosingMode = false;
		this.isHost = false;
	}

	fold() {
		this.player.status = "folded";
		this.wsService.sendMessage(MsgTypes.foldRequest, this.player);
	}

	// <!-- Ends game, kicks all back to lobby screen by setting gameStarted to false -->
	endGame() {
		this.gameStarted = false;
	}

	// <!-- Should close lobby, set gameStarted to false, choosingMode to true -->
	closeLobby() {
		this.gameStarted = false;
		this.choosingMode = true;
	}

	// <!-- Set gameStarted to true -->
	startGame() {
		console.log("STARTING GAME");
		this.gameStarted = true;
		this.deal();
	}

	// <!-- Player leaves game, goes back to join lobby screen by setting gameStarted to false and joiningGame to true -->
	leaveGame() {
		this.gameStarted = false;
		this.joiningGame = true;
	}

	// <!-- Back button should take played back to host/player choice screen, set choosingMode to true, gameStarted to false -->
	backToGamemodeChoices() {
		this.choosingMode = true;
		this.gameStarted = false;
	}

	// casts message to Request object
	msgCast(message: string) {
		console.log(message);
		var jsonMsg = JSON.parse(message);
		var req: Request = {
			reqType: jsonMsg.reqType,
			message: jsonMsg.message,
		}
		return req;
	}
}
