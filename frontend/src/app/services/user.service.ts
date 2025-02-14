import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  apiUrl = 'http://localhost:3000/api/users/'; 
  
  token = this.sessionService.getToken();
  email = this.sessionService.getEmail();
  headers= new HttpHeaders({
    Authorization: 'Bearer ' +this.token
  });
  constructor(private http: HttpClient,
    private sessionService:SessionService) { }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {headers: this.headers});
  }
  getUserByEmail(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${this.email}`, {headers: this.headers});
  }
  updateUser(id:String,userData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, userData,{headers: this.headers});
  }
  
}