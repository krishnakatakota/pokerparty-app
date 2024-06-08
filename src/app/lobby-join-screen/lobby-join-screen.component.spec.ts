import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LobbyJoinScreenComponent } from './lobby-join-screen.component';

describe('LobbyJoinScreenComponent', () => {
  let component: LobbyJoinScreenComponent;
  let fixture: ComponentFixture<LobbyJoinScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LobbyJoinScreenComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LobbyJoinScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
