import { DealerService } from "./services/dealer.service";
import { PpWsService } from "./services/pp-ws.service";
import { Component, OnInit, inject } from "@angular/core";

import { Player, Winner } from "./objects/player";
import { GameState, DealingStage } from "./objects/gameState";
import { Subscription } from "rxjs";

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
		this.deal();
		
		const wsUrl = "ws://localhost:8080";
		this.wsService.connect(wsUrl);

		this.subscription = this.wsService.lastMessage.subscribe(message => {
			// console.log(message.substring(0,1));
			const messageCode = parseInt(message.substring(0,1));
			const messageBody = JSON.parse(message.substring(2));

			switch (messageCode) {
				case 0: {
					// 0 = Game state update
					if (!this.isHost) {
						this.gameStarted = true;
						this.gameState.ds = <DealerService>messageBody;
						this.dealerService = this.gameState.ds;
						this.refreshPlayer();
					}
					break;
				}
				case 1: {
					// 1 = Player join request
					if (this.isHost) {
						var requestPlayer = <Player>messageBody;
						if (requestPlayer.joinCode === this.localGameCode) {
							this.addPlayer(requestPlayer);
						}
					}
					break;
				}
			}

		});

		// this.deal();
		// console.log(this.dealerService);
		// console.log(this.winners);
	}

	refreshPlayer() {
		for (let player of this.dealerService.playerList) {
			if (player.name != this.player.name) {
				continue;
			}
			this.player = player;
			break;
		}
	}

	deal() {
		console.log("REDEAL");
		this.dealerService.shuffleDeck();
		this.dealerService.dealHands();
		this.dealerService.dealCommunityCards();
		this.winners = this.dealerService.determineWinner();
		this.dealingStage = DealingStage.Preflop;
		this.wsService.sendMessage(this.dealerService);
	}

	showNextCommunityCards() {
		if (this.dealingStage == DealingStage.Reveal) {
			return;
		} else {
			this.dealingStage++;
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
			if (player.name == requestPlayer.name) {
				return false;
			}
		}
		return true;
	}

	addPlayer(newPlayer: Player) {
		// TODO Send error message if there is a name collision
		if (this.isNewPlayer(newPlayer)) {
			// send confirmation by echoing back request
			console.log("NEW PLAYER ADDED");
			this.wsService.sendMessage(newPlayer);
			this.dealerService.addPlayer(newPlayer);
		}
	}

	// sendDeck() {
	// 	this.wsService.sendMessage(this.dealerService);
	// }


	// sendPlayerList() {
	// 	this.wsService.sendMessage(this.dealerService.playerList[0]);
	// }

	sendJoinRequest() {
		this.wsService.sendMessage(this.player);
		// TODO rewrite more elegantly
		// TODO rewrite so it actually prevents a duplicate player from advancing
		this.wsService.lastMessage.subscribe(message => {
			var messageString = JSON.stringify(this.player);
			if (message === "1:" + messageString) {
				this.joiningGame = false;
				console.log("CONFIRMATION ACCEPTED");
				// TODO remove after testing
			}
		});
	}

	sendGameState() {
		this.wsService.sendMessage(this.gameState);
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
}
