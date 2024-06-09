import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-player-list',
  templateUrl: './player-list.component.html',
  styleUrl: './player-list.component.css'
})
export class PlayerListComponent {

	@Input() isHost: any;
	@Input() joinCode: any;
	@Input() playerList: any;
}
