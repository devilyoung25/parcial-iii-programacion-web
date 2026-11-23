import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_SERVICIOS } from '@core/models/config';

export interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string | null;
  fecha_creacion: string;
  administrador_id: number;
}

export type DatosProyecto = Pick<Proyecto, 'nombre' | 'descripcion'>;

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly url = `${URL_SERVICIOS}/api/projects`;

  constructor(private readonly http: HttpClient) {}

  listar(): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(this.url);
  }

  obtenerPorId(id: number): Observable<Proyecto> {
    return this.http.get<Proyecto>(`${this.url}/${id}`);
  }

  crear(datos: DatosProyecto): Observable<Proyecto> {
    return this.http.post<Proyecto>(this.url, datos);
  }

  actualizar(id: number, datos: DatosProyecto): Observable<Proyecto> {
    return this.http.put<Proyecto>(`${this.url}/${id}`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  porUsuario(userId: number): Observable<Proyecto[]> {
    return this.http.get<Proyecto[]>(`${URL_SERVICIOS}/api/users/${userId}/projects`);
  }

  asignar(id: number, userId: number): Observable<unknown> {
    return this.http.post(`${this.url}/${id}/users`, { userId });
  }

  retirar(id: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}/users/${userId}`);
  }
}
