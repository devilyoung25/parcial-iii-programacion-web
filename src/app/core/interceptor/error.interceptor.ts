import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '../service/auth.service';
import { URL_SERVICIOS } from '@core/models/config';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private readonly authService: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(catchError(error => {
      if (error.status === 401 && req.url.startsWith(`${URL_SERVICIOS}/api/`) &&
          !req.url.endsWith('/auth/login')) {
        this.authService.logout();
      }
      return throwError(() => error);
    }));
  }
}
