import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MessageService } from 'primeng/api'; 
import { Router } from '@angular/router';
import { SessionService } from 'src/app/services/session.service';


@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
  providers: [MessageService], 
})
export class SignInComponent implements OnInit {
  signInForm: FormGroup;
  loading:boolean = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private router:Router,
    private sessionService: SessionService
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

  onSubmit(): void {
    if (this.signInForm.invalid) {
      this.showToast('warn', 'Por favor, complete todos los campos correctamente.');
      return;
    }

    const { email, password } = this.signInForm.value;
    this.loading = true;
    this.signInWithEmailPassword(email, password);
  }

  signInWithEmailPassword(email: string, password: string) {
    this.authService
      .signInWithEmailAndPassword(email, password)
      .then((token) => {
        this.showToast('success', 'Inicio de sesión exitoso.');
        this.sessionService.saveDataSession(token, email);
        this.navigateToLogisticHome();
      })
      .catch((err) => {
        this.showToast('error', 'Error al iniciar sesión: ' + err.message);
      });
  }

  signInWithGoogle() {
    this.authService
      .signInWithGoogle()
      .then((token) => {
        this.showToast('success', 'Inicio de sesión con Google con éxito.');
        this.navigateToLogisticHome();
      })
      .catch((error) => {
        this.showToast('error', 'Error al iniciar sesión con Google: ' + error.message);
      });
  }
  navigateToLogisticHome(){
    this.loading = true;
    setTimeout(() => {
        this.router.navigate(['/mainapp']);
        this.loading = false;
    },150)
  }
  navigateToSignUp(){
    this.loading = true;
    setTimeout(() => {
        this.router.navigate(['/sign-up']);
        this.loading = false;
    },150)
  }
  signInWithFacebook() {
    this.authService
      .signInWithFacebook()
      .then((token) => {
        this.showToast('success', 'Inicio de sesión con Facebook con éxito.');
        this.navigateToLogisticHome();
      })
      .catch((error) => {
        this.showToast('error', 'Error al iniciar sesión con Facebook: ' + error.message);
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

