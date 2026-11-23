import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { JwtInterceptor } from '../interceptor/jwt.interceptor';
import { ErrorInterceptor } from '../interceptor/error.interceptor';
import { UsersService } from 'app/services/users/users.service';
import { URL_SERVICIOS } from '@core/models/config';

describe('Sesión con la API del parcial II', () => {
  let auth: AuthService;
  let http: HttpTestingController;
  let users: UsersService;
  const router = jasmine.createSpyObj('Router', ['navigate']);
  const usuario = {
    id: 1, nombre: 'Ana', email: 'ana@example.test', rol_id: 1,
    administrador_id: null, rol: 'Administrador', permisos: ['VISUALIZAR'],
  };

  function token(exp: number): string {
    return btoa('{}') + '.' + btoa(JSON.stringify({ sub: '1', exp })) + '.firma';
  }

  beforeEach(() => {
    sessionStorage.clear();
    router.navigate.calls.reset();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting(),
        { provide: Router, useValue: router },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
      ],
    });
    auth = TestBed.inject(AuthService);
    users = TestBed.inject(UsersService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  it('lee el rol desde usuario aunque el JWT solo tenga sub y exp', () => {
    auth.login('ana@example.test', 'password').subscribe();
    http.expectOne(URL_SERVICIOS + '/api/auth/login').flush({
      token: token(Date.now() / 1000 + 60), usuario,
    });
    expect(auth.isAuthenticated()).toBeTrue();
    expect(auth.isAdminLogged()).toBeTrue();
    expect(auth.getAuthFromSessionStorage()?.nombre).toBe('Ana');
  });

  it('rechaza una sesión vencida o datos guardados incompletos', () => {
    sessionStorage.setItem('currentUser', JSON.stringify(usuario));
    sessionStorage.setItem('accessToken', token(Date.now() / 1000 - 60));
    expect(auth.isAuthenticated()).toBeFalse();
    sessionStorage.setItem('currentUser', '{');
    expect(auth.getAuthFromSessionStorage()).toBeNull();
  });

  it('borra la sesión completa al cerrar', () => {
    sessionStorage.setItem('accessToken', 'anterior');
    sessionStorage.setItem('token', 'anterior');
    sessionStorage.setItem('currentUser', JSON.stringify(usuario));
    auth.logout();
    expect(sessionStorage.getItem('accessToken')).toBeNull();
    expect(sessionStorage.getItem('token')).toBeNull();
    expect(auth.getAuthFromSessionStorage()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/authentication/signin']);
  });

  it('envía el Bearer y recibe directamente el arreglo de usuarios', () => {
    sessionStorage.setItem('accessToken', 'token-de-prueba');
    users.getAllUserByAdministrator().subscribe(result => expect(result).toEqual([usuario]));
    const request = http.expectOne(URL_SERVICIOS + '/api/users');
    expect(request.request.headers.get('Authorization')).toBe('Bearer token-de-prueba');
    expect(request.request.params.keys()).toEqual([]);
    request.flush([usuario]);
  });

  it('acepta la respuesta vacía del DELETE', () => {
    let completed = false;
    users.deleteUser(2).subscribe(() => completed = true);
    http.expectOne(URL_SERVICIOS + '/api/users/2').flush(null, { status: 204, statusText: 'No Content' });
    expect(completed).toBeTrue();
  });

  it('limpia la sesión cuando la API rechaza un token', () => {
    sessionStorage.setItem('accessToken', 'vencido');
    users.getAllUserByAdministrator().subscribe({ error: () => {} });
    http.expectOne(URL_SERVICIOS + '/api/users').flush(
      { error: 'Token inválido o vencido' }, { status: 401, statusText: 'Unauthorized' }
    );
    expect(sessionStorage.getItem('accessToken')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/authentication/signin']);
  });
});
