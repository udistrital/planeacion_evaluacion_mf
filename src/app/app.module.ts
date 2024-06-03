import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { EvaluacionComponent } from './components/evaluacion/evaluacion.component';
import { EvaluacionPlanComponent } from './components/evaluacion/evaluacion-plan/evaluacion-plan.component';
import { TablaResumenEvaluacionComponent } from './components/evaluacion/tabla-resumen-evaluacion/tabla-resumen-evaluacion.component';
import { ResumenComponent } from './components/evaluacion/resumen/resumen.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [AppComponent, EvaluacionComponent ,EvaluacionPlanComponent , TablaResumenEvaluacionComponent, ResumenComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatSelectModule,
    BrowserAnimationsModule,
    NgxChartsModule,
    CommonModule,
  ],
  exports: [
    EvaluacionPlanComponent
  ],
  providers: [],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // Añadir esto
  
})
export class AppModule {}
