import { Route } from "@angular/router";
import { UsersComponent } from "./users/users.component";
import { AdminGuard } from "@core/guard/admin.guard";

import { ProjectsComponent } from "./projects/projects.component";

export const PAGES_ROUTE: Route[] = [
  { path: "projects", component: ProjectsComponent },
  {
    path: "users",
    component: UsersComponent,
    canActivate: [AdminGuard]
  },
]