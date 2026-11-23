import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core';

@Injectable({ providedIn: 'root' })
export class AdminGuard {
  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  canActivate() {
    return this.authService.isAdminLogged() ||
      this.router.createUrlTree(['/authentication/page404']);
  }
}
