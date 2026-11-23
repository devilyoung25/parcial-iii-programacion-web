import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { ProjectsService, Proyecto } from 'app/services/projects/projects.service';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-project-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './project-form.component.html',
})
export class ProjectFormComponent {
  readonly form = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [
      Validators.required, Validators.pattern(/\S/), Validators.maxLength(120)
    ] }),
    descripcion: new FormControl('', { nonNullable: true }),
  });
  saving = false;
  error = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly proyecto: Proyecto | undefined,
    private readonly service: ProjectsService,
    private readonly dialogRef: MatDialogRef<ProjectFormComponent>,
    private readonly snackBar: MatSnackBar,
  ) {
    if (proyecto) {
      this.form.setValue({ nombre: proyecto.nombre, descripcion: proyecto.descripcion || '' });
    }
  }

  guardar(): void {
    if (this.saving) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const { nombre, descripcion } = this.form.getRawValue();
    const datos = { nombre: nombre.trim(), descripcion: descripcion.trim() || null };
    const request = this.proyecto
      ? this.service.actualizar(this.proyecto.id, datos)
      : this.service.crear(datos);
    this.saving = true;
    this.error = '';
    this.dialogRef.disableClose = true;
    request.pipe(finalize(() => {
      this.saving = false;
      this.dialogRef.disableClose = false;
    })).subscribe({
      next: () => {
        this.snackBar.open('Proyecto guardado.', 'Cerrar', { duration: 5000 });
        this.dialogRef.close(true);
      },
      error: error => this.error = error.error?.error || 'No se pudo guardar el proyecto.',
    });
  }
}
