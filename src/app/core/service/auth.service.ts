import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { URL_SERVICIOS } from '@core/models/config';
import { RespuestaLogin, UsuarioSesion } from '@core/models/usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private readonly http: HttpClient, private readonly router: Router) {}

  isAuthenticated(): boolean {
    const token = this.getTokenFromSessionStorage();
    if (!token || !this.getAuthFromSessionStorage()) return false;
    try {
      const { exp, sub } = jwtDecode(token);
      return typeof exp === 'number' && exp * 1000 > Date.now() &&
        sub === String(this.getAuthFromSessionStorage()?.id);
    } catch {
      return false;
    }
  }

  getAuthFromSessionStorage(): UsuarioSesion | null {
    try {
      const user: UsuarioSesion | null = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
      if (!user || !Number.isInteger(user.id) || typeof user.nombre !== 'string' ||
          ![1, 2].includes(user.rol_id) || !Array.isArray(user.permisos)) return null;
      return user;
    } catch {
      return null;
    }
  }

  getRoleInfo(): { roleId: number; roleName: string } | undefined {
    const user = this.getAuthFromSessionStorage();
    return user ? { roleId: user.rol_id, roleName: user.rol } : undefined;
  }

  logout(): void {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('token');
    void this.router.navigate(['/authentication/signin']);
  }

  getTokenFromSessionStorage(): string | null {
    return sessionStorage.getItem('accessToken');
  }

  login(email: string, password: string): Observable<RespuestaLogin> {
    return this.http.post<RespuestaLogin>(`${URL_SERVICIOS}/api/auth/login`, {
      email: email.trim(), password
    }).pipe(tap(response => {
      sessionStorage.setItem('accessToken', response.token);
      sessionStorage.setItem('currentUser', JSON.stringify(response.usuario));
    }));
  }

  isAdminLogged(): boolean {
    return this.getAuthFromSessionStorage()?.rol_id === 1;
  }
}
