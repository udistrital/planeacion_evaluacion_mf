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
  nombresPlanes: string[] = [];
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

  nombrePlanSeleccionado!: string;
  idPlanSeleccionado!: string;
  existenUnidades = false;
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

  onChangeP(plan :string) {
    this.bandera = false;
    if (plan == undefined) {
      this.planSelected = false;
    } else {
      this.planSelected = true;
      this.nombrePlanSeleccionado = plan;
      if (this.vigenciaSelected) {
        if( this.rol === 'PLANEACION' ) {
          this.unidadSelected = false;
          this.unidad = '';
          this.loadUnidades();
        } else {
          this.unidadSelected = true;
          this.onChangeU(this.unidades[0]);
        }
      }
      this.periodos = []
      this.periodoSelected = false
    }
  }

  onChangeV(vigencia:any) {
    this.bandera = false;
    if (vigencia == undefined) {
      this.vigenciaSelected = false;
    } else {
      this.vigenciaSelected = true;
      this.vigencia = vigencia;
      if (this.planSelected) {
        this.unidadSelected = false;
        this.unidad = ''
        if(this.rol === 'PLANEACION') {
          this.loadUnidades();
        } else {
          this.onChangeU(this.unidades[0]);
        }
      }
      this.periodos = [];
      this.periodoSelected = false;
    }
  }

  onChangeU(unidad:any) {
    this.bandera = false;
    this.periodos = [];
    this.periodoSelected = false;
    if (unidad == undefined) {
      this.unidadSelected = false;
      this.unidad = '';
    } else {
      this.unidadSelected = true;
      this.unidad = unidad
      this.periodos = []
      this.periodoSelected = false
      if (unidad === 'TODAS') {
        this.periodo = 'TODOS';
        this.periodoSelected = true;
        this.periodos = [
          { nombre: 'Trimestre uno'},
          { nombre: 'Trimestre dos'},
          { nombre: 'Trimestre tres'},
          { nombre: 'Trimestre cuatro'},
        ]
      } else {
        this.periodo = '';
        this.periodoSelected = false;
      }
      if(unidad !== 'TODAS' && this.planSelected && this.vigenciaSelected && this.unidadSelected) {
        this.loadPeriodos();
      }
    }
  }

  onChangePe(periodo:any) {
    this.bandera = false;
    if (periodo == undefined) {
      this.periodoSelected = false;
    } else {
      this.periodoSelected = true;
      this.periodo = periodo;
    }
  }

  getRol() {
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find((x: string) => x == 'JEFE_DEPENDENCIA' || x == 'ASISTENTE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA';
      this.validarUnidad();
    } else if (roles.__zone_symbol__value.find((x: string) => x == 'PLANEACION')) {
      this.rol = 'PLANEACION';
      this.loadPlanes();

    }
  }
  validarUnidad() {
    this.userService.user$.subscribe((data:any) => {
      this.request.get(environment.TERCEROS_SERVICE, `datos_identificacion/?query=Numero:` + data['userService']['documento'])
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

    })
  }

  ingresarEvaluacion() {
    this.bandera = true;
  }

  loadVigencias() {
    this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=CodigoAbreviacion:VG,activo:true`).subscribe((data: any) => {
      if (data) {
        this.vigencias = data.Data;
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se encontraron vigencias registradas`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      });
    });
  }
  /**
   * Carga las unidades que le hacen seguimiento al plan y vigencia seleccionados
   */
  loadUnidades() {
    Swal.fire({
      title: 'Cargando Unidades',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    this.request
      .get(environment.PLANEACION_EVALUACION_MID,`unidades/${this.nombrePlanSeleccionado}/${this.vigencia.Id}`)
      .subscribe(
        (data: any) => {
          if (data) {
            if (this.rol === 'PLANEACION') {
              if (data.data.length === 0) {
                Swal.close();
                this.unidades = [];
                this.existenUnidades = false;
                Swal.fire({
                  title: 'Verifica las selecciones',
                  text: `No existen unidades con registros en fase de seguimiento asociados al plan de acción y vigencia seleccionados`,
                  icon: 'warning',
                  showConfirmButton: true,
                });
              } else {
                this.unidades = data.data;
                this.existenUnidades = true;
                Swal.close();
              }
            }
          }
        },
        (error) => {
          Swal.close();
          this.unidades = [];
          this.vigenciaSelected = false;
          this.vigencia = '';
          Swal.fire({
            title: 'Verifica las selecciones',
            text: `No existen unidades con registros en fase de seguimiento asociados al plan de acción y vigencia seleccionados`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500,
          });
        }
      );
  }

  loadPlanes() {
    Swal.fire({
      title: 'Cargando planes',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    this.request.get(environment.PLANEACION_EVALUACION_MID, `planes`).subscribe((data: any) => {
      if (data) {
        if (data.data != null) {
          this.nombresPlanes = data.data;
          Swal.close();
        } else {
          Swal.fire({
            title: 'No se lograron obtener planes avalados para seguimiento',
            icon: 'info',
            showConfirmButton: false,
            timer: 2500
          });
          this.nombresPlanes = [];
          this.nombrePlanSeleccionado = "";
        }
      }
    }, (error) => {
      this.nombresPlanes = [];
      this.nombrePlanSeleccionado = "";
      Swal.fire({
        title: 'No se lograron obtener planes avalados para seguimiento',
        icon: 'info',
        showConfirmButton: false,
        timer: 2500
      });
    });
  }

  loadPeriodos(){
    Swal.fire({
      title: 'Cargando Periodos',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    this.request.get(environment.PLANEACION_EVALUACION_MID, `planes-periodo/` + this.vigencia.Id + `/` + this.unidad.Id).subscribe((data: any) => {
      if (data) {
        if (data.data != null) {
          let periodosCargados = false;
          for (let pos = 0; pos < data.data.length; pos++) {
            const elemento = data.data[pos];
            if(elemento["plan"] === this.nombrePlanSeleccionado) {
              this.idPlanSeleccionado = elemento["id"]
              this.periodos = elemento["periodos"]
              this.periodos.forEach((periodo)=>{
                periodo.nombre = periodo.nombre[0].toUpperCase() + periodo.nombre.substring(1).toLowerCase()
              })
              periodosCargados = true
            }
          }
          Swal.close();
          if(!periodosCargados){
            Swal.fire({
              title: 'El plan seleccionado no corresponde a la vigencia o unidad. Seleccione otro plan.',
              icon: 'info',
              showConfirmButton: false,
              timer: 2500
            });
          }
        } else {
          Swal.fire({
            title: 'La unidad no tiene planes con seguimientos avalados para la vigencia selecionada',
            icon: 'info',
            showConfirmButton: false,
            timer: 2500
          });
        }
      }
    }, (error) => {
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
  backClicked() {
    this.router.navigate(['#/pages/dashboard']);
  }
}