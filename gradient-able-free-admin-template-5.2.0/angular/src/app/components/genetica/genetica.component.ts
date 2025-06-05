import { Component, OnInit } from '@angular/core';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { PatientService } from 'src/app/services/patient.service';
import { PedigreeService } from 'src/app/services/pedigree.service';
import { Patient } from 'src/app/models/patient.model';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-genetica',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './genetica.component.html',
  styleUrls: ['./genetica.component.scss']
})
export class GeneticaComponent implements OnInit {
  
  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  loadingPatients: boolean = false;
  error: string | null = null;
  searchTerm: string = '';

  // New properties for pedigree status
  pedigreeExists: { [patientId: number]: boolean } = {};
  checkingPedigreeStatus: { [patientId: number]: boolean } = {};

  constructor(
    private patientService: PatientService,
    private pedigreeService: PedigreeService,
    private router: Router
  ) { }

  /**
   * Inizializza la componente caricando i pazienti e configurando l'ascolto degli eventi di navigazione
   * per rilevare quando l'utente torna dal visualizzatore di pedigree
   */
  ngOnInit(): void {
    this.loadPatients();
    
    // Listen for navigation events to detect return from pedigree viewer
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      filter((event: NavigationEnd) => event.url === '/dashboard/genetica')
    ).subscribe(() => {
      this.handleReturnFromPedigreeViewer();
    });
  }

  /**
   * Carica tutti i pazienti dal servizio backend e avvia il controllo dello stato dei pedigree
   * Gestisce gli stati di caricamento e gli eventuali errori
   */
  loadPatients(): void {
    this.loadingPatients = true;
    this.error = null;
    
    this.patientService.getAllPatients().subscribe({
      next: (patients: Patient[]) => {
        this.patients = patients;
        this.filteredPatients = patients; // Inizialmente mostra tutti i pazienti
        this.loadingPatients = false;
        console.log('Pazienti caricati:', patients);
        
        // Check pedigree status for all patients
        this.checkPedigreeStatusForAllPatients();
      },
      error: (error) => {
        this.error = 'Errore nel caricamento dei pazienti';
        this.loadingPatients = false;
        console.error('Errore:', error);
      }
    });
  }

  /**
   * Verifica lo stato del pedigree per tutti i pazienti caricati
   * Determina se ogni paziente ha già un pedigree esistente nel database
   */
  checkPedigreeStatusForAllPatients(): void {
    this.patients.forEach(patient => {
      if (patient.id) {
        this.checkingPedigreeStatus[patient.id] = true;
        
        this.pedigreeService.exists(patient.id).subscribe({
          next: (response) => {
            if (patient.id) {
              this.pedigreeExists[patient.id] = response.success;
              this.checkingPedigreeStatus[patient.id] = false;
              console.log(`Paziente ${patient.firstName} ${patient.lastName} - Pedigree exists: ${response.success}`);
            }
          },
          error: (error) => {
            if (patient.id) {
              this.pedigreeExists[patient.id] = false;
              this.checkingPedigreeStatus[patient.id] = false;
              console.error(`Errore controllo pedigree per paziente ${patient.id}:`, error);
            }
          }
        });
      }
    });
  }

  /**
   * Determina la classe CSS appropriata per il pulsante del pedigree in base allo stato del paziente
   * @param patient - Il paziente per cui determinare la classe del pulsante
   * @returns La classe CSS da applicare al pulsante
   */
  getPedigreeButtonClass(patient: Patient): string {
    if (!patient.id || this.checkingPedigreeStatus[patient.id]) {
      return 'btn-outline-secondary';
    }
    return this.pedigreeExists[patient.id] ? 'btn-outline-dark' : 'btn-outline-success';
  }

  /**
   * Determina l'icona appropriata per il pulsante del pedigree in base allo stato del paziente
   * @param patient - Il paziente per cui determinare l'icona
   * @returns La classe dell'icona da mostrare
   */
  getPedigreeButtonIcon(patient: Patient): string {
    if (!patient.id) return 'feather icon-help-circle';
    return this.pedigreeExists[patient.id] ? 'feather icon-edit' : 'feather icon-plus';
  }

  /**
   * Determina il testo appropriato per il pulsante del pedigree in base allo stato del paziente
   * @param patient - Il paziente per cui determinare il testo del pulsante
   * @returns Il testo da mostrare sul pulsante
   */
  getPedigreeButtonText(patient: Patient): string {
    if (!patient.id || this.checkingPedigreeStatus[patient.id]) {
      return 'Controllo...';
    }
    return this.pedigreeExists[patient.id] ? 'Visualizza/Modifica' : 'Crea Pedigree';
  }

  /**
   * Gestisce l'azione del pulsante pedigree, determinando se creare un nuovo pedigree o modificarne uno esistente
   * @param patient - Il paziente per cui eseguire l'azione del pedigree
   */
  handlePedigreeAction(patient: Patient): void {
    if (!patient.id) {
      console.error('ID paziente non valido');
      return;
    }
    
    const pedigreeExists = this.pedigreeExists[patient.id];
    const mode = pedigreeExists ? 'EDIT' : 'CREATE';
    
    console.log(`Navigating to pedigree viewer for patient ${patient.firstName} ${patient.lastName} (ID: ${patient.id}) in ${mode} mode`);
    
    // Use the new secure navigation approach with only patient ID
    if (pedigreeExists) {
      this.viewEditPedigree(patient);
    } else {
      this.createPedigree(patient);
    }
  }

  /**
   * Calcola l'età del paziente in base alla sua data di nascita
   * @param dateOfBirth - La data di nascita del paziente
   * @returns L'età calcolata in anni
   */
  calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Filtra la lista dei pazienti in base al termine di ricerca inserito dall'utente
   * La ricerca viene effettuata su nome e cognome (case-insensitive)
   */
  filterPatients(): void {
    if (!this.searchTerm.trim()) {
      this.filteredPatients = this.patients;
    } else {
      const searchLower = this.searchTerm.toLowerCase().trim();
      this.filteredPatients = this.patients.filter(patient => 
        patient.firstName.toLowerCase().includes(searchLower) ||
        patient.lastName.toLowerCase().includes(searchLower)
      );
    }
  }

  /**
   * Gestisce il cambiamento del valore nel campo di ricerca
   * Viene chiamato ad ogni modifica dell'input di ricerca
   */
  onSearchChange(): void {
    this.filterPatients();
  }

  /**
   * Aggiorna lo stato del pedigree per un singolo paziente specifico
   * Utilizzato per ottimizzare le prestazioni evitando di ricaricare tutti i pazienti
   * @param patientId - L'ID del paziente di cui aggiornare lo stato
   */
  refreshSinglePatientPedigreeStatus(patientId: number): void {
    if (!patientId) {
      console.warn('Cannot refresh pedigree status: invalid patient ID');
      return;
    }
    
    console.log(`Refreshing pedigree status for patient ${patientId}`);
    this.checkingPedigreeStatus[patientId] = true;
    
    this.pedigreeService.exists(patientId).subscribe({
      next: (response) => {
        this.pedigreeExists[patientId] = response.success;
        this.checkingPedigreeStatus[patientId] = false;
        console.log(`Updated pedigree status for patient ${patientId}: ${response.success}`);
      },
      error: (error) => {
        this.pedigreeExists[patientId] = false;
        this.checkingPedigreeStatus[patientId] = false;
        console.error(`Error updating pedigree status for patient ${patientId}:`, error);
      }
    });
  }

  /**
   * Gestisce il ritorno dell'utente dal visualizzatore di pedigree
   * Controlla se c'è un paziente che è stato recentemente modificato e aggiorna il suo stato
   */
  handleReturnFromPedigreeViewer(): void {
    // Check if there's a patient that was recently edited
    const lastEditedPatientId = this.getLastEditedPatientId();
    if (lastEditedPatientId) {
      console.log(`Detected return from pedigree viewer for patient ${lastEditedPatientId}`);
      this.refreshSinglePatientPedigreeStatus(lastEditedPatientId);
      this.clearLastEditedPatientId();
    }
  }

  /**
   * Recupera l'ID dell'ultimo paziente modificato dal sessionStorage
   * @returns L'ID del paziente o null se non trovato o non valido
   */
  private getLastEditedPatientId(): number | null {
    const storedId = sessionStorage.getItem('lastEditedPatientId');
    if (storedId) {
      const patientId = parseInt(storedId, 10);
      return isNaN(patientId) ? null : patientId;
    }
    return null;
  }

  /**
   * Rimuove l'ID dell'ultimo paziente modificato dal sessionStorage
   * Utilizzato per pulire i dati temporanei dopo l'aggiornamento
   */
  private clearLastEditedPatientId(): void {
    sessionStorage.removeItem('lastEditedPatientId');
  }

  /**
   * Naviga al visualizzatore di pedigree in modalità creazione per un nuovo pedigree
   * @param patient - Il paziente per cui creare un nuovo pedigree
   */
  createPedigree(patient: Patient): void {
    if (!patient.id) {
      console.error('Patient ID is required for pedigree creation');
      return;
    }
    
    console.log('Navigating to create pedigree for patient:', patient.id);
    this.router.navigate(['/pedigree-viewer'], {
      queryParams: {
        patientId: patient.id,
        mode: 'CREATE'
      }
    });
  }

  /**
   * Naviga al visualizzatore di pedigree in modalità visualizzazione/modifica per un pedigree esistente
   * @param patient - Il paziente di cui visualizzare/modificare il pedigree
   */
  viewEditPedigree(patient: Patient): void {
    if (!patient.id) {
      console.error('Patient ID is required for pedigree viewing/editing');
      return;
    }
    
    console.log('Navigating to view/edit pedigree for patient:', patient.id);
    this.router.navigate(['/pedigree-viewer'], {
      queryParams: {
        patientId: patient.id,
        mode: 'EDIT'
      }
    });
  }
} 