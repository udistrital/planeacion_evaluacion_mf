import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TablaResumenEvaluacionComponent } from './tabla-resumen-evaluacion.component';

describe('TablaResumenEvaluacionComponent', () => {
  let component: TablaResumenEvaluacionComponent;
  let fixture: ComponentFixture<TablaResumenEvaluacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TablaResumenEvaluacionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TablaResumenEvaluacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});