import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyAnimalsComponent } from './my-animals.component';

describe('MyAnimalsComponent', () => {
  let component: MyAnimalsComponent;
  let fixture: ComponentFixture<MyAnimalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyAnimalsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MyAnimalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
