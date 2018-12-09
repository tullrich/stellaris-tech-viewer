import { TestBed } from '@angular/core/testing';

import { TechnologyLibraryService } from './technology-library.service';

describe('TechnologyLibraryService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TechnologyLibraryService = TestBed.get(TechnologyLibraryService);
    expect(service).toBeTruthy();
  });
});
