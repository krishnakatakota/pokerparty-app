import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { PlayerComponent } from './player/player.component';
import { CommunityComponent } from './community/community.component';
import { CardComponent } from './card/card.component';
import { HostComponent } from './host/host.component';
import { UserComponent } from './user/user.component';
import { LobbyJoinScreenComponent } from './lobby-join-screen/lobby-join-screen.component';
import { PlayerListComponent } from './player-list/player-list.component';
import { JoinLobbyComponent } from './join-lobby/join-lobby.component';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    PlayerComponent,
    CommunityComponent,
    CardComponent,
    HostComponent,
    UserComponent,
    LobbyJoinScreenComponent,
    PlayerListComponent,
    JoinLobbyComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
	ButtonModule,
	CardModule,
	PanelModule,
	TableModule,
	InputTextModule,
	FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
