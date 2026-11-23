import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '@core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss'],
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule],
  standalone: true,
})
export class SigninComponent {
  readonly authForm = new FormGroup({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: Validators.required }),
  });
  loading = false;
  error = '';
  hide = true;

  constructor(private readonly router: Router, private readonly authService: AuthService) {}

  onSubmit(): void {
    if (this.loading) return;
    this.authForm.markAllAsTouched();
    if (this.authForm.invalid) return;
    this.loading = true;
    this.error = '';
    const { username, password } = this.authForm.getRawValue();
    this.authService.login(username, password).pipe(finalize(() => this.loading = false)).subscribe({
      next: () => void this.router.navigate(['/page/projects']),
      error: error => this.error = error.error?.error || 'No se pudo conectar con el servidor.',
    });
  }
}
