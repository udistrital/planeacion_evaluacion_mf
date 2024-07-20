import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { RequestManager } from '../../../services/requestManager';
import { MatTable } from '@angular/material/table';
import { Color, ScaleType } from '@swimlane/ngx-charts';
import { assetUrl } from 'src/single-spa/asset-url';


type Dato = { id: string; nombre: string };
type NewType = MatTable<any>;

@Component({
  selector: 'app-evaluacion-plan',
  templateUrl: './evaluacion-plan.component.html',
  styleUrls: ['./evaluacion-plan.component.scss'],
})
export class EvaluacionPlanComponent implements OnInit {
  @Input() idVigencia!: string;
  @Input() plan!: Dato;
  @Input() periodo!: Dato;
  @Input() nombreUnidad!: string;
  @Input() mostrarGraficos!: boolean;

  coloresPngUrl = assetUrl("images/colores-avance-porcentaje.png");

  pieTitle = 'Cumplimiento general';
  showXAxisLabel = true;
  showYAxisLabel = this.nombreUnidad;
  xAxisLabel = 'Actividad';
  yAxisLabel = 'Avance';

  colorScheme: Color = {
    name: 'MyColorScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: []
  };


  colorSchemecircular: Color = {
    name: 'MyColorScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#466EFF', 'white']
  };

  pieChartData = [
    { name: 'Avance', value: 50 },
    { name: 'Restante', value: 50 }
  ];
  lineChartData = [
    { name: '', value: 0 }
  ];

  displayedColumns: string[] = [
    "id", "ponderacion", "actividad", "indicador", "formula", "meta",
    "numt1", "dent1", "pert1", "acut1", "metat1", "brecha1", "actividadt1",
    "numt2", "dent2", "pert2", "acut2", "metat2", "brecha2", "actividadt2",
    "numt3", "dent3", "pert3", "acut3", "metat3", "brecha3", "actividadt3",
    "numt4", "dent4", "pert4", "acut4", "metat4", "brecha4", "actividadt4",];

  displayedHeaders: string[] = [
    'idP',
    'ponderacionP',
    'actividadP',
    'indicadorP',
    'formulaP',
    'metaP',
    'trimestre1',
    'trimestre2',
    'trimestre3',
    'trimestre4',
  ];

  actividades: any;
  spans: any[] = [];

  tr2: boolean = true;
  tr3: boolean = true;
  tr4: boolean = true;
  avanceTr1 = 0;
  avanceTr2 = 0;
  avanceTr3 = 0;
  avanceTr4 = 0;

  @ViewChild(MatTable) table!: NewType;

  constructor(private request: RequestManager) { }

  ngAfterViewChecked(): void {
    if (this.table) {
      this.table.updateStickyColumnStyles();
    }
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    this.actividades = [];
    this.spans = [];
    this.request
      .get(environment.PLANEACION_EVALUACION_MID, `${this.idVigencia}/${this.plan.id}/${this.periodo.id}`).subscribe(
        (data: any) => {
          if (data) {
            this.actividades = data.Data;
            this.actividades.forEach((actividad: any) => {
              actividad.class = actividad.numero % 2 == 0 ? 'claro' : 'oscuro';
            });
            this.cacheSpan('numero', (d: any) => d.numero);
            this.cacheSpan('ponderado', (d: any) => d.numero + d.ponderado);
            this.cacheSpan(
              'periodo',
              (d: any) => d.numero + d.ponderado + d.periodo
            );
            this.cacheSpan(
              'actividad',
              (d: any) => d.numero + d.ponderado + d.periodo + d.actividad
            );
            this.cacheSpan(
              'actividadt1',
              (d: any) =>
                d.numero + d.ponderado + d.periodo + d.actividad + d.actividadt1
            );
            this.cacheSpan(
              'actividadt2',
              (d: any) =>
                d.numero +
                d.ponderado +
                d.periodo +
                d.actividad +
                d.actividadt1 +
                d.actividadt2
            );
            this.cacheSpan(
              'actividadt3',
              (d: any) =>
                d.numero +
                d.ponderado +
                d.periodo +
                d.actividad +
                d.actividadt1 +
                d.actividadt2 +
                d.actividadt3
            );
            this.cacheSpan(
              'actividadt4',
              (d: any) =>
                d.numero +
                d.ponderado +
                d.periodo +
                d.actividad +
                d.actividadt1 +
                d.actividadt2 +
                d.actividadt3 +
                d.actividadt4
            );

            if (this.periodo.nombre.toLowerCase() == 'trimestre dos') {
              this.tr2 = true;
              this.tr3 = false;
              this.tr4 = false;
            } else if (this.periodo.nombre.toLowerCase() == 'trimestre tres') {
              this.tr2 = true;
              this.tr3 = true;
              this.tr4 = false;
            } else if (this.periodo.nombre.toLowerCase() == 'trimestre cuatro') {
              this.tr2 = true;
              this.tr3 = true;
              this.tr4 = true;
            } else {
              this.tr2 = false;
              this.tr3 = false;
              this.tr4 = false;
            }
            this.calcularAvanceGeneral();
            if (this.mostrarGraficos) {
              this.graficarBarras();
              this.graficarCircular();
            }
            Swal.close();
          }
        },
        (error: any) => {
          Swal.fire({
            title: 'Error en la operación',
            text: `No se encontraron datos registrados`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500,
          });
        }
      );
  }

  cacheSpan(key: any, accessor: any) {
    for (let i = 0; i < this.actividades.length;) {
      let currentValue = accessor(this.actividades[i]);
      let count = 1;

      for (let j = i + 1; j < this.actividades.length; j++) {
        if (currentValue != accessor(this.actividades[j])) {
          break;
        }
        count++;
      }

      if (!this.spans[i]) {
        this.spans[i] = {};
      }

      this.spans[i][key] = count;
      i += count;
    }
  }

  getRowSpan(col: any, index: any) {
    return this.spans[index] && this.spans[index][col];
  }

  calcularAvanceGeneral() {
    let numero = 0;
    this.avanceTr1 = 0;
    this.avanceTr2 = 0;
    this.avanceTr3 = 0;
    this.avanceTr4 = 0;

    for (let index = 0; index < this.actividades.length; index++) {
      const actividad = this.actividades[index];
      if (numero != actividad.numero) {
        numero = actividad.numero;
      } else {
        continue;
      }

      if (actividad.trimestre1.actividad) {
        this.avanceTr1 +=
          (actividad.ponderado / 100) *
          (actividad.trimestre1.actividad <= 1
            ? actividad.trimestre1.actividad
            : 1);
      }

      if (actividad.trimestre2.actividad) {
        this.avanceTr2 +=
          (actividad.ponderado / 100) *
          (actividad.trimestre2.actividad <= 1
            ? actividad.trimestre2.actividad
            : 1);
      }

      if (actividad.trimestre3.actividad) {
        this.avanceTr3 +=
          (actividad.ponderado / 100) *
          (actividad.trimestre3.actividad <= 1
            ? actividad.trimestre3.actividad
            : 1);
      }

      if (actividad.trimestre4.actividad) {
        this.avanceTr4 +=
          (actividad.ponderado / 100) *
          (actividad.trimestre4.actividad <= 1
            ? actividad.trimestre4.actividad
            : 1);
      }
    }
  }

  graficarBarras() {
    let numero = 0;
    let actividades: any[] = [];

    for (let index = 0; index < this.actividades.length; index++) {
      const actividad = this.actividades[index];
      if (numero != actividad.numero) {
        numero = actividad.numero;
      } else {
        continue;
      }

      let actividadValor = 0;
      if (this.avanceTr4) {
        actividadValor =
          Math.round(actividad.trimestre4.actividad * 100 * 100) / 100;
      } else if (this.avanceTr3) {
        actividadValor =
          Math.round(actividad.trimestre3.actividad * 100 * 100) / 100;
      } else if (this.avanceTr2) {
        actividadValor =
          Math.round(actividad.trimestre2.actividad * 100 * 100) / 100;
      } else if (this.avanceTr1) {
        actividadValor =
          Math.round(actividad.trimestre1.actividad * 100 * 100) / 100;
      }

      // Colores barras según porcentaje
      if (actividadValor <= 20) {
        this.colorScheme.domain.push('#c50820');
      } else if (actividadValor > 20 && actividadValor <= 40) {
        this.colorScheme.domain.push('#faa99c');
      } else if (actividadValor > 40 && actividadValor <= 60) {
        this.colorScheme.domain.push('#fac11d');
      } else if (actividadValor > 60 && actividadValor <= 80) {
        this.colorScheme.domain.push('#fdff21');
      } else {
        this.colorScheme.domain.push('#73af49');
      }

      actividades.push({
        name: actividad.actividad,
        value: actividadValor
      });
    }
    this.lineChartData = actividades;
  }

  graficarCircular() {
    let avance = 0;
    if (this.tr4) {
      avance = this.avanceTr4;
    } else if (this.tr3) {
      avance = this.avanceTr3;
    } else if (this.tr2) {
      avance = this.avanceTr2;
    } else {
      avance = this.avanceTr1;
    }

    this.pieChartData = [
      { name: 'Avance', value: avance * 100 },
      { name: 'Restante', value: 100 - avance * 100 }
    ];
  }

  abs(value: number): number {
    return Math.abs(value);
  }

  getBackgroundColor(actividad: number): string {
    if (actividad >= 0 && actividad <= 0.2) {
      return '#c71a1b';
    } else if (actividad >= 0.201 && actividad <= 0.40) {
      return '#ffa99e'; // color piel
    } else if (actividad >= 0.401 && actividad <= 0.60) {
      return '#fdc100';
    } else if (actividad >= 0.601 && actividad <= 0.80) {
      return '#fffe00';
    } else if (actividad >= 0.801) {
      return '#72ac41';
    } else {
      return 'transparent'; // default or no color
    }
  }

}
