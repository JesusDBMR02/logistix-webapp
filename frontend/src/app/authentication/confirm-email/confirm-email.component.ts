import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.scss', 
  providers:[MessageService]
})
export class ConfirmEmailComponent implements OnInit {
  email: string | null = null; 
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
  ) {}
  ngOnInit(): void {
    
  }
   onSendEmail():void{
      
      this.confirmationService.confirm({
        header: 'Are you sure?',
        message: 'Please confirm to proceed.',
        accept: () => {
          this.loading = true;
          this.sendEmailVerification();
          this.loading = false;
        },
        reject: () => {
          this.showToast('error', 'Registro cancelado');
        }
      });
    }
    navigateToSignIn(){
      this.loading = true;
      setTimeout(() => {
        this.router.navigate(['/sign-in']);
        this.loading = false;
      }, 150);

    }
    sendEmailVerification() {
      this.authService.sendEmailVerification().then(() => {
        this.showToast('success', 'Email Verification Sent. Please check your inbox for a verification link.');
      }).catch((error) => {
        this.showToast('error', 'Error Sending Email Verification: ' + error.message);
      });
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
