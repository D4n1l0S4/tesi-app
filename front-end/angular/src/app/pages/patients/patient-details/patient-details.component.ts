import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Patient } from '../../../models/patient.model';
import { Caregiver } from '../../../models/caregiver.model';
import { PatientCaregiverAssociationService } from '../../../services/patient-caregiver-association.service';
import { CaregiverService } from '../../../services/caregiver.service';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AddCaregiverFormComponent } from './add-caregiver-form/add-caregiver-form.component';
import { CaregiverDTO } from '../../../models/caregiver-dto.model';
import { SearchCaregiverByFiscalCodeComponent } from 'src/app/components/search-caregiver-by-fiscal-code/search-caregiver-by-fiscal-code.component';


interface PatientCaregiverAssociation {
  idAssociation: number;
  patientId: number;
  caregiverId: number;
  relationship: string;
}

@Component({
  selector: 'app-patient-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AddCaregiverFormComponent, SearchCaregiverByFiscalCodeComponent],
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.scss'] 
})
export class PatientDetailsComponent implements OnChanges {
  @Input() patient: Patient | null = null;
  @Input() show: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Patient>();
  @Output() delete = new EventEmitter<Patient>();

  // Array delle opzioni per la relazione
  relationshipOptions: string[] = [
    'Coniuge',
    'Figlio/a',
    'Fratello/Sorella',
    'Amico/a',
    'Familiare',
    'Altro'
  ];

  // Proprietà per i messaggi di feedback
  feedbackMessage: string = '';
  feedbackType: 'success' | 'error' = 'success';
  showFeedback: boolean = false;

  caregiverAssociations: PatientCaregiverAssociation[] = [];
  caregivers: (Caregiver & { relationship: string })[] = [];
  loadingCaregivers: boolean = false;
  caregiverError: string | null = null;
  
  // Proprietà per la modale di eliminazione
  showDeleteModal = false;
  selectedCaregiverForDelete: Caregiver | null = null;

  // Nuove proprietà per la modale di modifica
  showEditModal = false;
  selectedCaregiverForEdit: (Caregiver & { relationship: string }) | null = null;

  // Nuovo stato per gestire il form di aggiunta caregiver
  showAddCaregiverForm = false;

  // Proprietà per la validazione del codice fiscale nella modale di modifica
  editFiscalCodeError: string = '';
  isEditFiscalCodeValid: boolean = true;

  // Form per la modifica del caregiver
  editCaregiverForm: FormGroup;

  // Stato per la ricerca e il form caregiver
  showCaregiverSearch = false;
  foundCaregiverData: any = null;
  readonlyCaregiverFields = false;

