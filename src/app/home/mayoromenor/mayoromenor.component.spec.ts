import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MayoromenorComponent } from './mayoromenor.component';

describe('MayoromenorComponent', () => {
  let component: MayoromenorComponent;
  let fixture: ComponentFixture<MayoromenorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MayoromenorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MayoromenorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
