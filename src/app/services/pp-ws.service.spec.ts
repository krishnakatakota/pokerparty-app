import { TestBed } from '@angular/core/testing';

import { PpWsService } from './pp-ws.service';

describe('PpWsService', () => {
  let service: PpWsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PpWsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
