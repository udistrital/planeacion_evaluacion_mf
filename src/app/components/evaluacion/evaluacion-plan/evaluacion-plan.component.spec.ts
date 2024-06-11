import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluacionPlanComponent } from './evaluacion-plan.component';

describe('EvaluacionPlanComponent', () => {
  let component: EvaluacionPlanComponent;
  let fixture: ComponentFixture<EvaluacionPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvaluacionPlanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluacionPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});