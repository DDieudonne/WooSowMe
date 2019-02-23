import { TestBed, inject } from '@angular/core/testing';

import { ToastManagerService } from './toast-manager.service';

describe('ToastManagerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ToastManagerService]
    });
  });

  it('should be created', inject([ToastManagerService], (service: ToastManagerService) => {
    expect(service).toBeTruthy();
  }));
});
