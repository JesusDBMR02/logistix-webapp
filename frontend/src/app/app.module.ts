import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SignInComponent } from './authentication/sign-in/sign-in.component';
import { MaterialModule } from './shared/material.module';
import { HomeComponent } from './mainapp/home/home.component';
import { FooterComponent } from './shared/footer/footer.component';
import { environment } from 'src/enviroment/enviroment';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ForgotPasswordComponent } from './authentication/forgot-password/forgot-password.component';
import { SignUpComponent } from './authentication/sign-up/sign-up.component';
import { HttpClientModule } from '@angular/common/http';
import { ConfirmEmailComponent } from './authentication/confirm-email/confirm-email.component';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CompanyComponent } from './mainapp/company/company.component';
import { NavbarMenuComponent } from './shared/navbar-menu/navbar-menu.component';
import { MenuComponent } from './shared/menu/menu.component';
import { MainappComponent } from './mainapp/mainapp.component';
import { CategoryComponent } from './mainapp/category/category.component';
import { DataView, DataViewModule } from 'primeng/dataview';

@NgModule({
  declarations: [
    AppComponent,
    SignInComponent,
    ForgotPasswordComponent,
    HomeComponent,
    FooterComponent,
    CategoryComponent,
    SignUpComponent,
    NavbarMenuComponent,
    ConfirmEmailComponent,
    CompanyComponent,
    MenuComponent,
    MainappComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    DataViewModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,

  ],
  providers: [ConfirmationService, MessageService],
  bootstrap: [AppComponent],
})
export class AppModule { }
