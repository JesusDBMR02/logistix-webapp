import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  apiUrl = 'http://localhost:3000/api/categories/'; 
  
  token = this.sessionService.getToken();
  headers= new HttpHeaders({
    Authorization: 'Bearer ' +this.token
  });
  constructor(private http: HttpClient,private sessionService:SessionService) { }

  // Método para obtener categorías
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {headers: this.headers});
  }
  getCategoryById(id: String): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {headers: this.headers});
  }
  createCategory(categoryData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, categoryData,{headers: this.headers});
  }
  updateCategory(id:String,categoryData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, categoryData,{headers: this.headers});
  }
  deleteCategory(id: String): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`,{headers: this.headers});
  }
}
