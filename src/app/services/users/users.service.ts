import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { URL_SERVICIOS } from '@core/models/config';
import { CrearUsuario, EditarUsuario, Usuario } from '@core/models/usuario';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private readonly url = `${URL_SERVICIOS}/api/users`;

  constructor(private readonly http: HttpClient) {}

  createUser(data: CrearUsuario): Observable<Usuario> {
    return this.http.post<Usuario>(this.url, data);
  }

  updateUser(id: number, data: EditarUsuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.url}/${id}`, data);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  getAllUserByAdministrator(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.url);
  }
}
