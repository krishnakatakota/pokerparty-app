import { DealerService } from "./services/dealer.service";
import { Player } from "./objects/player";
import { Component, inject } from "@angular/core";

@Component({
	selector: "app-root",
	templateUrl: "app.component.html",
	styleUrls: ["app.component.css"],
})
export class AppComponent {
	title = "pokerparty";
	// firestore: Firestore = inject(Firestore)
	dealerService: DealerService = inject(DealerService);
	winners: Player[] = [];
	isHost: boolean = true;
	userId: number = 0;

	ngOnInit() {
		this.deal();
	}

	deal() {
		console.log("REDEAL");
		this.dealerService.shuffleDeck();
		this.dealerService.dealHands();
		this.dealerService.dealCommunityCards();
		this.winners = this.dealerService.determineWinner();

		this.sendDeck();
	}
	
	toggleHost() {
		this.isHost = !this.isHost;
	}

	incrementUserId() {
		this.userId++;
		if (this.userId > this.dealerService.playerList.length) {
			this.userId = 0;
		}
	}

	sendDeck() {
		
	}
}
