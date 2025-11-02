export class CreateSolicitudTarjetaDto {
  id_medico?: number;
  fecha_solicitud?: Date; // opcional porque el esquema tiene default CURRENT_DATE
  id_centro_de_salud?: number;
  id_ciudadano?: number;
  tipo_tarjeta?: number;
  estado?: number; // opcional porque el esquema tiene default 1
  observaciones?: string;
  fecha_capacitacion?: Date;
  examen_medico?: string; // cambiar 'ruta_examen' por 'examen_medico'
  area?: string; // agregar este campo que existe en el esquema
}
