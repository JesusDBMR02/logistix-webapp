import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { AuthService } from 'src/app/services/auth.service';
import { SessionService } from 'src/app/services/session.service';

@Component({
  selector: 'app-navbar-menu',
  templateUrl: './navbar-menu.component.html',
  styleUrl: './navbar-menu.component.scss'
})
export class NavbarMenuComponent implements OnInit {
  items: MenuItem[] | undefined;
  constructor(private authService: AuthService, 
    private sessionService: SessionService,
    private router: Router,
    private messageService: MessageService
  ){}
  ngOnInit(): void {
    this.items = [
     
      {
        label: 'Company',
        icon: 'pi pi-building'
      },

      {
        label: 'Contact',
        icon: 'pi pi-envelope',
      },
      {
        label: 'Sign-Out',
        icon: 'pi pi-sign-out',
        command: () => this.logout(),
      },
     

      
    ]
  }
    logout(){
      this.authService
      .logout()
      .then((token) => {
        this.showToast('success', 'Log out successfull.');
        this.sessionService.removeDataSession();
        this.navigateToLogin();
      })
      .catch((error) => {
        this.showToast('error', 'Error al iniciar sesión con Google: ' + error.message);
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
    navigateToLogin(){
      this.router.navigate(['/sign-in']);
    }
  
}
