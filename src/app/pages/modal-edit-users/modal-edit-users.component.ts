import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { Usuario } from '@core/models/usuario';
import { UsersService } from 'app/services/users/users.service';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-modal-edit-users',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './modal-edit-users.component.html',
  styleUrl: './modal-edit-users.component.scss'
})
export class ModalEditUsersComponent {
  readonly formUpdateUsers = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [
      Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)
    ] }),
    email: new FormControl('', { nonNullable: true, validators: [
      Validators.required, Validators.email, Validators.maxLength(150)
    ] }),
  });
  saving = false;
  error = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) readonly data: { user: Usuario },
    private readonly userService: UsersService,
    private readonly dialogRef: MatDialogRef<ModalEditUsersComponent>,
    private readonly snackBar: MatSnackBar,
  ) {
    this.formUpdateUsers.patchValue(data.user);
  }

  updateUsers(): void {
    if (this.saving) return;
    this.formUpdateUsers.markAllAsTouched();
    if (this.formUpdateUsers.invalid) return;
    const { nombre, email } = this.formUpdateUsers.getRawValue();
    this.saving = true;
    this.error = '';
    this.dialogRef.disableClose = true;
    this.userService.updateUser(this.data.user.id, { nombre: nombre.trim(), email: email.trim() })
      .pipe(finalize(() => {
        this.saving = false;
        this.dialogRef.disableClose = false;
      })).subscribe({
        next: () => {
          this.snackBar.open('Usuario actualizado.', 'Cerrar', { duration: 5000 });
          this.dialogRef.close(true);
        },
        error: error => this.error = error.error?.error || 'No se pudo actualizar el usuario.',
      });
  }
}
