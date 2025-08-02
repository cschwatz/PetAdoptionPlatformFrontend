import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OngEventsComponent } from './ong-events.component';

describe('OngEventsComponent', () => {
  let component: OngEventsComponent;
  let fixture: ComponentFixture<OngEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OngEventsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OngEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
