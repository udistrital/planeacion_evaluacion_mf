import { Component, Input, OnInit } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-tabla-resumen-evaluacion',
  templateUrl: './tabla-resumen-evaluacion.component.html',
  styleUrls: ['./tabla-resumen-evaluacion.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TablaResumenEvaluacionComponent {
  @Input() dataSource: any[] = [];
  columnsToDisplay = [
    'Unidad Academico/Administrativa',
    'Trimestre 1',
    'Trimestre 2',
    'Trimestre 3',
    'Trimestre 4',
    'General',
  ];
  equivalentesAColumnas:any = {
    'Unidad Academico/Administrativa': 'nombreUnidad',
    'Trimestre 1': 'avanceTr1',
    'Trimestre 2': 'avanceTr2',
    'Trimestre 3': 'avanceTr3',
    'Trimestre 4': 'avanceTr4',
    'General': 'avanceGeneral',
  };
  expandedElement: any | null;
}