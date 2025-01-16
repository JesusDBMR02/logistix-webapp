import { HttpClient, HttpHeaders } from "@angular/common/http";
import { SessionService } from "./session.service";
import { Observable } from "rxjs";
import { Injectable } from "@angular/core";
@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  apiUrl = 'http://localhost:3000/api/purchases/'; 
  
  token = this.sessionService.getToken();
  headers= new HttpHeaders({
    Authorization: 'Bearer ' +this.token
  });
  constructor(private http: HttpClient,
    private sessionService:SessionService) { }

  getPurchases(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl, {headers: this.headers});
  }
  getPurchaseById(id: String): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {headers: this.headers});
  }
  createPurchase(purchaseData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}`, purchaseData,{headers: this.headers});
  }
  updatePurchase(id:String,purchaseData: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, purchaseData,{headers: this.headers});
  }
  deletePurchase(id: String): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`,{headers: this.headers});
  }

}