import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginRequest } from '../models/login-request.model';
import { RegisterRequest } from '../models/register-request.model';
import { AuthResponse } from '../models/auth-response.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8085/api/v1/auth';

  // Observable per tenere traccia dello stato di autenticazione
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();


  constructor(private http: HttpClient) {
    // Verifica se esiste un utente salvato nel localStorage all'avvio
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      this.currentUserSubject.next(JSON.parse(savedUser));
    }
  }

  // Getter per ottenere il valore corrente dell'utente autenticato
  public get currentUserValue(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  // Metodo per il login
  login(loginRequest: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signin`, loginRequest)
      .pipe(
        tap(response => {
          if (response.success) {
            // Salva l'utente nel localStorage e aggiorna il BehaviorSubject
            localStorage.setItem('currentUser', JSON.stringify(response));
            this.currentUserSubject.next(response);
          }
        })
      );
  }


  // Metodo per la registrazione
  register(registerRequest: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, registerRequest);
  }


  // Metodo per il logout
  logout(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/signout`, {})
      .pipe(
        tap(() => {
          // Rimuovi l'utente dal localStorage e reimposta il BehaviorSubject
          localStorage.removeItem('currentUser');
          this.currentUserSubject.next(null);
        })
      );
  }


  // Metodo per verificare se l'utente è autenticato
  isAuthenticated(): boolean {
    return !!this.currentUserValue;
  }

}
