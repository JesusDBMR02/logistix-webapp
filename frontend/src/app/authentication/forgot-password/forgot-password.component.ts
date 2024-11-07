import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  emailForm: FormGroup;
  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }
  onSubmit() {
    if (this.emailForm.invalid) {
      this.openSnackBar('Please, complete the email', 'Cerrar', 'warn');
      return;
    }
    const { email } = this.emailForm.value;
    this.sendPasswordResetEmail(email);
  }
  sendPasswordResetEmail(email: string): void {
    this.authService
      .sendPasswordResetEmail(email)
      .then(() => {
        this.openSnackBar(
          'An email with a reset link has been sent to ' +
            { email } +
            '. Please check your inbox.',
          'Cerrar',
          'primary'
        );
      })
      .catch((error) => {
        this.openSnackBar(
          'Error sending password recovery email: ' + error.message,
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
