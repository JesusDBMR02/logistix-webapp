import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { FacebookAuthProvider, GoogleAuthProvider } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(public auth: AngularFireAuth, private router: Router) {
    this.auth.authState.subscribe((user) => {
      if (!user) {
        this.router.navigate(['/sign-in']);
      }
    });
  }
  signInWithGoogle() {
    return this.auth.signInWithPopup(new GoogleAuthProvider()).then(async (result) => {
      const token = await result.user?.getIdToken() ??"";
      return token;
    });
  }

  signInWithFacebook() {
    return this.auth.signInWithPopup(new FacebookAuthProvider()).then(async (result) => {
      const token = await result.user?.getIdToken() ??"";
      return token;
    });
  }

  signInWithEmailAndPassword(email: string, password: string) {
    return this.auth.signInWithEmailAndPassword(email, password).then(async (result) => {
      const token = await result.user?.getIdToken() ??"";
      return token;
    }).catch((error)=>{
      throw error; 
    });
  }

  signUpWithEmailAndPassword(email: string, password: string) {
    return this.auth.createUserWithEmailAndPassword(email, password);
  }

  logout() {
    return this.auth.signOut();
  }

  sendPasswordResetEmail(email: string) {
    return this.auth.sendPasswordResetEmail(email);
  }

  async sendEmailVerification() {
    const user = await this.auth.currentUser;
    if (!user?.emailVerified) {
      try {
        await user?.sendEmailVerification();
      } catch (error) {
        console.error("Error enviando el correo de verificación:", error);
        throw error;
      }
    } else {
      console.warn("No hay un usuario autenticado para enviar el correo de verificación.");
    }
  }
}