export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol_id: number;
  administrador_id: number | null;
}

export interface UsuarioSesion extends Usuario {
  rol: string;
  permisos: string[];
}

export interface RespuestaLogin {
  token: string;
  usuario: UsuarioSesion;
}

export type CrearUsuario = Pick<Usuario, 'nombre' | 'email'> & { password: string };
export type EditarUsuario = Pick<Usuario, 'nombre' | 'email'>;
