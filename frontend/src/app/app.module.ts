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
@NgModule({
  declarations: [
    AppComponent,
    SignInComponent,
    HomeComponent,
    FooterComponent,
    NavbarSignComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
