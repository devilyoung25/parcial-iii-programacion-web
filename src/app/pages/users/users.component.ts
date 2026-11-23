
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, ViewChild, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsersService } from 'app/services/users/users.service';
import { ModalCreateUserComponent } from 'app/pages/modal-create-user/modal-create-user.component';
import { MatDialog } from '@angular/material/dialog';
import { ModalEditUsersComponent } from 'app/pages/modal-edit-users/modal-edit-users.component';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Usuario } from '@core/models/usuario';
import Swal from 'sweetalert2';

export interface User {
  name: string;
}


@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'app-users',
    imports: [
    BreadcrumbComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatInputModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatIconModule,
    MatPaginatorModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule
],
    templateUrl: './users.component.html',
    styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {

  displayedColumns: string[] = [
    'name',
    'email',
    'role',
    'action'
  ];

  breadscrums = [
    {
      title: 'Gestión de usuarios',
      items: [],
      active: 'Datos básicos',
    },
  ];

  breadscrumsDetails = [
    {
      title: '',
    },
  ];

  private readonly destroyRef = inject(DestroyRef);
  loadError = '';

  // table
  dataSource = new MatTableDataSource<Usuario>([]);
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  // search
  userFormSearchFilter!: FormGroup;
  usersList: Usuario[] = [];

  isLoading = false;


  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly userService: UsersService,
    private readonly dialogModel: MatDialog,
    private readonly _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.createUserFormSearchFilter();
    this.getAllUserByAdministrator();
    this.handleUserFilterChange('name');
    this.handleUserFilterChange('email');
  }

  private createUserFormSearchFilter() {
    this.userFormSearchFilter = this._formBuilder.group({
      name: [''],
      email: ['']
    });
  }

  getRoleName(rol_id: number): string {
    switch (rol_id) {
      case 1:
        return 'Administrador';
      case 2:
        return 'Usuario';
      default:
        return 'Desconocido';
    }
  }

  private handleUserFilterChange(controlName: string) {
    this.userFormSearchFilter.controls[controlName].valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      const { name, email } = this.userFormSearchFilter.getRawValue();
      const nameFilter = name.trim().toLocaleLowerCase();
      const emailFilter = email.trim().toLocaleLowerCase();
      this.dataSource.data = this.usersList.filter(user =>
        user.nombre.toLocaleLowerCase().includes(nameFilter) &&
        user.email.toLocaleLowerCase().includes(emailFilter));
      this.paginator.firstPage();
    });
  }

  getAllUserByAdministrator(): void {
    this.isLoading = true;
    this.loadError = '';
    this.userService.getAllUserByAdministrator().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: response => {
        this.usersList = response;
        this.dataSource.data = response;
        this.userFormSearchFilter.reset({ name: '', email: '' }, { emitEvent: false });
        this.dataSource.paginator = this.paginator;
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'No se pudieron cargar los usuarios.';
        this.isLoading = false;
      }
    });
  }

  openModalCreateUser(): void {
    const dialogRef = this.dialogModel.open(ModalCreateUserComponent, {
      maxWidth: '95vw',
      width: '840px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAllUserByAdministrator();
      }
    })
  }

  openModalUpdateUsers(userInformation: Usuario): void {
    const dialogRef = this.dialogModel.open(ModalEditUsersComponent, {
      maxWidth: '95vw',
      width: '840px',
      disableClose: true,
      data: { user: userInformation }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAllUserByAdministrator();
      }
    });
  }

  async deleteUser(userId: number): Promise<void> {
    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
      text: 'También se eliminarán sus asignaciones a proyectos.',
      icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar'
    });
    if (!result.isConfirmed) return;
    this.userService.deleteUser(userId).subscribe({
      next: (response) => {
        this._snackBar.open('Usuario eliminado.', 'Cerrar', { duration: 5000 });
        this.getAllUserByAdministrator();
      },
      error: (error) => {
        const errorMessage = error.error?.error || 'Error al eliminar el usuario';
        this._snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
      }
    });
  }


}
