import { Injectable } from "@angular/core";

@Injectable({
    providedIn:'root'
})

export class SessionService {
    constructor(){}

    saveDataSession(token:string){
        sessionStorage.setItem('token',token);
    }
    
    removeDataSession(){
        sessionStorage.removeItem('token');
    }
    
    getToken(){
        return sessionStorage.getItem('token');
    }
}