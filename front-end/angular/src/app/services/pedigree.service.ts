import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

import { ApiResponse } from '../models/api-response.model';
import { PedigreeRequestDto } from '../models/pedigree-request-dto.model';
import { PedigreeResponseDto } from '../models/pedigree-response-dto.model';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PedigreeService {
  private apiUrl = `${environment.apiUrl}/pedigrees`;

  constructor(private http: HttpClient) { }

  
  /** Verifica solo l'esistenza di un pedigree per questo paziente */
  exists(patientId: number): Observable<ApiResponse<boolean>> {
    return this.http.get<ApiResponse<boolean>>(`${this.apiUrl}/exists/${patientId}`).pipe(   
      tap(apiResp => {
        console.log('Messaggio dal backend:', apiResp.message);
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          console.error("Paziente non trovato nel DB:", error.error.message);
        } else {
          console.error("Errore generico:", error);
        }
        return of(); // ritorna un Observable vuoto per evitare che l'app crashi
      })  
    );
  }



  /** Recupera il pedigree per paziente (se esiste) */
  getByPatient(patientId: number): Observable<ApiResponse<PedigreeResponseDto>> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/by-patient/${patientId}`)
      .pipe(
        tap(apiResp => {
          if (apiResp.success) {
            console.log(`Recupero il campo messagge della classe ApiResponse inviato dal back-end: ${apiResp.message}, siamo entrati nell\'if, quindi il campo success è: ${apiResp.success}`);
            console.log(`Cosa dice il front-end: Questo metodo, se lo trova, ritorna il pedigree associato al paziente con id: (${patientId}), ->`, apiResp.data);
          } else{
            console.log('Recupero il campo messagge della classe ApiResponse inviato dal back-end:', apiResp.message);
            console.log(`Cosa dice il front-end: siamo entrati nell'else, visto che il campo success della classe ApiResponse è: ${apiResp.success}, quindi può aver fallito per 3 possibilità: o non esiste nel DB un paziente con questo id, o il paziente esiste ma non esiste un pedigree associato a questo paziente nel DB, oppure è avvenuto un altro errore nel back-end`);       
          }
        }),
        catchError(error => this.handleError(error))
      );
  }



  /** Crea o aggiorna il pedigree */
  save(pedigreeRequest: PedigreeRequestDto): Observable<ApiResponse<PedigreeResponseDto>> {
    return this.http.post<ApiResponse>(`${this.apiUrl}`, pedigreeRequest)
      .pipe(
        tap(apiResp => {
          if (apiResp.success) {
            console.log(`Recupero il campo messagge della classe ApiResponse inviato dal back-end:, ${apiResp.message}, siamo entrati nell\'if, quindi il campo success è:, ${apiResp.success}`);
            console.log(`Cosa dice il front-end: Questo metodo, ritorna il pedigree salvato/aggiornato del paziente con id: (${apiResp.data.patientId}), ->`, apiResp.data);
          } else {
            console.log(`Recupero il campo messagge della classe ApiResponse inviato dal back-end: ${apiResp.message}`);
            console.log(`Cosa dice il front-end: siamo entrati nell'else, visto che il campo success della classe ApiResponse è: ${apiResp.success}, quindi può aver fallito per 3 possibilità: o non esiste nel DB un paziente con questo id, o l'id dello user che voleva creare/aggiornare il pedigree non è valido(ovvero non esiste nel db uno user con questo id), oppure è avvenuto un altro errore nel back-end`);       
          }
        }),
        catchError(error => this.handleError(error))
      ); 
  }



  private handleError = (error: HttpErrorResponse) => {
    let errMsg = 'Si è verificato un errore';
    if (error.error instanceof ErrorEvent) {
      errMsg = `Errore client: ${error.error.message}`;
    } else {
      errMsg = `Errore server ${error.status}: ${error.error?.message || error.message}`;
    }
    console.error(errMsg);
    return throwError(() => new Error(errMsg));
  }
}
