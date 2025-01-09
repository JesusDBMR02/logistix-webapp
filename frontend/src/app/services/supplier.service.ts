import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {
  apiUrl = 'http://localhost:3000/api/suppliers/'; 
  
  token = this.sessionService.getToken();
  headers= new HttpHeaders({
    Authorization: 'Bearer ' +this.token
  });
  constructor(private http: HttpClient,
    private sessionService:SessionService) { }

  getSuppliers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {headers: this.headers});
  }
  getSupplierById(id: String): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {headers: this.headers});
  }
  createSupplier(supplierData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, supplierData,{headers: this.headers});
  }
  updateSupplier(id:String,supplierData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, supplierData,{headers: this.headers});
  }
  deleteSupplier(id: String): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`,{headers: this.headers});
  }

}