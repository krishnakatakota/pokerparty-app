import { Component, Input, inject } from "@angular/core";
import { Card } from "../objects/card";
import { DealerService } from "../services/dealer.service";
import { DealingStage } from "../objects/gameState"
import { Player, Winner } from "../objects/player"

@Component({
	selector: "app-community",
	templateUrl: "./community.component.html",
	styleUrl: "./community.component.css",
})
export class CommunityComponent {
	@Input() community!: Card[];
	@Input() dealingStage!: DealingStage;
	@Input() winners!: Winner[];

	ngOnInit() {
		// this.community = DealerService.community;
	}
}
