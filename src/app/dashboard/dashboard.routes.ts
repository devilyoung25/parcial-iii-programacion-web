import { Route } from '@angular/router';

export const DASHBOARD_ROUTE: Route[] = [
  { path: '', redirectTo: '/page/projects', pathMatch: 'full' },
  { path: 'main', redirectTo: '/page/projects', pathMatch: 'full' },
];
