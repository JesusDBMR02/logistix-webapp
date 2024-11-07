import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SignInComponent } from './authentication/sign-in/sign-in.component';
import { MaterialModule } from './shared/material.module';
import { HomeComponent } from './home/home.component';
import { FooterComponent } from './shared/footer/footer.component';
import { NavbarSignComponent } from './shared/navbar-sign/navbar-sign.component';
import { environment } from 'src/enviroment/enviroment';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { ReactiveFormsModule } from '@angular/forms';
import { ForgotPasswordComponent } from './authentication/forgot-password/forgot-password.component';
import { SignUpComponent } from './authentication/sign-up/sign-up.component';
import { HttpClientModule } from '@angular/common/http';
import { ConfirmEmailComponent } from './authentication/confirm-email/confirm-email.component';
import { ConfirmationService } from 'primeng/api';

@NgModule({
  declarations: [
    AppComponent,
    SignInComponent,
    ForgotPasswordComponent,
    HomeComponent,
    FooterComponent,
    NavbarSignComponent,
    SignUpComponent,
    ConfirmEmailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    ReactiveFormsModule,
    HttpClientModule,

  ],
  providers: [ConfirmationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
