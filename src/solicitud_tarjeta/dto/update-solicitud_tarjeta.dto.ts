export class UpdateSolicitudTarjetaDto {
  id_medico?: number;
  fecha_solicitud?: Date;
  id_centro_de_salud?: number;
  id_ciudadano?: number;
  tipo_tarjeta?: number;
  estado?: number;
  observaciones?: string;
  fecha_capacitacion?: Date;
  ruta_examen?: string;
}
