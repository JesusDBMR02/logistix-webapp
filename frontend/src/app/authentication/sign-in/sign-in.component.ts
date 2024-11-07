import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {
  signInForm: FormGroup;
  hide: boolean = true;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!?,.;:+\-{}[\]()€_.@\$%&*¡¿\/])[A-Za-z\d!?,.;:+\-{}[\]()€_.@\$%&*¡¿\/]{8,}$/
          ),
        ],
      ],
    });
  }

  ngOnInit(): void {}

  togglePasswordVisibility(event: MouseEvent): void {
    event.stopPropagation();
    console.log('Hola');
    this.hide = !this.hide;
  }

  onSubmit(): void {
    if (this.signInForm.invalid) {
      this.openSnackBar(
        'Por favor, complete todos los campos correctamente.',
        'Cerrar',
        'warn'
      );
      return;
    }

    const { email, password } = this.signInForm.value;
    this.signInWithEmailPassword(email, password);
  }

  signInWithEmailPassword(email: string, password: string): void {
    this.authService
      .signInWithEmailAndPassword(email, password)
      .then((res) => {
        console.log('Logged in with email', res);
        this.openSnackBar('Inicio de sesión exitoso.', 'Cerrar', 'primary');
      })
      .catch((err) => {
        console.error('Error logging in with email', err);
        this.openSnackBar(
          'Error al iniciar sesión: ' + err.message,
          'Cerrar',
          'accent'
        );
      });
  }

  signInWithGoogle() {
    this.authService
      .signInWithGoogle()
      .then((response) => {
        console.log(response);
        this.openSnackBar(
          'Inicio de sesión con Google con exito.',
          'Cerrar',
          'primary'
        );
      })
      .catch((error) => {
        console.log(error);
        this.openSnackBar(
          'Error al iniciar sesión con Google: ' + error.message,
          'Cerrar',
          'accent'
        );
      });
  }
  signInWithFacebook() {
    this.authService
      .signInWithFacebook()
      .then((response) => {
        console.log(response);
        this.openSnackBar(
          'Inicio de sesión con Facebook con exito.',
          'Cerrar',
          'primary'
        );
      })
      .catch((error) => {
        console.log(error);
        this.openSnackBar(
          'Error al iniciar sesión con Facebook: ' + error.message,
          'Cerrar',
          'accent'
        );
      });
  }

  openSnackBar(
    message: string,
    action: string,
    color: 'warn' | 'accent' | 'primary'
  ): void {
    this.snackBar.open(message, action, {
      duration: 3000,
      verticalPosition: 'top',
      horizontalPosition: 'right',
      panelClass: [],
    });
  }
}
