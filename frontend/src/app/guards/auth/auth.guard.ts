import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { SessionService } from 'src/app/services/session.service';

export const authGuard: CanActivateFn = (route, state): Observable<boolean> => {
  const afAuth = inject(AngularFireAuth);
  const router = inject(Router);
  const authService = inject(AuthService);
  const sessionService = inject(SessionService);
  return new Observable((observer) => {
    afAuth.authState.subscribe((user) => {
      if (user) {
        observer.next(true); 
      } else {
        authService
          .logout()
          .then((token) => {
            sessionService.removeDataSession();
            router.navigate(['/sign-in']);

          })
          .catch((error) => {
          });
        observer.next(false);
      }
      observer.complete();
    });
  });
};

