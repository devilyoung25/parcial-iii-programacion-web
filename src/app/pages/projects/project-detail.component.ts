import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, Inject, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize, forkJoin, map, of, switchMap } from 'rxjs';
import { AuthService } from '@core';
import { Usuario } from '@core/models/usuario';
import { ProjectsService, Proyecto } from 'app/services/projects/projects.service';
import { UsersService } from 'app/services/users/users.service';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-project-detail',
  standalone: true,
  imports: [DatePipe, MatDialogModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './project-detail.component.html',
})
export class ProjectDetailComponent implements OnInit {
  readonly isAdmin = inject(AuthService).getAuthFromSessionStorage()?.rol_id === 1;
  private readonly destroyRef = inject(DestroyRef);
  private readonly dialogRef = inject(MatDialogRef<ProjectDetailComponent>);
  proyecto?: Proyecto;
  usuarios: { usuario: Usuario; asignado: boolean }[] = [];
  loading = false;
  error = '';
  saving = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private readonly id: number,
    private readonly service: ProjectsService,
    private readonly usersService: UsersService,
  ) {}

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.loading = true;
    this.error = '';
    this.service.obtenerPorId(this.id).pipe(
      switchMap(proyecto => {
        this.proyecto = proyecto;
        return this.isAdmin ? this.usersService.getAllUserByAdministrator() : of([]);
      }),
      // shortcut: una consulta por usuario, agregar un endpoint por proyecto si la lista crece.
      switchMap(usuarios => usuarios.length ? forkJoin(usuarios.map(usuario =>
        this.service.porUsuario(usuario.id).pipe(map(proyectos => ({
          usuario, asignado: proyectos.some(proyecto => proyecto.id === this.id)
        })))
      )) : of([])),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: usuarios => {
        this.usuarios = usuarios;
        this.loading = false;
      },
      error: error => {
        this.loading = false;
        this.error = error.error?.error || 'No se pudo cargar el detalle.';
      },
    });
  }

  cambiarAsignacion(fila: { usuario: Usuario; asignado: boolean }): void {
    if (!this.isAdmin || this.saving) return;
    this.saving = true;
    this.dialogRef.disableClose = true;
    this.error = '';
    const request = fila.asignado
      ? this.service.retirar(this.id, fila.usuario.id)
      : this.service.asignar(this.id, fila.usuario.id);
    request.pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => {
        this.saving = false;
        this.dialogRef.disableClose = false;
      }),
    ).subscribe({
      next: () => {
        fila.asignado = !fila.asignado;
      },
      error: error => {
        this.error = error.error?.error || 'No se pudo actualizar la asignación. Reintenta la consulta.';
      },
    });
  }
}
