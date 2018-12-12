import { TestBed } from '@angular/core/testing';

import { WebCacheService } from './web-cache.service';

describe('WebCacheService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WebCacheService = TestBed.get(WebCacheService);
    expect(service).toBeTruthy();
  });
});
