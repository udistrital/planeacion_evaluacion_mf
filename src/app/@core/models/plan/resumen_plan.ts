export interface ResumenPlan {
  id?: string;
  dependencia_id: string;
  dependencia_nombre?: string;
  estado?: string;
  estado_id?: string;
  nombre: string;
  ultima_modificacion?: Date;
  version?: number;
  fase?: string;
  vigencia?: number;
  vigencia_id: string;
}
