import { Injectable } from "@angular/core";

@Injectable({
    providedIn:'root'
})

export class SessionService {
    constructor(){}

    saveDataSession(token:string, email:string){
        sessionStorage.setItem('token',token);
        sessionStorage.setItem('email',email);
    }
    
    removeDataSession(){
        sessionStorage.removeItem('token');
    }
    
    getToken(){
        return sessionStorage.getItem('token');
    }
    getEmail(){
        return sessionStorage.getItem('email');
    }
}