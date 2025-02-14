import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  apiUrl = 'http://localhost:3000/api/brands/'; 
  
  token = this.sessionService.getToken();
  headers= new HttpHeaders({
    Authorization: 'Bearer ' +this.token
  });
  constructor(private http: HttpClient,
    private sessionService:SessionService) { }

  getBrands(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {headers: this.headers});
  }
  getBrandById(id: String): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {headers: this.headers});
  }
  createBrand(brandData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, brandData,{headers: this.headers});
  }
  updateBrand(id:String,brandData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, brandData,{headers: this.headers});
  }
  deleteBrand(id: String): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`,{headers: this.headers});
  }

}