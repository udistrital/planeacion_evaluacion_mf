import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes, provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { getSingleSpaExtraProviders } from 'single-spa-angular';
import { EvaluacionComponent } from './components/evaluacion/evaluacion.component';

const routes: Routes = [
  {
    path: '',
    component: EvaluacionComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    provideRouter(routes),
    { provide: APP_BASE_HREF, useValue: '/evaluacion/' },
    getSingleSpaExtraProviders(),
    provideHttpClient(withFetch()) ]
})
export class AppRoutingModule { }