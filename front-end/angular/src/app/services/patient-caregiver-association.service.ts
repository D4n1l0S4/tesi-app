import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PatientCaregiverAssociation } from '../models/patient-caregiver-association.model';
import { PatientCaregiverAssociationDTO } from '../models/patient-caregiver-association-dto.model';
import { PatientCaregiverAssociationResponseDTO } from '../models/patient-caregiver-association-response.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PatientCaregiverAssociationService {
  private apiUrl = `${environment.apiUrl}/patient-caregiver`;

  constructor(private http: HttpClient) {}

  getCaregiversByPatient(patientId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/caregiver-by-patient/${patientId}`);
  }

  associateCaregiver(associationDTO: PatientCaregiverAssociationDTO): Observable<PatientCaregiverAssociationResponseDTO> {
    // Log del DTO prima dell'invio
    console.group('Invio richiesta di associazione caregiver-paziente:');
    console.log('Patient ID:', associationDTO.patientId);
    console.log('Caregiver ID:', associationDTO.caregiverId);
    console.log('Relationship:', associationDTO.relationship);
    console.groupEnd();

    return this.http.post<PatientCaregiverAssociationResponseDTO>(`${this.apiUrl}/associate`, associationDTO)
      .pipe(
        tap({
          next: (response) => {
            // Log della risposta di successo
            console.group('Risposta associazione caregiver-paziente:');
            console.log('Success:', response.success);
            console.log('Data:', response.data);
            console.log('Timestamp:', response.timestamp);
            console.log('Message:', response.message);
            console.groupEnd();
          },
          error: (error) => {
            // Log degli errori se presenti
            console.group('Errori associazione caregiver-paziente:');
            console.error('Errors:', error.error?.errors || error);
            console.groupEnd();
          }
        })
      );
  }

  /**
   * Recupera l'ID dell'associazione tra un paziente e un caregiver
   * @param patientId ID del paziente
   * @param caregiverId ID del caregiver
   * @returns Observable con la risposta del server
   */
  getAssociationByPatientAndCaregiver(patientId: number, caregiverId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/association`, {
      params: new HttpParams()
        .set('patientId', patientId.toString())
        .set('caregiverId', caregiverId.toString())
    });
  }

  /**
   * Rimuove un'associazione tra paziente e caregiver
   * @param associationId ID dell'associazione da rimuovere
   * @returns Observable con la risposta del server
   */
  removeAssociation(associationId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/remove/${associationId}`);
  }

  // Metodo per aggiornare la relazione
  updateRelationship(associationId: number, relationship: string): Observable<PatientCaregiverAssociationResponseDTO> {
    return this.http.put<PatientCaregiverAssociationResponseDTO>(
      `${this.apiUrl}/update-relationship/${associationId}`,
      null,
      {
        params: new HttpParams().set('relationship', relationship)
      }
    ).pipe(
      tap(response => {
        console.log('Relazione aggiornata con successo:', response);
      })
    );
  }
} 