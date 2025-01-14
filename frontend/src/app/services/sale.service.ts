import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  apiUrl = 'http://localhost:3000/api/sales/'; 
  
  token = this.sessionService.getToken();
  headers= new HttpHeaders({
    Authorization: 'Bearer ' +this.token
  });
  constructor(private http: HttpClient,
    private sessionService:SessionService) { }

  getSales(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {headers: this.headers});
  }
  getSaleById(id: String): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {headers: this.headers});
  }
  createSale(saleData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, saleData,{headers: this.headers});
  }
  updateSale(id:String,saleData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, saleData,{headers: this.headers});
  }
  deleteSale(id: String): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`,{headers: this.headers});
  }

}