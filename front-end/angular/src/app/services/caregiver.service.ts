import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Caregiver } from '../models/caregiver.model';
import { tap, catchError } from 'rxjs/operators';
import { CaregiverDTO } from '../models/caregiver-dto.model';
import { CaregiverResponse } from '../models/caregiver-response.model';
import { ApiResponse } from '../models/api-response.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CaregiverService {
  private apiUrl = `${environment.apiUrl}/caregivers`;

  constructor(private http: HttpClient) {}

  // Metodo per recuperare i dettagli di un caregiver specifico
  getCaregiverById(caregiverId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${caregiverId}`).pipe(
      tap(response => {
        console.log(`Risposta dal server: recuperate info sul caregiver con ID ${caregiverId}:`, response);
      })
    );
  }

  // Metodo per creare un nuovo caregiver
  createCaregiver(caregiverDTO: CaregiverDTO): Observable<CaregiverResponse> {
    return this.http.post<CaregiverResponse>(this.apiUrl, caregiverDTO).pipe(
      tap(response => {
        console.log('Caregiver creato con successo(sto nel service):', response);
      }),
      catchError(this.handleError)
    );
  }

  // Metodo per aggiornare un caregiver esistente
  updateCaregiver(id: number, caregiverDTO: CaregiverDTO): Observable<CaregiverResponse> {
    return this.http.put<CaregiverResponse>(`${this.apiUrl}/${id}`, caregiverDTO).pipe(
      tap(response => {
        console.log(`Caregiver con ID ${id} aggiornato con successo:`, response);
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Si è verificato un errore durante la creazione del caregiver.';
    
    if (error.error instanceof ErrorEvent) {
      // Errore lato client
      errorMessage = `Errore: ${error.error.message}`;
    } else {
      // Errore lato server
      errorMessage = `Il server ha restituito il codice ${error.status}: ${error.error.message || error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Metodo per cercare un caregiver per codice fiscale
  findByFiscalCode(fiscalCode: string): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/search-by-fiscal-code`, {
      params: { fiscalCode }
    }).pipe(
      tap(response => {
        if (response.success) {
          console.log('Caregiver trovato(questa stampa viene fatta nel CaregiverService):', response.data);
        } else {
          console.log('Caregiver NON trovato(questa stampa viene fatta nel CaregiverService):', response.message);
        }
      }),
      catchError(this.handleError)
    );
  }
} 