  constructor(
    private patientCaregiverService: PatientCaregiverAssociationService,
    private caregiverService: CaregiverService,
    private fb: FormBuilder
  ) {
    this.editCaregiverForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      fiscalCode: ['', Validators.required],
      gender: ['', Validators.required],
      relationship: ['', Validators.required]
    });
  }

  getGenderLabel(gender: string | undefined): string {
    if (!gender) return 'Non disponibile';
    switch (gender.toUpperCase()) {
      case 'M':
        return 'Maschio';
      case 'F':
        return 'Femmina';
      case 'A':
        return 'Altro';
      default:
        return 'Non disponibile';
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('Changes detected:', changes);
    console.log('Current patient:', this.patient);
    if (changes['patient'] && this.patient && this.patient.id) {
      this.loadCaregivers();
    }
    if (changes['show'] && !changes['show'].currentValue) {
      this.showAddCaregiverForm = false;
    }
  }

  loadCaregivers(): void {
    if (!this.patient || !this.patient.id) {
      console.error('Paziente nullo o senza ID');
      return;
    }

    this.loadingCaregivers = true;
    this.caregiverError = null;

    this.patientCaregiverService.getCaregiversByPatient(this.patient.id).subscribe({
      next: (response) => {
        console.log(`Risposta back-end -> associazioni (caregiver,paziente) per ID paziente ${this.patient?.id}:`, response);

        if (response.success && response.data && response.data.length > 0) {
          this.caregiverAssociations = response.data;
          
          // Creo un array di Observable per recuperare i dettagli di ogni caregiver
          const caregiverRequests: Observable<any>[] = this.caregiverAssociations.map(assoc => 
            this.caregiverService.getCaregiverById(assoc.caregiverId).pipe(
              map(caregiver => ({
                ...caregiver,
                relationship: assoc.relationship
              })),
              catchError(error => {
                console.error(`Errore nel recupero del caregiver ${assoc.caregiverId}:`, error);
                return of({
                  id: assoc.caregiverId,
                  firstName: 'Caregiver non trovato',
                  lastName: '',
                  relationship: assoc.relationship
                });
              })
            )
          );

          // Uso forkJoin per eseguire tutte le richieste in parallelo
          forkJoin(caregiverRequests).subscribe({
            next: (detailedCaregivers) => {
              this.caregivers = detailedCaregivers;
              
              // Log dettagliato dei caregiver
              console.group(`Dettagli Caregiver per Paziente ID ${this.patient?.id}`);
              detailedCaregivers.forEach((caregiver, index) => {
                console.log(`Caregiver #${index + 1}:`, {
                  id: caregiver.id,
                  nome: caregiver.firstName,
                  cognome: caregiver.lastName,
                  email: caregiver.email,
                  telefono: caregiver.phone,
                  codiceFiscale: caregiver.fiscalCode,
                  dataNascita: caregiver.dateOfBirth,
                  indirizzo: caregiver.address,
                  relazione: caregiver.relationship
                });
              });
              console.groupEnd();

              this.loadingCaregivers = false;
            },
            error: (error) => {
              console.error('Errore nel recupero dei dettagli dei caregiver:', error);
              this.caregiverError = 'Impossibile caricare i dettagli dei caregiver';
              this.loadingCaregivers = false;
            }
          });
        } else {
          console.warn(`Nessuna associazione caregiver trovata per paziente ID ${this.patient?.id}`);
          this.caregivers = [];
          this.loadingCaregivers = false;
    }
      },
      error: (error) => {
        console.error('Errore nel caricamento delle associazioni caregiver:', error);
        this.caregiverError = 'Impossibile caricare i caregiver';
        this.caregivers = [];
        this.loadingCaregivers = false;
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onEdit(): void {
    if (this.patient) {
      this.edit.emit(this.patient);
    }
  }

  onDelete(): void {
    if (this.patient) {
      this.delete.emit(this.patient);
    }
  }

  calculateAge(dateOfBirth: Date): number {
    if (!dateOfBirth) return 0;
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  onAddCaregiver(): void {
    // Mostra la ricerca caregiver invece del form direttamente
    this.showAddCaregiverForm = true;
    this.showCaregiverSearch = true;
    this.foundCaregiverData = null;
    this.readonlyCaregiverFields = false;
  }

  onCaregiverNotFound(fiscalCode: string): void {
    // Mostra il form vuoto per inserimento nuovo caregiver, precompilando il codice fiscale
    this.showCaregiverSearch = false;
    this.foundCaregiverData = { fiscalCode };
    this.readonlyCaregiverFields = false;
  }

  onCaregiverFound(caregiverData: any): void {
    // Mostra il form precompilato e readonly (tranne relazione)
    this.showCaregiverSearch = false;
    this.foundCaregiverData = caregiverData;
    this.readonlyCaregiverFields = true;
  }

  onCancelAddCaregiver(): void {
    this.showAddCaregiverForm = false;
    this.showCaregiverSearch = false;
    this.foundCaregiverData = null;
    this.readonlyCaregiverFields = false;
  }

  onSubmitCaregiver(response: any): void {
    if (!this.patient) return;
    const patientId = this.patient.id!;
    const caregiverDTO = response.caregiver;
    const relationship = response.relationship;

    if (caregiverDTO.id) {
      // Log dettagliato del payload
      console.log('Chiamo associateCaregiver con:', {
        patientId: patientId,
        caregiverId: caregiverDTO.id,
        relationship: relationship
      });
      this.patientCaregiverService.associateCaregiver({
        patientId: patientId,
        caregiverId: caregiverDTO.id,
        relationship: relationship
      }).subscribe({
        next: (associationResponse: any) => {
          this.showAddCaregiverForm = false;
          this.loadCaregivers();
          this.showFeedbackMessage('Caregiver associato con successo', 'success');
        },
        error: (err: any) => {
          console.error('Errore dal backend associateCaregiver:', err);
          this.showFeedbackMessage('Errore durante l\'associazione del caregiver', 'error');
        }
      });
    } else {
      this.caregiverService.createCaregiver(caregiverDTO).subscribe({
        next: (createdCaregiver: any) => {
          const caregiverId = createdCaregiver.id;
          this.patientCaregiverService.associateCaregiver({
            patientId: patientId,
            caregiverId: caregiverId,
            relationship: relationship
          }).subscribe({
            next: (associationResponse: any) => {
              this.showAddCaregiverForm = false;
              this.loadCaregivers();
              this.showFeedbackMessage('Caregiver aggiunto e associato con successo', 'success');
            },
            error: (err: any) => {
              this.showFeedbackMessage('Errore durante l\'associazione del caregiver', 'error');
            }
          });
        },
        error: (err: any) => {
          this.showFeedbackMessage('Errore durante la creazione del caregiver', 'error');
        }
      });
    }
  }

  // Metodi per la gestione della modale di eliminazione
  openDeleteModal(caregiver: Caregiver): void {
    this.selectedCaregiverForDelete = caregiver;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.selectedCaregiverForDelete = null;
  }

  // Metodo per mostrare il feedback
  private showFeedbackMessage(message: string, type: 'success' | 'error'): void {
    this.feedbackMessage = message;
    this.feedbackType = type;
    this.showFeedback = true;
    // Nascondi il messaggio dopo 3 secondi
    setTimeout(() => {
      this.showFeedback = false;
    }, 3000);
  }

  confirmDelete(): void {
    if (this.selectedCaregiverForDelete && this.patient) {
      // Prima otteniamo l'ID dell'associazione
      this.patientCaregiverService.getAssociationByPatientAndCaregiver(
        this.patient.id!,
        this.selectedCaregiverForDelete.id!
      ).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            // Ora che abbiamo l'ID dell'associazione, possiamo eliminarla
            const associationId = response.data.idAssociation;
            this.patientCaregiverService.removeAssociation(associationId).subscribe({
              next: (removeResponse) => {
                if (removeResponse.success) {
                  this.showFeedbackMessage('Caregiver eliminato con successo', 'success');
                  this.loadCaregivers();
                } else {
                  this.showFeedbackMessage('Errore durante l\'eliminazione del caregiver', 'error');
                }
              },
              error: (error) => {
                this.showFeedbackMessage('Errore durante l\'eliminazione del caregiver', 'error');
              }
            });
          } else {
            this.showFeedbackMessage('Associazione non trovata', 'error');
          }
        },
        error: (error) => {
          this.showFeedbackMessage('Errore durante il recupero dell\'associazione', 'error');
        },
        complete: () => {
          this.closeDeleteModal();
        }
      });
    }
  }

  // Funzione per mappare la relazione dal backend al formato del menu a tendina
  private mapRelationshipToOption(relationship: string): string {
    const mappings: { [key: string]: string } = {
      'coniuge': 'Coniuge',
      'figlio': 'Figlio/a',
      'figlia': 'Figlio/a',
      'fratello': 'Fratello/Sorella',
      'sorella': 'Fratello/Sorella',
      'amico': 'Amico/a',
      'amica': 'Amico/a',
      'familiare': 'Familiare',
      'altro': 'Altro',
      'altra': 'Altro'
    };
    return mappings[relationship.toLowerCase()] || relationship;
  }

  // Metodi per la gestione della modale di modifica
  openEditModal(caregiver: Caregiver & { relationship: string }): void {
    this.selectedCaregiverForEdit = caregiver;
    this.showEditModal = true;
    
    // Debug log per verificare i valori
    console.group('Debug valori relazione');
    console.log('Relazione del caregiver:', caregiver.relationship);
    console.log('Opzioni disponibili:', this.relationshipOptions);
    console.groupEnd();

    // Mappiamo la relazione al formato corretto
    const mappedRelationship = this.mapRelationshipToOption(caregiver.relationship);

    this.editCaregiverForm.patchValue({
      firstName: caregiver.firstName,
      lastName: caregiver.lastName,
      email: caregiver.email,
      phone: caregiver.phone,
      address: caregiver.address,
      dateOfBirth: caregiver.dateOfBirth,
      fiscalCode: caregiver.fiscalCode,
      gender: caregiver.gender,
      relationship: mappedRelationship
    });

    // Debug log per verificare il valore nel form dopo patchValue
    console.log('Valore relazione nel form dopo patchValue:', this.editCaregiverForm.get('relationship')?.value);

    // Validazione iniziale del codice fiscale
    if (caregiver.fiscalCode) {
      this.validateEditFiscalCode(caregiver.fiscalCode);
    }
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedCaregiverForEdit = null;
    this.editCaregiverForm.reset();
  }

  validateEditFiscalCode(fiscalCode: string): void {
    // Reset degli errori
    this.editFiscalCodeError = '';
    this.isEditFiscalCodeValid = true;

    const errorMessage = `Il codice fiscale deve essere di 16 caratteri
Il codice fiscale deve essere composto da:
- 6 lettere maiuscole
- 2 numeri
- 1 lettera maiuscola
- 2 numeri
- 1 lettera maiuscola
- 3 numeri
- 1 lettera maiuscola`;

    // Controllo lunghezza
    if (fiscalCode.length !== 16) {
      this.editFiscalCodeError = errorMessage;
      this.isEditFiscalCodeValid = false;
      return;
    }

    // Controllo formato
    const fiscalCodeRegex = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;
    if (!fiscalCodeRegex.test(fiscalCode)) {
      this.editFiscalCodeError = errorMessage;
      this.isEditFiscalCodeValid = false;
      return;
    }
  }

  onEditFiscalCodeChange(event: any): void {
    const fiscalCode = event.target.value.toUpperCase();
    this.editCaregiverForm.patchValue({ fiscalCode }, { emitEvent: false });
    this.validateEditFiscalCode(fiscalCode);
  }

  saveEditedCaregiver(): void {
    if (!this.isEditFiscalCodeValid || !this.selectedCaregiverForEdit || this.editCaregiverForm.invalid) {
      return;
    }

    const formValue = this.editCaregiverForm.value;
    const originalRelationship = this.selectedCaregiverForEdit.relationship;
    const newRelationship = formValue.relationship;

    // Creare il DTO per l'aggiornamento (escludendo la relazione come richiesto)
    const caregiverDTO: CaregiverDTO = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone,
      address: formValue.address,
      dateOfBirth: formValue.dateOfBirth.toString(),
      fiscalCode: formValue.fiscalCode,
      gender: formValue.gender
    };

    // Chiamata al service per aggiornare il caregiver
    this.caregiverService.updateCaregiver(this.selectedCaregiverForEdit.id!, caregiverDTO).subscribe({
      next: (response) => {
        console.log('Caregiver aggiornato con successo:', response);
        
        // Se la relazione è cambiata, aggiorniamola
        if (newRelationship !== originalRelationship && this.patient?.id) {
          this.updateCaregiverRelationship(this.selectedCaregiverForEdit!.id!, this.patient.id, newRelationship);
        } else {
          this.closeEditModal();
          this.showFeedbackMessage('Caregiver modificato con successo', 'success');
          this.loadCaregivers();
        }
      },
      error: (error) => {
        console.error('Errore durante l\'aggiornamento del caregiver:', error);
        this.showFeedbackMessage('Errore durante l\'aggiornamento del caregiver', 'error');
      }
    });
  }

  private updateCaregiverRelationship(caregiverId: number, patientId: number, newRelationship: string): void {
    // Prima otteniamo l'ID dell'associazione
    this.patientCaregiverService.getAssociationByPatientAndCaregiver(patientId, caregiverId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const associationId = response.data.idAssociation;
          
          // Ora aggiorniamo la relazione
          this.patientCaregiverService.updateRelationship(associationId, newRelationship).subscribe({
            next: (updateResponse) => {
              if (updateResponse.success) {
                this.closeEditModal();
                this.showFeedbackMessage('Caregiver e relazione aggiornati con successo', 'success');
                this.loadCaregivers();
              } else {
                this.showFeedbackMessage('Errore durante l\'aggiornamento della relazione', 'error');
              }
            },
            error: (error) => {
              console.error('Errore durante l\'aggiornamento della relazione:', error);
              this.showFeedbackMessage('Errore durante l\'aggiornamento della relazione', 'error');
            }
          });
        } else {
          this.showFeedbackMessage('Impossibile trovare l\'associazione paziente-caregiver', 'error');
        }
      },
      error: (error) => {
        console.error('Errore durante il recupero dell\'associazione:', error);
        this.showFeedbackMessage('Errore durante il recupero dell\'associazione', 'error');
      }
    });
  }
} 