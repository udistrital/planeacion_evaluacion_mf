import { Component, OnInit, ViewChild } from '@angular/core';
import { RequestManager } from '../../services/requestManager';
import { environment } from 'src/environments/environment';
import { MatTable } from '@angular/material/table';
import Swal from 'sweetalert2';
import { UserService } from '../../services/userService';
import { ImplicitAutenticationService } from '../../services/implicit_autentication.service';
import { Router } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import es from '@angular/common/locales/es';
import { Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-evaluacion',
  templateUrl: './evaluacion.component.html',
  styleUrls: ['./evaluacion.component.scss']
})
export class EvaluacionComponent implements OnInit {
  displayedColumns: string[] = [
    "id", "ponderacion", "actividad", "indicador", "formula", "meta",
    "numt1", "dent1", "pert1", "acut1", "metat1", "brecha1", "actividadt1",
    "numt2", "dent2", "pert2", "acut2", "metat2", "brecha2", "actividadt2",
    "numt3", "dent3", "pert3", "acut3", "metat3", "brecha3", "actividadt3",
    "numt4", "dent4", "pert4", "acut4", "metat4", "brecha4", "actividadt4"
  ];

  displayedHeaders: string[] = [
    "idP", "ponderacionP", "actividadP", "indicadorP", "formulaP", "metaP",
    "trimestre1", "trimestre2", "trimestre3", "trimestre4"
  ];

  planes: any[] = [];
  periodos: any[] = [];
  bandera: boolean = false;
  vigencias: any[] = [];
  unidades: any[] = [];
  unidadSelected: boolean;
  unidad: any;
  vigenciaSelected: boolean;
  vigencia: any;
  periodoSelected: boolean = false;
  periodo: any;
  planSelected: boolean = false;
  tr2: boolean = true;
  tr3: boolean = true;
  tr4: boolean = true;
  actividades: any
  rol: string = "";
  plan: { periodos: { nombre: string }[], plan: string, id: string } = {
    "periodos": [],
    "plan": "",
    "id": ""
  };
  avanceTr1 = 0;
  avanceTr2 = 0;
  avanceTr3 = 0;
  avanceTr4 = 0;

  spans: { [key: string]: number }[] = [];

