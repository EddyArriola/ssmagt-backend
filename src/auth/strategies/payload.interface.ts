export interface PayLoadInterface {
  sub: number;               // id del usuario (claim estándar)
  id?: number;               // opcional, si tu token incluye 'id'
  nombre?: string;
  cui: string;
  email?: string;
  roles?: number | string[]; // acepta id_rol (number) o array de roles (string[])
  instituto?: number;        // nuevo campo: id del instituto del usuario
  iat?: number;              // issued at (opcional)
  exp?: number;              // expiration (opcional)
}