import { Component, Output, EventEmitter } from '@angular/core';
import { Player } from '../objects/player';

@Component({
  selector: 'app-join-lobby',
  templateUrl: './join-lobby.component.html',
  styleUrl: './join-lobby.component.css'
})
export class JoinLobbyComponent {

	@Output() newPlayerEvent = new EventEmitter<Player>();
	
	playerName: string = "";
	playerJoinCode: string = "";

	sendPlayer() {
		const player: Player = {
			id: 0,
			name: this.playerName,
			hand: [],
			turnNumber: Number.MAX_VALUE,
			status: 'requesting-join',
			joinCode: this.playerJoinCode
		}

		this.newPlayerEvent.emit(player);
	}
}
