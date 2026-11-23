import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { AuthService } from '@core';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { ProjectsService, Proyecto } from 'app/services/projects/projects.service';
import { ProjectFormComponent } from './project-form.component';
import { ProjectDetailComponent } from './project-detail.component';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-projects',
  standalone: true,
  imports: [
    DatePipe, BreadcrumbComponent, MatButtonModule, MatIconModule,
    MatPaginatorModule, MatTableModule, MatTooltipModule, MatProgressSpinnerModule,
  ],
  templateUrl: './projects.component.html',
})
export class ProjectsComponent implements OnInit {
  readonly isAdmin = inject(AuthService).getAuthFromSessionStorage()?.rol_id === 1;
  readonly title = this.isAdmin ? 'Gestión de proyectos' : 'Mis proyectos';
  readonly columns = ['nombre', 'descripcion', 'fecha', 'acciones'];
  readonly dataSource = new MatTableDataSource<Proyecto>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  private readonly destroyRef = inject(DestroyRef);
  loading = false;
  error = '';
  deleting = false;

  constructor(
    private readonly projectsService: ProjectsService,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.error = '';
    this.projectsService.listar().pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loading = false),
    ).subscribe({
      next: projects => {
        this.dataSource.data = projects;
        this.dataSource.paginator = this.paginator;
      },
      error: error => this.error = error.error?.error || 'No se pudieron cargar los proyectos.',
    });
  }

  formulario(proyecto?: Proyecto): void {
    if (!this.isAdmin) return;
    this.dialog.open(ProjectFormComponent, {
      width: '640px', maxWidth: '95vw', data: proyecto,
    }).afterClosed().subscribe(saved => {
      if (saved) this.cargar();
    });
  }

  detalle(proyecto: Proyecto): void {
    this.dialog.open(ProjectDetailComponent, {
      width: '840px', maxWidth: '95vw', data: proyecto.id,
    });
  }

  async eliminar(proyecto: Proyecto): Promise<void> {
    if (!this.isAdmin || this.deleting) return;
    const result = await Swal.fire({
      title: '¿Eliminar proyecto?',
      text: `Se eliminará "${proyecto.nombre}" y sus asignaciones.`,
      icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar',
    });
    if (!result.isConfirmed) return;
    this.deleting = true;
    this.projectsService.eliminar(proyecto.id).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.deleting = false),
    ).subscribe({
      next: () => {
        this.snackBar.open('Proyecto eliminado.', 'Cerrar', { duration: 5000 });
        this.cargar();
      },
      error: error => this.snackBar.open(
        error.error?.error || 'No se pudo eliminar el proyecto.', 'Cerrar', { duration: 5000 }
      ),
    });
  }
}
