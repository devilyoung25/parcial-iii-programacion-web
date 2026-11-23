import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs';
import { UsersService } from 'app/services/users/users.service';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-modal-create-user',
  imports: [ReactiveFormsModule, MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './modal-create-user.component.html',
  styleUrl: './modal-create-user.component.scss'
})
export class ModalCreateUserComponent {
  readonly formCreateUser = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [
      Validators.required, Validators.pattern(/\S/), Validators.maxLength(100)
    ] }),
    email: new FormControl('', { nonNullable: true, validators: [
      Validators.required, Validators.email, Validators.maxLength(150)
    ] }),
    password: new FormControl('', { nonNullable: true, validators: [
      Validators.required, Validators.minLength(8)
    ] }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });
  saving = false;
  error = '';

  constructor(
    private readonly userService: UsersService,
    private readonly dialogRef: MatDialogRef<ModalCreateUserComponent>,
    private readonly snackBar: MatSnackBar,
  ) {}

  onSubmit(): void {
    if (this.saving) return;
    this.formCreateUser.markAllAsTouched();
    if (this.formCreateUser.invalid) return;
    const { nombre, email, password, confirmPassword } = this.formCreateUser.getRawValue();
    if (password !== confirmPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }
    if (new TextEncoder().encode(password).length > 72) {
      this.error = 'La contraseña admite máximo 72 bytes.';
      return;
    }
    this.saving = true;
    this.error = '';
    this.dialogRef.disableClose = true;
    this.userService.createUser({ nombre: nombre.trim(), email: email.trim(), password })
      .pipe(finalize(() => {
        this.saving = false;
        this.dialogRef.disableClose = false;
      })).subscribe({
        next: () => {
          this.snackBar.open('Usuario creado.', 'Cerrar', { duration: 5000 });
          this.dialogRef.close(true);
        },
        error: error => this.error = error.error?.error || 'No se pudo crear el usuario.',
      });
  }
}