  // Opciones para gráfico "pie chart"
  pieTitle = 'Cumplimiento general Plan de Acción -';
  pieChartData = [{name: '', value: 75},{name: '', value: 25}];
  pieChartColor: Color = {
    name: 'customScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#3366CC', '#e1e4eb']
  };

  // Opciones para gráfico "vertical bar chart"
  barChartData = [{name: '', value: 0}];
  barChartColor: Color = {
    name: 'customScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#8F1B00']
  };

  @ViewChild(MatTable) table!: MatTable<any>;

  constructor(
    private request: RequestManager,  
    private autenticationService: ImplicitAutenticationService, 
    private userService: UserService, 
    private router: Router
  ) {
    this.loadVigencias();
    this.unidadSelected = false;
    this.vigenciaSelected = false;
  }

  ngAfterViewChecked(): void {
    if (this.table) {
      this.table.updateStickyColumnStyles();
    }
  }

  onChangeU(unidad: any) {
    if (unidad == undefined) {
      this.unidadSelected = false;
    } else {
      this.unidadSelected = true;
      this.unidad = unidad;
      if (this.vigenciaSelected) {
        this.loadPlanes();
      }
    }
  }

  onChangeV(vigencia: any) {
    if (vigencia == undefined) {
      this.vigenciaSelected = false;
    } else {
      this.vigenciaSelected = true;
      this.vigencia = vigencia;
      if (this.unidadSelected) {
        this.loadPlanes();
      }
    }
  }

  onChangeP(plan: any) {
    if (plan == undefined) {
      this.planSelected = false;
    } else {
      this.planSelected = true;
      plan.periodos.forEach((periodo: any) => {
        periodo.nombre = periodo.nombre[0].toUpperCase() + periodo.nombre.substring(1).toLowerCase()
      })
      this.plan = plan;
    }
  }

  onChangePe(periodo: any) {
    if (periodo == undefined) {
      this.periodoSelected = false;
    } else {
      this.periodoSelected = true;
      this.periodo = periodo;
    }
  }

  backClicked() {
    this.router.navigate(['pages/dashboard']);
  }

  getRol() {
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find((x: any) => x == 'JEFE_DEPENDENCIA' || x == 'ASISTENTE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA';
      this.validarUnidad();
    } else if (roles.__zone_symbol__value.find((x: any) => x == 'PLANEACION')) {
      this.rol = 'PLANEACION';
      this.loadUnidades();
    }
  }

  // Agregar color al Cumplimiento por Meta
  colorCM(rowTrimestreMeta: number): string {
    if (rowTrimestreMeta >= 0 && rowTrimestreMeta <= 0.2) {
      return 'meta-rojo'; 
    } else if (rowTrimestreMeta <= 0.4) {
      return 'meta-piel';
    } else if (rowTrimestreMeta <= 0.6) {
      return 'meta-naranja';
    } else if (rowTrimestreMeta <= 0.8) {
      return 'meta-amarillo';
    } else {
      return 'meta-verde';
    }
  }

  validarUnidad() {
    var documento: any = this.autenticationService.getDocument();
    this.request.get(environment.TERCEROS_SERVICE, `datos_identificacion/?query=Numero:` + documento.__zone_symbol__value)
      .subscribe((datosInfoTercero: any) => {
        this.request.get(environment.PLANES_MID, `formulacion/vinculacion_tercero/` + datosInfoTercero[0].TerceroId.Id)
          .subscribe((vinculacion: any) => { 
            if (vinculacion["Data"] != "") {
              this.request.get(environment.OIKOS_SERVICE, `dependencia_tipo_dependencia?query=DependenciaId:` + vinculacion["Data"]["DependenciaId"]).subscribe((dataUnidad: any) => {
                if (dataUnidad) {
                  let unidad = dataUnidad[0]["DependenciaId"]
                  unidad["TipoDependencia"] = dataUnidad[0]["TipoDependenciaId"]["Id"]
                  for (let i = 0; i < dataUnidad.length; i++) {
                    if (dataUnidad[i]["TipoDependenciaId"]["Id"] === 2) {
                      unidad["TipoDependencia"] = dataUnidad[i]["TipoDependenciaId"]["Id"]
                    }
                  }
                  this.unidades = [unidad];
                  this.onChangeU(unidad);
                  Swal.close();
                }
              })
            } else {
              Swal.fire({
                title: 'Error en la operación',
                text: `No cuenta con los permisos requeridos para acceder a este módulo`,
                icon: 'warning',
                showConfirmButton: false,
                timer: 4000
              })
            }
          })
      })
  }

  ingresarEvaluacion() {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    this.bandera = true;
    this.actividades = [];
    this.spans = [];
    this.request.get(environment.PLANES_MID, `evaluacion/` + this.vigencia.Id + `/` + this.plan.id + `/` + this.periodo.id).subscribe((data: any) => {
      if (data) {
        this.actividades = data.Data;
        this.actividades.forEach((actividad: any) => {
          actividad.class = actividad.numero % 2 == 0 ? "claro" : "oscuro";
        });
        this.pieTitle = "Cumplimiento general " + this.plan.plan + " - " + this.unidad.Nombre;
        this.cacheSpan('numero', (d: any) => d.numero);
        this.cacheSpan('ponderado', (d: any) => d.numero + d.ponderado);
        this.cacheSpan('periodo', (d: any) => d.numero + d.ponderado + d.periodo);
        this.cacheSpan('actividad', (d: any) => d.numero + d.ponderado + d.periodo + d.actividad);
        this.cacheSpan('actividadt1', (d: any) => d.numero + d.ponderado + d.periodo + d.actividad + d.actividadt1);
        this.cacheSpan('actividadt2', (d: any) => d.numero + d.ponderado + d.periodo + d.actividad + d.actividadt1 + d.actividadt2);
        this.cacheSpan('actividadt3', (d: any) => d.numero + d.ponderado + d.periodo + d.actividad + d.actividadt1 + d.actividadt2 + d.actividadt3);
        this.cacheSpan('actividadt4', (d: any) => d.numero + d.ponderado + d.periodo + d.actividad + d.actividadt1 + d.actividadt2 + d.actividadt3 + d.actividadt4);

        if (this.periodo.nombre == "Trimestre dos") {
          this.tr2 = true;
          this.tr3 = false;
          this.tr4 = false;
        } else if (this.periodo.nombre == "Trimestre tres") {
          this.tr2 = true;
          this.tr3 = true;
          this.tr4 = false;
        } else if (this.periodo.nombre == "Trimestre cuatro") {
          this.tr2 = true;
          this.tr3 = true;
          this.tr4 = true;
        } else {
          this.tr2 = false;
          this.tr3 = false;
          this.tr4 = false;
        }
        this.calcularAvanceGeneral();
        this.graficarBarras();
        this.graficarCircular();
        Swal.close();
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      });
    })
  }

  resetVariables = () => {
    this.bandera = false;
    this.periodoSelected = false;
    this.planes = [];
    this.plan = { "periodos": [], "plan": "", "id": "" };
    this.tr2 = false;
    this.tr3 = false;
    this.tr4 = false;
  };

  loadVigencias() {
    this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=CodigoAbreviacion:VG,activo:true`).subscribe((data: any) => {
      if (data) {
        this.vigencias = data.Data;
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      });
    });
  }

  loadPeriodo() {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    this.request.get(environment.PLANES_MID, `seguimiento/get_periodos/` + this.vigencia.Id).subscribe((data: any) => {
      if (data) {
        this.periodos = data.Data;
      }
    }, (error) => {
      this.resetVariables();
      Swal.fire({
        title: 'Error en la operación',
        text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      });
    });
  }

  loadUnidades() {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    this.request.get(environment.PLANES_MID, `formulacion/get_unidades`).subscribe((data: any) => {
      if (data) {
        this.unidades = data.Data;
        Swal.close();
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      });
    });
  }

  loadPlanes() {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    this.request.get(environment.PLANES_MID, `evaluacion/planes_periodo/` + this.vigencia.Id + `/` + this.unidad.Id).subscribe((data: any) => {
      if (data) {
        if (data.Data != null) {
          this.planes = data.Data;
          Swal.close();
        } else {
          this.resetVariables();
          Swal.fire({
            title: 'La unidad no tiene planes con seguimientos avalados para la vigencia selecionada',
            icon: 'info',
            showConfirmButton: false,
            timer: 2500
          });
        }
      }
    }, (error) => {
      this.resetVariables();
      Swal.fire({
        title: 'La unidad no tiene planes con seguimientos avalados para la vigencia selecionada',
        icon: 'info',
        showConfirmButton: false,
        timer: 2500
      });
    });
  }

  ngOnInit(): void {
    registerLocaleData(es);
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    this.getRol();
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
        this.avanceTr1 += actividad.ponderado / 100 * (actividad.trimestre1.actividad <= 1 ? actividad.trimestre1.actividad : 1);
      }
      if (actividad.trimestre2.actividad) {
        this.avanceTr2 += actividad.ponderado / 100 * (actividad.trimestre2.actividad <= 1 ? actividad.trimestre2.actividad : 1);
      }
      if (actividad.trimestre3.actividad) {
        this.avanceTr3 += actividad.ponderado / 100 * (actividad.trimestre3.actividad <= 1 ? actividad.trimestre3.actividad : 1);
      }
      if (actividad.trimestre4.actividad) {
        this.avanceTr4 += actividad.ponderado / 100 * (actividad.trimestre4.actividad <= 1 ? actividad.trimestre4.actividad : 1);
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

      let actividadValor
      if (this.avanceTr4) {
        actividadValor = Math.round((actividad.trimestre4.actividad * 100) * 100) / 100
      } else if (this.avanceTr3) {
        actividadValor = Math.round((actividad.trimestre3.actividad * 100) * 100) / 100
      } else if (this.avanceTr2) {
        actividadValor = Math.round((actividad.trimestre2.actividad * 100) * 100) / 100
      } else if (this.avanceTr1) {
        actividadValor = Math.round((actividad.trimestre1.actividad * 100) * 100) / 100
      }
      actividades.push({name: actividad.actividad, value: actividadValor})
    }
    this.barChartData = actividades;
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
      {"name": "Avance", "value": avance * 100},
      {"name": "Restante","value": 100 - avance * 100}
    ];
  }
}
