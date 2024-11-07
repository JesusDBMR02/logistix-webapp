import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { MessageService } from 'primeng/api'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  providers: [MessageService], 
})
export class ForgotPasswordComponent {
  emailForm: FormGroup;
  loading:boolean = false;
  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService ,
    private router : Router
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }
  onSubmit() {
    if (this.emailForm.invalid) {
      this.showToast('warn', 'Please, complete the email');
      return;
    }
    const { email } = this.emailForm.value;
    this.loading = true;
    this.sendPasswordResetEmail(email);
  }
  sendPasswordResetEmail(email: string): void {
    this.authService
      .sendPasswordResetEmail(email)
      .then(() => {
        this.showToast('success','An email with a reset link has been sent to ' +
            { email } +
            '. Please check your inbox.',);
      })
      .catch((error) => {
        this.showToast('error', 'Error sending password recovery email: ' + error.message);
      })
      .finally(() => {
        this.loading = false;
      });
  }
  navigateToSignIn(){
    this.loading = true;
    setTimeout(() => {
      this.router.navigate(['/sign-in']);
      this.loading = false;
    },150);
  }
  showToast(severity: 'success' | 'info' | 'warn' | 'error', detail: string): void {
    this.messageService.add({
      severity: severity,
      summary: severity === 'warn' ? 'Advertencia' : severity === 'error' ? 'Error' : 'Información',
      detail: detail,
      life: 3000,
    });
  }
  
}
