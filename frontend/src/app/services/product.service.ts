import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  apiUrl = 'http://localhost:3000/api/products/'; 
  
  token = this.sessionService.getToken();
  headers= new HttpHeaders({
    Authorization: 'Bearer ' + this.token
  });
  constructor(private http: HttpClient,
    private sessionService:SessionService) { }

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {headers: this.headers});
  }
  getProductById(id: String): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {headers: this.headers});
  }
  createProduct(productData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, productData,{headers: this.headers});
  }
  updateProduct(id:String,productData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, productData,{headers: this.headers});
  }
  deleteProduct(id: String): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`,{headers: this.headers});
  }

}