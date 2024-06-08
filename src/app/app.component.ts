import { DealerService } from "./services/dealer.service";
import { PpWsService } from "./services/pp-ws.service";
import { Player } from "./objects/player";
import { Component, OnInit, inject } from "@angular/core";


@Component({
	selector: "app-root",
	templateUrl: "app.component.html",
	styleUrls: ["app.component.css"],
})
export class AppComponent implements OnInit {
	title = "pokerparty";

	protected dealerService: DealerService = inject(DealerService);
	private wsService: PpWsService = inject(PpWsService);

	winners: Player[] = [];
	userId: number = 0;

	choosingMode: boolean = true;
	isHost: boolean = true;
	gameStarted: boolean = false;
	joiningGame: boolean = true;

	joinCode: any;

	ngOnInit() {
		// this.deal();

		console.log(this.dealerService);
		console.log(this.winners);

		const wsUrl = "ws://localhost:8080";
		this.wsService.connect(wsUrl);
		this.wsService.sendMessage("");
		// console.log(this.userId);
	}

	deal() {
		console.log("REDEAL");
		this.dealerService.shuffleDeck();
		this.dealerService.dealHands();
		this.dealerService.dealCommunityCards();
		this.winners = this.dealerService.determineWinner();

		this.sendDeck();
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
		this.wsService.sendMessage("joinCode: " + result);
		return result;
	}
	
	sendDeck() {

	}

	sendCode() {

	}

	// Don't touch these - used only for UI screen flow.
	// Still should be tested - player in lobby screen has not been tested yet!

	// <!-- User wants to host a lobby, set choosingMode to false and isHost to true. Also, generate join code here. -->
	creatingLobby() {
		this.joinCode = this.generateJoinCode(6);

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
		this.gameStarted = true;
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
