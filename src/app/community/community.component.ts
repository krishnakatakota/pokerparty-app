import { Component, Input, inject } from "@angular/core";
import { Card } from "../objects/card";
import { DealerService } from "../services/dealer.service";
import { DealingStage } from "../objects/gameState"

@Component({
	selector: "app-community",
	templateUrl: "./community.component.html",
	styleUrl: "./community.component.css",
})
export class CommunityComponent {
	@Input() community!: Card[];
	@Input() dealingStage!: DealingStage;
	// community!: Card[];

	ngOnInit() {
		// this.community = DealerService.community;
	}
}
