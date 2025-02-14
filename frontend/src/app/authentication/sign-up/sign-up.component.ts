import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api'; 
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../../models/user.model';

@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.scss'],
    providers: [MessageService, ConfirmationService],
    standalone: false
})
export class SignUpComponent implements OnInit {
  signUpForm: FormGroup;
  loading: boolean = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private http: HttpClient,
    private router: Router
  ) {
    this.signUpForm = this.fb.group({
      name: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
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
      confirmPassword: ['', Validators.required],
      company: ['', [Validators.required]],
      address: ['', [Validators.required]],
      phone: [
        '',
        [
          Validators.required,
          Validators.pattern(/^\(\d{3}\) \d{3}-\d{3}-\d{3}$/),
        ]
      ],
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {}

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    this.confirmationService.confirm({
      header: 'Are you sure?',
      message: 'Please confirm to proceed.',
      accept: () => {
        this.loading = true;
        const { name, lastName, email, password, company, address, phone } = this.signUpForm.value;
        const role = 'admin';

        this.signUpWithEmailAndPassword(email, password, name, lastName, company, role, address, phone )
          .finally(() => this.loading = false); 
      },
      reject: () => {
        this.showToast('error', 'Registro cancelado');
      }
    });
  }

  signUpWithEmailAndPassword(email: string, password: string, name: string, lastName: string, company:string, role: string, address:string, phone:string): Promise<void> {
    return this.authService.signUpWithEmailAndPassword(email, password)
      .then((res) => {
        return this.createUserApi( email, password, name, lastName, company, role, address, phone);
      })
      .then(() => {
        this.showToast('success', 'Usuario creado correctamente.');
        this.authService.sendEmailVerification().then(() => {
          this.showToast('success', 'Email Verification Sent. Please check your inbox for a verification link.');
        }).catch((error) => {
          this.showToast('error', 'Error Sending Email Verification: ' + error.message);
        });
        this.router.navigate(['/confirm-email']);
      })
      .catch((err) => {
        this.showToast('error', 'Error al crear usuario: ' + err.message);
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
  navigateToSignIn(){
    this.loading = true;

    setTimeout(() => {
      this.router.navigate(['/sign-in']);
      this.loading = false;
    }, 150);
  }
  createUserApi(email: string, password: string, name: string, lastName: string, company:string, role: string, address:string, phone:string): Promise<any> {
    const user: User = {
      email,
      password,
      name,
      lastName,
      company,
      role,
      address,
      phone,
    }
    const apiUrl = 'http://localhost:3000/api/users/signUp';
    return this.http.post<User>(apiUrl,user).toPromise();
  }
}


