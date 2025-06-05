import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Patient } from '../models/patient.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  
  private apiUrl = 'http://localhost:8085/api/v1/patients';

  constructor(private http: HttpClient) { }

  // Ottiene tutti i pazienti
  getAllPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(`${this.apiUrl}`).pipe(   
      tap(resp => {
        console.log('[Sto nel service di pazienti] Messaggio che arriva dal backend:', resp);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Errore nel service di pazienti:', error);
        return throwError(() => new Error('Errore nel service di pazienti'));
      })
    );
  }

  // Ottiene un paziente specifico per ID
  getPatientById(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/${id}`);
  }

  // Crea un nuovo paziente
  createPatient(patient: Patient): Observable<Patient> {
    return this.http.post<Patient>(`${this.apiUrl}`, patient);
  }

  // Aggiorna un paziente esistente
  updatePatient(id: number, patient: Patient): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/${id}`, patient);
  }

  // Elimina un paziente
  deletePatient(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
} 