import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OngComponent } from './ong.component';

describe('OngComponent', () => {
  let component: OngComponent;
  let fixture: ComponentFixture<OngComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OngComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OngComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
