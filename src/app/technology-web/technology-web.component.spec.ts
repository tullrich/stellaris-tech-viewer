import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnologyWebComponent } from './technology-web.component';

describe('TechnologyWebComponent', () => {
  let component: TechnologyWebComponent;
  let fixture: ComponentFixture<TechnologyWebComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TechnologyWebComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TechnologyWebComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
