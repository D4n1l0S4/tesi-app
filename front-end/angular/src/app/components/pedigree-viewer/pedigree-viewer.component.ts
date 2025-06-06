import { Component, OnInit, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { PedigreeService } from 'src/app/services/pedigree.service';
import { PatientService } from 'src/app/services/patient.service';
import { AuthService } from 'src/app/services/auth-service.service';
import { PedigreeResponseDto } from 'src/app/models/pedigree-response-dto.model';
import { PedigreeRequestDto } from 'src/app/models/pedigree-request-dto.model';
import { Patient } from 'src/app/models/patient.model';
import { Subscription } from 'rxjs';
import { CanComponentDeactivate } from 'src/app/guards/unsaved-changes.guard';

// Declare global variables for PedigreeJS
declare var pedigreejs: any;
declare var $: any;
declare var window: any;

@Component({
  selector: 'app-pedigree-viewer',
  standalone: true,
  imports: [SharedModule],
  templateUrl: './pedigree-viewer.component.html',
  styleUrls: ['./pedigree-viewer.component.scss']
})
export class PedigreeViewerComponent implements OnInit, OnDestroy, AfterViewInit, CanComponentDeactivate {
  
  // Route parameters
  patient!: Patient;
  mode: 'CREATE' | 'EDIT' = 'CREATE';
  
  // Component state
  currentPedigree: PedigreeResponseDto | null = null;
  loading: boolean = false;
  saving: boolean = false;
  error: string | null = null;
  showUnsavedDialog: boolean = false;
  showResetDialog: boolean = false;
  isNavigatingToPatients: boolean = false; // Track if navigating specifically to patients list
  
  // Success dialog state
  showSuccessDialog: boolean = false;
  successDialogTitle: string = '';
  successDialogMessage: string = '';
  successDialogDetails: string[] = [];
  
  // I/O state management
  ioMessage: string | null = null;
  ioMessageType: 'success' | 'error' | 'info' = 'info';
  
  // PedigreeJS state
  pedigreeInitialized: boolean = false;
  pedigreeOptions: any = null;
  
  // Track when pedigree was loaded to avoid immediate false positives
  private pedigreeLoadedAt: number = 0;
  
  // Track original creator for existing pedigrees
  private originalCreatedBy?: number;
  
  // Subscriptions
  private routeSubscription: Subscription | null = null;

  // New property to handle deactivation promise
  private deactivationPromise: Promise<boolean> | null = null;
  private deactivationResolve: ((value: boolean) => void) | null = null;

  // Guard per prevenire inizializzazioni multiple
  private isInitializing: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private pedigreeService: PedigreeService,
    private patientService: PatientService,
    private authService: AuthService
  ) { }

  /**
   * Inizializza la componente sottoscrivendosi ai parametri della route
   * Estrae l'ID del paziente e la modalità (CREATE/EDIT) dai query parameters
   */
  ngOnInit(): void {
    this.routeSubscription = this.route.queryParams.subscribe(params => {
      try {
        // Parse patient ID and mode from URL parameters
        const patientId = params['patientId'] ? parseInt(params['patientId'], 10) : null;
        this.mode = params['mode'] || 'CREATE';
        
        if (!patientId || isNaN(patientId)) {
          this.error = 'ID paziente non valido';
          return;
        }
        
        console.log('PedigreeViewer initialized with:', {
          patientId: patientId,
          mode: this.mode
        });
        
        // Load patient data by ID
        this.loadPatientData(patientId);
        
      } catch (error) {
        console.error('Error parsing URL parameters:', error);
        this.error = 'Parametri URL non validi';
      }
    });
  }

  /**
   * Carica i dati del paziente dal servizio backend utilizzando l'ID fornito
   * Valida i dati ricevuti e avvia l'inizializzazione quando i dati sono pronti
   * @param patientId - L'ID del paziente da caricare
   */
  private loadPatientData(patientId: number): void {
    this.loading = true;
    this.error = null;
    
    this.patientService.getPatientById(patientId).subscribe({
      next: (patient: Patient) => {
        this.patient = patient;
        this.loading = false;
        
        console.log('Patient data loaded:', {
          patientId: this.patient.id,
          patientName: `${this.patient.firstName} ${this.patient.lastName}`,
          patientGender: this.patient.gender,
          mode: this.mode
        });
        
        // Validate patient data
        if (!this.patient.id || !this.patient.firstName || !this.patient.lastName || !this.patient.gender) {
          this.error = 'Dati paziente incompleti';
          return;
        }
        
        // Patient data is loaded, trigger initialization
        this.initializeWhenReady();
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Errore nel caricamento dei dati del paziente';
        console.error('Error loading patient data:', error);
      }
    });
  }

  /**
   * Hook del ciclo di vita Angular chiamato dopo che la vista è stata inizializzata
   * Non avvia più l'inizializzazione per evitare doppie chiamate
   */
  ngAfterViewInit(): void {
    // Rimosso initializeWhenReady() per evitare doppia inizializzazione
    // L'inizializzazione viene gestita solo da loadPatientData()
    console.log('ngAfterViewInit: View initialized, waiting for patient data');
  }

  /**
   * Controlla se tutti i prerequisiti sono soddisfatti per inizializzare PedigreeJS
   * Implementa un guard per prevenire inizializzazioni multiple
   */
  private initializeWhenReady(): void {
    // Guard: previeni inizializzazioni multiple
    if (this.isInitializing) {
      console.log('Initialization already in progress, skipping...');
      return;
    }

    // Check if patient data is loaded and valid
    if (this.patient && this.patient.id && this.patient.firstName && this.patient.lastName && this.patient.gender && !this.error && !this.loading) {
      this.isInitializing = true;
      
      // Increased delay to ensure DOM is fully rendered, especially after navigation
      setTimeout(() => {
        this.initializePedigreeViewer();
        this.isInitializing = false;
      }, 200);
    } else if (!this.error && !this.loading) {
      // Patient data not yet loaded, wait a bit and try again (solo una volta)
      setTimeout(() => {
        this.initializeWhenReady();
      }, 100);
    }
  }

  /**
   * Cleanup quando il componente viene distrutto
   * Rimuove subscription e distrugge PedigreeJS per evitare memory leaks
   */
  ngOnDestroy(): void {
    // Unsubscribe from route changes
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
      this.routeSubscription = null;
    }
    
    // Cleanup dialog interceptors
    $(document).off('dialogopen.pedigreeViewer');
    $(document).off('dialogresize.pedigreeViewer');
    
    // Rimuovi il riferimento globale
    if ((window as any).currentPedigreeComponent === this) {
      delete (window as any).currentPedigreeComponent;
    }
    
    // Reset initialization guard
    this.isInitializing = false;
    
    // Destroy PedigreeJS instance
    this.destroyPedigreeJS();
  }

  /**
   * Inizializza il visualizzatore di pedigree determinando se caricare un pedigree esistente o crearne uno nuovo
   * Punto di ingresso principale per l'inizializzazione di PedigreeJS
   */
  initializePedigreeViewer(): void {
    this.error = null;
    this.pedigreeInitialized = false;
    
    if (this.mode === 'EDIT') {
      this.loadExistingPedigree();
    } else {
      this.prepareNewPedigree();
    }
  }

  /**
   * Carica un pedigree esistente dal database per il paziente corrente
   * Utilizzato quando la modalità è 'EDIT'
   */
  loadExistingPedigree(): void {
    if (!this.patient.id) {
      this.error = 'ID paziente non valido';
      return;
    }
    
    this.loading = true;
    
    this.pedigreeService.getByPatient(this.patient.id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.currentPedigree = response.data;
          
          // Save original creator ID for later use in save operation
          this.originalCreatedBy = response.data.createdBy;
          
          console.log('Pedigree caricato:', this.currentPedigree);
          console.log('Original creator ID:', this.originalCreatedBy);
          
          // Initialize PedigreeJS with existing data
          if (this.currentPedigree && this.currentPedigree.data) {
            // ✅ FIX: Normalizza i dati caricati dal database prima di passarli a PedigreeJS
            // Questo previene errori con proprietà undefined/null che causano problemi di rendering
            console.log('Dati grezzi dal database:', this.currentPedigree.data);
            const normalizedData = this.normalizePedigreeData(this.currentPedigree.data);
            console.log('Dati normalizzati per PedigreeJS:', normalizedData);
            
            // Verifica che i dati normalizzati siano validi
            if (normalizedData && Array.isArray(normalizedData) && normalizedData.length > 0) {
              this.initializePedigreeJS(normalizedData);
              // Set loaded timestamp to avoid immediate false positives
              this.pedigreeLoadedAt = Date.now();
            } else {
              this.error = 'Dati pedigree non validi dopo la normalizzazione';
              console.error('Normalizzazione fallita:', { original: this.currentPedigree.data, normalized: normalizedData });
            }
          } else {
            this.error = 'Dati pedigree non validi';
          }
        } else {
          this.error = 'Errore nel caricamento del pedigree: ' + response.message;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Errore di rete nel caricamento del pedigree';
        this.loading = false;
        console.error('Errore caricamento pedigree:', err);
      }
    });
  }

  /**
   * Prepara un nuovo pedigree per il paziente corrente
   * Crea un dataset iniziale con il paziente come proband (soggetto principale)
   */
  prepareNewPedigree(): void {
    const patientFullName = `${this.patient.firstName} ${this.patient.lastName}`;
    console.log('Preparazione nuovo pedigree per paziente:', patientFullName);
    
    // Create initial dataset with the patient as proband
    const initialDataset = this.createInitialDataset();
    this.initializePedigreeJS(initialDataset);
    
    // Set loaded timestamp for new pedigrees too
    this.pedigreeLoadedAt = Date.now();
  }

  /**
   * Crea il dataset iniziale per un nuovo pedigree con il paziente come proband
   * Converte i dati del paziente nel formato richiesto da PedigreeJS
   * @returns Array contenente i dati iniziali del pedigree
   */
  createInitialDataset(): any[] {
    if (!this.patient.id) {
      throw new Error('ID paziente non valido');
    }
    
    // Create unique ID for the patient using name + ID convention
    const patientFullName = `${this.patient.firstName} ${this.patient.lastName}`;
    const patientId = this.generatePedigreeId(patientFullName, this.patient.id);
    
    // Use the actual patient gender from the Patient model
    // Convert to PedigreeJS format: M/F/U (Male/Female/Unknown)
    let sex = 'U'; // Default to Unknown
    if (this.patient.gender) {
      const gender = this.patient.gender.toUpperCase();
      if (gender === 'MALE' || gender === 'M' || gender === 'MASCHIO') {
        sex = 'M';
      } else if (gender === 'FEMALE' || gender === 'F' || gender === 'FEMMINA') {
        sex = 'F';
      }
    }
    
    console.log(`Using patient gender: ${this.patient.gender} -> PedigreeJS sex: ${sex}`);
    
    // Calcola età e anno di nascita dalla data di nascita del paziente
    const age = this.calculateAge(this.patient.dateOfBirth);
    const yob = this.extractYearOfBirth(this.patient.dateOfBirth);
    
    console.log(`Patient age: ${age}, year of birth: ${yob}`);
    
    // Crea il nodo del pedigree con tutte le informazioni disponibili
    const pedigreeNode: any = {
        "name": patientId,
        "display_name": patientFullName,
        "sex": sex,
        "proband": true,
        "top_level": true
    };
    
    // Aggiungi età se calcolata correttamente
    if (age !== null && age >= 0) {
      pedigreeNode.age = age;
    }
    
    // Aggiungi anno di nascita se disponibile
    if (yob !== null && yob > 0) {
      pedigreeNode.yob = yob;
    }
    
    return [pedigreeNode];
  }

  /**
   * Calcola l'età attuale del paziente dalla sua data di nascita
   * Gestisce sia oggetti Date che stringhe dal backend JSON
   * @param dateOfBirth - La data di nascita del paziente
   * @returns L'età in anni o null se la data non è valida
   */
  private calculateAge(dateOfBirth: Date | string): number | null {
    if (!dateOfBirth) {
      return null;
    }
    
    try {
      // Gestisci sia Date che string
      const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : new Date(dateOfBirth);
      const today = new Date();
      
      // Verifica che la data sia valida
      if (isNaN(birthDate.getTime())) {
        console.warn('Data di nascita non valida:', dateOfBirth);
        return null;
      }
      
      // Calcola l'età
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      // Aggiusta l'età se il compleanno non è ancora passato quest'anno
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      // Verifica che l'età sia ragionevole (tra 0 e 150 anni)
      if (age < 0 || age > 150) {
        console.warn('Età calcolata non ragionevole:', age);
        return null;
      }
      
      return age;
    } catch (error) {
      console.error('Errore nel calcolo dell\'età:', error);
      return null;
    }
  }

  /**
   * Estrae l'anno di nascita dalla data di nascita del paziente
   * Gestisce sia oggetti Date che stringhe dal backend JSON
   * @param dateOfBirth - La data di nascita del paziente
   * @returns L'anno di nascita o null se la data non è valida
   */
  private extractYearOfBirth(dateOfBirth: Date | string): number | null {
    if (!dateOfBirth) {
      return null;
    }
    
    try {
      // Gestisci sia Date che string
      const birthDate = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : new Date(dateOfBirth);
      
      // Verifica che la data sia valida
      if (isNaN(birthDate.getTime())) {
        console.warn('Data di nascita non valida per estrazione anno:', dateOfBirth);
        return null;
      }
      
      const year = birthDate.getFullYear();
      
      // Verifica che l'anno sia ragionevole (tra 1900 e anno corrente)
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear) {
        console.warn('Anno di nascita non ragionevole:', year);
        return null;
      }
      
      return year;
    } catch (error) {
      console.error('Errore nell\'estrazione dell\'anno di nascita:', error);
      return null;
    }
  }

  /**
   * Genera un ID univoco per il pedigree combinando il nome del paziente e il suo ID
   * @param patientName - Il nome completo del paziente
   * @param patientId - L'ID numerico del paziente
   * @returns Un ID univoco per il pedigree
   */
  generatePedigreeId(patientName: string, patientId: number): string {
    // Remove spaces and special characters, add ID
    const cleanName = patientName.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
    return `${cleanName}${patientId}`;
  }

  /**
   * Inizializza la libreria PedigreeJS con il dataset fornito
   * Implementa un meccanismo di retry per assicurare che gli elementi DOM siano pronti
   * Include guard per prevenire inizializzazioni multiple
   * @param dataset - I dati del pedigree da visualizzare
   */
  initializePedigreeJS(dataset: any): void {
    // Guard aggiuntivo per prevenire inizializzazioni multiple
    if (this.pedigreeInitialized) {
      console.log('PedigreeJS already initialized, destroying first...');
      this.destroyPedigreeJS();
    }

    try {
      // Check if required DOM elements exist with retry mechanism
      const checkDOMElements = (retryCount = 0): boolean => {
        const containerElement = document.getElementById('pedigree-container');
        const buttonsElement = document.getElementById('pedigree-buttons');
        
        if (!containerElement || !buttonsElement) {
          if (retryCount < 5) {
            setTimeout(() => {
              if (checkDOMElements(retryCount + 1)) {
                this.proceedWithInitialization(dataset);
              }
            }, 100);
            return false;
          } else {
            throw new Error(`Required DOM elements not found after ${retryCount} retries`);
          }
        }
        
        return true;
      };
      
      // Start DOM check
      if (checkDOMElements()) {
        this.proceedWithInitialization(dataset);
      }
      
    } catch (error: any) {
      console.error('Error initializing PedigreeJS:', error);
      this.error = 'Errore nell\'inizializzazione dell\'editor pedigree: ' + error.message;
      this.isInitializing = false; // Reset guard on error
    }
  }

  /**
   * Procede con l'inizializzazione effettiva di PedigreeJS dopo aver verificato i prerequisiti
   * Configura le opzioni e avvia la libreria
   * @param dataset - I dati del pedigree da visualizzare
   */
  private proceedWithInitialization(dataset: any): void {
    try {
      // Debug: Check if PedigreeJS is loaded
      if (typeof pedigreejs === 'undefined') {
        throw new Error('PedigreeJS library not loaded');
      }
      
      if (typeof pedigreejs.pedigreejs === 'undefined') {
        throw new Error('PedigreeJS.pedigreejs not found');
      }
      
      if (typeof pedigreejs.pedigreejs.build !== 'function') {
        throw new Error('PedigreeJS.pedigreejs.build is not a function');
      }
      
      // Configure PedigreeJS options
      this.pedigreeOptions = {
        'targetDiv': 'pedigree-container',
        'btn_target': 'pedigree-buttons', // ← FIX: Usa ID statico che corrisponde al template
        'width': 800,
        'height': 600,
        'symbol_size': 35,
        'edit': true,
        'store_type': 'session',
        'zoomIn': 0.5,
        'zoomOut': 1.5,
        'font_size': '0.75em',
        'font_family': 'Helvetica',
        'font_weight': 700,
        'diseases': [
          {'type': 'breast_cancer', 'colour': '#F68F35'},
          {'type': 'ovarian_cancer', 'colour': '#4DAA4D'},
          {'type': 'pancreatic_cancer', 'colour': '#4289BA'},
          {'type': 'prostate_cancer', 'colour': '#D5494A'},
          {'type': 'diabetes', 'colour': '#9B59B6'},
          {'type': 'heart_disease', 'colour': '#E74C3C'}
        ],
        'labels': ['age', 'yob'],
        'DEBUG': false
      };

      // ✅ FIX CRITICO: Pulisci la cache PRIMA di impostare i nuovi dati
      // Questo previene l'uso di dati corrotti dalla cache precedente
      try {
        if (typeof pedigreejs.pedigreejs_pedcache !== 'undefined') {
          console.log('Clearing PedigreeJS cache before initialization...');
          pedigreejs.pedigreejs_pedcache.clear(this.pedigreeOptions);
        }
      } catch (cacheError) {
        console.warn('Could not clear PedigreeJS cache:', cacheError);
      }

      // ✅ FIX CRITICO: FORZA l'uso dei dati normalizzati invece della cache
      // Non controllare la cache esistente - usa sempre i dati che abbiamo normalizzato
      console.log('Using provided normalized dataset (bypassing cache)');
      this.pedigreeOptions.dataset = Array.isArray(dataset) ? dataset : [dataset];
      
      // Valida i dati prima di passarli a PedigreeJS
      if (!this.pedigreeOptions.dataset || this.pedigreeOptions.dataset.length === 0) {
        throw new Error('Dataset is empty or invalid');
      }
      
      // Log dei dati che stiamo passando a PedigreeJS per debug
      console.log('Final dataset for PedigreeJS:', {
        length: this.pedigreeOptions.dataset.length,
        sample: this.pedigreeOptions.dataset[0],
        allNames: this.pedigreeOptions.dataset.map((p: any) => p.name || 'unnamed')
      });
      
      // Verifica che ogni persona abbia le proprietà essenziali
      for (let i = 0; i < this.pedigreeOptions.dataset.length; i++) {
        const person = this.pedigreeOptions.dataset[i];
        if (!person || typeof person !== 'object') {
          throw new Error(`Person at index ${i} is not a valid object`);
        }
        if (!person.name) {
          throw new Error(`Person at index ${i} has no name property`);
        }
        if (!person.sex) {
          throw new Error(`Person at index ${i} has no sex property`);
        }
      }
      
      // Initialize PedigreeJS using the correct API
      this.pedigreeOptions = pedigreejs.pedigreejs.build(this.pedigreeOptions);
      this.pedigreeInitialized = true;
      
      console.log('PedigreeJS initialized successfully with clean data');
      
      // Force enable pointer events on all buttons after initialization
      setTimeout(() => {
        const buttons = $('#pedigree-buttons button, #pedigree-buttons input[type="button"]');
        buttons.css({
          'pointer-events': 'auto',
          'cursor': 'pointer',
          'z-index': '100'
        });
        
        // IMPORTANTE: Aggiungi listener per intercettare la creazione del dialog
        this.setupDialogInterceptor();
      }, 500);
      
    } catch (error: any) {
      console.error('Error in PedigreeJS initialization process:', error);
      this.error = 'Errore nell\'inizializzazione dell\'editor pedigree: ' + error.message;
      this.isInitializing = false; // Reset guard on error
    }
  }

  /**
   * Distrugge l'istanza corrente di PedigreeJS e pulisce completamente gli elementi DOM
   * Utilizzato per evitare memory leaks e conflitti durante la reinizializzazione
   */
  destroyPedigreeJS(): void {
    if (this.pedigreeInitialized) {
      try {
        console.log('Destroying PedigreeJS instance...');
        
        // Clear the containers completamente
        const containers = ['#pedigree-container', '#pedigree-buttons', '#node_properties'];
        containers.forEach(selector => {
          const element = $(selector);
          if (element.length > 0) {
            element.empty();
            element.removeData(); // Rimuovi tutti i dati jQuery associati
            element.off(); // Rimuovi tutti gli event listeners
          }
        });
        
        // Clear PedigreeJS cache se disponibile
        try {
          if (this.pedigreeOptions && typeof pedigreejs !== 'undefined' && pedigreejs.pedigreejs_pedcache) {
            pedigreejs.pedigreejs_pedcache.clear(this.pedigreeOptions);
          }
        } catch (cacheError) {
          console.warn('Could not clear PedigreeJS cache:', cacheError);
        }
        
        // Reset state
        this.pedigreeInitialized = false;
        this.pedigreeOptions = null;
        this.pedigreeLoadedAt = 0;
        
        console.log('PedigreeJS destroyed successfully');
      } catch (error) {
        console.error('Error destroying PedigreeJS:', error);
      }
    }
    
    // Reset initialization guard
    this.isInitializing = false;
  }

  /**
   * Recupera i dati correnti del pedigree dalla cache di PedigreeJS
   * Valida e normalizza i dati prima di restituirli
   * @returns I dati correnti del pedigree o null se non disponibili
   */
  getCurrentPedigreeData(): any {
    if (!this.pedigreeInitialized || !this.pedigreeOptions) {
      console.warn('PedigreeJS not initialized or options not available');
      return null;
    }
    
    try {
      // console.log('Retrieving current pedigree data from PedigreeJS cache...');
      
      // Get current pedigree data from PedigreeJS
      // For bundled version: pedigreejs.pedigreejs_pedcache.current()
      const currentData = pedigreejs.pedigreejs_pedcache.current(this.pedigreeOptions);
      
      // Validate the data
      if (!currentData) {
        console.warn('No pedigree data found in cache');
        return null;
      }
      
      if (!Array.isArray(currentData)) {
        console.warn('Pedigree data is not an array:', typeof currentData);
        return null;
      }
      
      if (currentData.length === 0) {
        console.warn('Pedigree data array is empty');
        return null;
      }
      
      // console.log(`Raw pedigree data retrieved: ${currentData.length} individuals`);
      
      // Log sample of raw data for debugging
      if (currentData.length > 0) {
        const samplePerson = currentData[0];
        const sampleProps = Object.keys(samplePerson);
        // console.log('Sample person properties from PedigreeJS:', sampleProps);
        
        // Check for disease properties in sample
        const diseaseProps = sampleProps.filter(prop => 
          prop.includes('cancer') || prop.includes('diabetes') || prop.includes('heart')
        );
        if (diseaseProps.length > 0) {
          // console.log('Disease properties found in raw data:', diseaseProps);
        }
        
        // Check for relationship properties
        const relationProps = sampleProps.filter(prop => 
          ['mother', 'father', 'mztwin', 'dztwin'].includes(prop)
        );
        if (relationProps.length > 0) {
          // console.log('Relationship properties found in raw data:', relationProps);
        }
      }
      
      // Normalize the data (preserving all relevant properties)
      const normalizedData = this.normalizePedigreeData(currentData);
      
      // console.log(`Normalized pedigree data: ${normalizedData.length} individuals`);
      
      // Verify data integrity after normalization
      if (normalizedData.length !== currentData.length) {
        console.error('Data loss during normalization! Original:', currentData.length, 'Normalized:', normalizedData.length);
      }
      
      // Check if diseases are preserved
      const originalDiseases = currentData.reduce((count, person) => {
        const diseases = ['breast_cancer', 'ovarian_cancer', 'pancreatic_cancer', 'prostate_cancer', 'diabetes', 'heart_disease'];
        return count + diseases.filter(disease => person[disease]).length;
      }, 0);
      
      const normalizedDiseases = normalizedData.reduce((count, person) => {
        const diseases = ['breast_cancer', 'ovarian_cancer', 'pancreatic_cancer', 'prostate_cancer', 'diabetes', 'heart_disease'];
        return count + diseases.filter(disease => person[disease]).length;
      }, 0);
      
      if (originalDiseases !== normalizedDiseases) {
        console.error('Disease data loss during normalization! Original diseases:', originalDiseases, 'Normalized diseases:', normalizedDiseases);
      } else if (originalDiseases > 0) {
        // console.log(`✅ Disease data preserved: ${originalDiseases} disease entries maintained`);
      }
      
      // Check if relationships are preserved
      const originalRelations = currentData.reduce((count, person) => {
        return count + (person.mother ? 1 : 0) + (person.father ? 1 : 0);
      }, 0);
      
      const normalizedRelations = normalizedData.reduce((count, person) => {
        return count + (person.mother ? 1 : 0) + (person.father ? 1 : 0);
      }, 0);
      
      if (originalRelations !== normalizedRelations) {
        console.error('Relationship data loss during normalization! Original relations:', originalRelations, 'Normalized relations:', normalizedRelations);
      } else if (originalRelations > 0) {
        // console.log(`✅ Relationship data preserved: ${originalRelations} parent relationships maintained`);
      }
      
      return normalizedData;
      
    } catch (error) {
      console.error('Error getting current pedigree data:', error);
      return null;
    }
  }

  /**
   * Determina se ci sono modifiche non salvate confrontando i dati correnti con quelli originali
   * Implementa logica per evitare falsi positivi subito dopo il caricamento
   * @returns true se ci sono modifiche non salvate, false altrimenti
   */
  hasUnsavedChanges(): boolean {
    // If PedigreeJS is not initialized, no changes possible
    if (!this.pedigreeInitialized || this.pedigreeLoadedAt === 0) {
      return false;
    }
    
    // Avoid false positives immediately after loading
    const timeSinceLoad = Date.now() - this.pedigreeLoadedAt;
    if (timeSinceLoad < 2000) { // 2 seconds grace period
      return false;
    }
    
    try {
    const currentData = this.getCurrentPedigreeData();
    if (!currentData) {
        return false; // No current data means no changes
    }
    
      // For CREATE mode, any data beyond the initial proband indicates changes
    if (this.mode === 'CREATE') {
        // Check if there's more than just the initial proband
        if (currentData.length > 1) {
          // console.log('CREATE mode: Changes detected - more than initial proband');
          return true;
    }
    
        // Check if the proband has been modified (has additional properties)
        const proband = currentData.find((person: any) => person.proband === true);
        if (proband) {
          const expectedKeys = ['name', 'display_name', 'sex', 'proband', 'top_level', 'age', 'yob'];
          const actualKeys = Object.keys(proband);
          const hasExtraProperties = actualKeys.some(key => !expectedKeys.includes(key));
          if (hasExtraProperties) {
            // console.log('CREATE mode: Changes detected - proband has additional properties');
            return true;
          }
        }
        
        return false;
      }
      
      // For EDIT mode, compare with original data using deep comparison
      if (this.mode === 'EDIT' && this.currentPedigree && this.currentPedigree.data) {
        const originalData = this.normalizePedigreeData(this.currentPedigree.data);
        const normalizedCurrentData = this.normalizePedigreeData(currentData);
        
        // Compare lengths first (quick check)
        if (normalizedCurrentData.length !== originalData.length) {
          // console.log('EDIT mode: Changes detected - different number of individuals');
          return true;
        }
        
        // Deep comparison of actual data
        const hasChanges = this.deepCompareData(originalData, normalizedCurrentData);
        if (hasChanges) {
          // console.log('EDIT mode: Changes detected - data content differs');
          return true;
        }
        
        // console.log('EDIT mode: No changes detected - data matches original');
        return false;
        }
        
      return false;
      
      } catch (error) {
      console.error('Error checking for unsaved changes:', error);
      return false; // Assume no changes if we can't determine
    }
  }

  /**
   * Confronta profondamente due array di dati del pedigree per rilevare differenze
   * @param original - Dati originali normalizzati
   * @param current - Dati correnti normalizzati
   * @returns true se ci sono differenze, false se sono identici
   */
  private deepCompareData(original: any[], current: any[]): boolean {
    if (original.length !== current.length) {
      return true;
    }
    
    // Create maps for easier comparison by name
    const originalMap = new Map();
    const currentMap = new Map();
    
    original.forEach(person => originalMap.set(person.name, person));
    current.forEach(person => currentMap.set(person.name, person));
    
    // Check if all original people exist in current data
    for (const [name, originalPerson] of originalMap) {
      const currentPerson = currentMap.get(name);
      
      if (!currentPerson) {
        // console.log(`Person removed: ${name}`);
        return true;
      }
      
      // Compare all properties of the person
      if (this.comparePersonData(originalPerson, currentPerson)) {
        // console.log(`Person modified: ${name}`);
        return true;
      }
    }
    
    // Check if any new people were added
    for (const [name] of currentMap) {
      if (!originalMap.has(name)) {
        // console.log(`Person added: ${name}`);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Confronta i dati di due persone per rilevare differenze
   * @param original - Dati originali della persona
   * @param current - Dati correnti della persona
   * @returns true se ci sono differenze, false se sono identici
   */
  private comparePersonData(original: any, current: any): boolean {
    // Lista espansa di proprietà rilevanti per PedigreeJS
    const relevantProps = [
      // Proprietà base
      'name', 'display_name', 'sex', 'mother', 'father', 
      'proband', 'top_level', 'age', 'yob', 'status',
      
      // Malattie principali
      'breast_cancer', 'ovarian_cancer', 'pancreatic_cancer', 
      'prostate_cancer', 'diabetes', 'heart_disease',
      
      // Età di diagnosi delle malattie
      'breast_cancer_diagnosis_age', 'breast_cancer2_diagnosis_age',
      'ovarian_cancer_diagnosis_age', 'pancreatic_cancer_diagnosis_age',
      'prostate_cancer_diagnosis_age', 'diabetes_diagnosis_age',
      'heart_disease_diagnosis_age',
      
      // Gemelli e adozione
      'mztwin', 'dztwin', 'adopted_in', 'adopted_out', 'noparents',
      
      // Test genetici
      'brca1_gene_test', 'brca2_gene_test', 'palb2_gene_test',
      'atm_gene_test', 'chek2_gene_test', 'bard1_gene_test',
      'rad51d_gene_test', 'rad51c_gene_test', 'brip1_gene_test',
      'hoxb13_gene_test',
      
      // Marcatori patologici
      'er_bc_pathology', 'pr_bc_pathology', 'her2_bc_pathology',
      'ck14_bc_pathology', 'ck56_bc_pathology',
      
      // Etnia e altre proprietà mediche
      'ashkenazi', 'carrier_probs', 'risk_factors',
      
      // Proprietà di layout e posizionamento (importanti per PedigreeJS)
      'x', 'y', 'depth', 'level', 'order',
      
      // Altre proprietà PedigreeJS
      'hidden', 'exclude', 'comments', 'notes'
    ];
    
    for (const prop of relevantProps) {
      const originalValue = original[prop];
      const currentValue = current[prop];
      
      // Handle undefined/null values
      if (originalValue !== currentValue) {
        // Special handling for undefined vs null vs empty string
        if ((originalValue == null && currentValue != null) || 
            (originalValue != null && currentValue == null) ||
            (originalValue !== currentValue)) {
          // console.log(`Property changed: ${prop} from "${originalValue}" to "${currentValue}"`);
          return true;
        }
      }
    }
    
    return false;
  }

  /**
   * Normalizza i dati del pedigree rimuovendo proprietà interne e validando la struttura
   * Utilizzato sia durante il salvataggio che durante il caricamento per garantire consistenza
   * @param data - I dati del pedigree da normalizzare (array o singolo oggetto)
   * @returns Array normalizzato di persone del pedigree
   */
  private normalizePedigreeData(data: any): any[] {
    if (!data) {
      console.warn('normalizePedigreeData: dati null o undefined');
      return [];
    }
    
    // Converti in array se necessario
    const dataArray = Array.isArray(data) ? data : [data];
    
    if (dataArray.length === 0) {
      console.warn('normalizePedigreeData: array vuoto');
      return [];
    }
    
    // console.log(`Normalizzazione di ${dataArray.length} persone...`);
    
    const normalizedData = dataArray.map((person, index) => {
      // Verifica che la persona sia un oggetto valido
      if (!person || typeof person !== 'object') {
        console.warn(`normalizePedigreeData: persona ${index} non è un oggetto valido:`, person);
        return null;
      }
      
      // Crea una copia pulita dell'oggetto
      const cleanPerson: any = {};
      
      // Lista di proprietà da rimuovere (blacklist di proprietà interne)
      const internalProps = [
        // Proprietà interne di PedigreeJS
        'id', 'x', 'y', 'px', 'py', 'fixed', 'weight', 'index',
        // Proprietà di rendering
        'depth', 'parent', 'children', '_children', 'collapsed',
        // Proprietà temporanee
        'temp', 'tmp', 'cache', 'dirty', 'selected', 'highlighted',
        // Proprietà di debug
        'debug', 'test', '_test', '__proto__', 'constructor'
      ];
      
      // Copia tutte le proprietà eccetto quelle nella blacklist
      for (const key in person) {
        if (person.hasOwnProperty(key) && !internalProps.includes(key)) {
          const value = person[key];
          
          // Salta proprietà undefined (ma mantieni null e false)
          if (value !== undefined) {
            cleanPerson[key] = value;
          }
        }
      }
      
      // ✅ VALIDAZIONE PROPRIETÀ OBBLIGATORIE
      // Assicurati che le proprietà essenziali esistano
      if (!cleanPerson.name) {
        console.warn(`normalizePedigreeData: persona ${index} senza nome, generando nome temporaneo`);
        cleanPerson.name = `Person_${index}_${Date.now()}`;
      }
      
      if (!cleanPerson.sex) {
        console.warn(`normalizePedigreeData: persona ${index} senza sesso, impostando 'U' (Unknown)`);
        cleanPerson.sex = 'U';
      }
      
      // Valida il sesso
      if (!['M', 'F', 'U'].includes(cleanPerson.sex)) {
        console.warn(`normalizePedigreeData: sesso non valido '${cleanPerson.sex}' per persona ${index}, impostando 'U'`);
        cleanPerson.sex = 'U';
      }
      
      // ✅ VALIDAZIONE RELAZIONI FAMILIARI
      // Assicurati che mother e father siano stringhe o null
      if (cleanPerson.mother !== undefined && cleanPerson.mother !== null && typeof cleanPerson.mother !== 'string') {
        console.warn(`normalizePedigreeData: mother non valido per persona ${index}:`, cleanPerson.mother);
        delete cleanPerson.mother;
      }
      
      if (cleanPerson.father !== undefined && cleanPerson.father !== null && typeof cleanPerson.father !== 'string') {
        console.warn(`normalizePedigreeData: father non valido per persona ${index}:`, cleanPerson.father);
        delete cleanPerson.father;
      }
      
      // ✅ VALIDAZIONE PROPRIETÀ NUMERICHE
      // Valida età
      if (cleanPerson.age !== undefined && cleanPerson.age !== null) {
        const age = Number(cleanPerson.age);
        if (isNaN(age) || age < 0 || age > 150) {
          console.warn(`normalizePedigreeData: età non valida '${cleanPerson.age}' per persona ${index}, rimuovendo`);
          delete cleanPerson.age;
        } else {
          cleanPerson.age = age;
        }
      }
      
      // Valida anno di nascita
      if (cleanPerson.yob !== undefined && cleanPerson.yob !== null) {
        const yob = Number(cleanPerson.yob);
        const currentYear = new Date().getFullYear();
        if (isNaN(yob) || yob < 1900 || yob > currentYear) {
          console.warn(`normalizePedigreeData: anno di nascita non valido '${cleanPerson.yob}' per persona ${index}, rimuovendo`);
          delete cleanPerson.yob;
        } else {
          cleanPerson.yob = yob;
        }
      }
      
      // ✅ VALIDAZIONE PROPRIETÀ BOOLEANE
      // Normalizza proprietà booleane
      const booleanProps = ['proband', 'top_level', 'adopted_in', 'noparents', 'mztwin', 'dztwin'];
      booleanProps.forEach(prop => {
        if (cleanPerson[prop] !== undefined && cleanPerson[prop] !== null) {
          cleanPerson[prop] = Boolean(cleanPerson[prop]);
        }
      });
      
      return cleanPerson;
    }).filter(person => person !== null); // Rimuovi persone non valide
    
    // console.log(`Normalizzazione completata: ${normalizedData.length} persone valide`);
    
    return normalizedData;
  }

  /**
   * Costruisce un oggetto PedigreeRequestDto dai dati correnti per l'invio al backend
   * @param currentData - I dati correnti del pedigree
   * @returns L'oggetto DTO pronto per l'invio o null se i dati non sono validi
   */
  buildPedigreeRequestDto(currentData: any): PedigreeRequestDto | null {
    if (!currentData || !Array.isArray(currentData) || currentData.length === 0) {
      console.error('Invalid current data for building request DTO');
      return null;
    }
    
    if (!this.patient.id) {
      console.error('Patient ID is required for building request DTO');
      return null;
    }
    
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) {
      console.error('Current user ID is required for building request DTO');
      return null;
    }
    
    // console.log('Building PedigreeRequestDto with data validation...');
    
    // Validate data integrity before sending to backend
    const dataValidation = {
      totalIndividuals: currentData.length,
      individualsWithDiseases: 0,
      individualsWithRelations: 0,
      individualsWithAges: 0,
      diseaseTypes: new Set(),
      relationTypes: new Set()
    };
    
    currentData.forEach((person, index) => {
      // Check for diseases
      const diseases = ['breast_cancer', 'ovarian_cancer', 'pancreatic_cancer', 'prostate_cancer', 'diabetes', 'heart_disease'];
      const personDiseases = diseases.filter(disease => person[disease]);
      if (personDiseases.length > 0) {
        dataValidation.individualsWithDiseases++;
        personDiseases.forEach(disease => dataValidation.diseaseTypes.add(disease));
        
        // Check for diagnosis ages
        personDiseases.forEach(disease => {
          const ageKey = `${disease}_diagnosis_age`;
          if (person[ageKey]) {
            // console.log(`Person ${person.name || person.display_name} has ${disease} diagnosed at age ${person[ageKey]}`);
          }
        });
      }
      
      // Check for relationships
      if (person.mother || person.father) {
        dataValidation.individualsWithRelations++;
        if (person.mother) dataValidation.relationTypes.add('mother');
        if (person.father) dataValidation.relationTypes.add('father');
      }
      
      // Check for twin relationships
      if (person.mztwin || person.dztwin) {
        dataValidation.relationTypes.add(person.mztwin ? 'mztwin' : 'dztwin');
      }
      
      // Check for age data
      if (person.age || person.yob) {
        dataValidation.individualsWithAges++;
      }
      
      // Validate essential properties
      if (!person.name || !person.sex) {
        console.warn(`Person at index ${index} missing essential properties:`, {
          name: person.name,
          sex: person.sex,
          display_name: person.display_name
        });
      }
    });
    
    // Log validation results
    // console.log('Data validation results:', {
    //   totalIndividuals: dataValidation.totalIndividuals,
    //   individualsWithDiseases: dataValidation.individualsWithDiseases,
    //   individualsWithRelations: dataValidation.individualsWithRelations,
    //   individualsWithAges: dataValidation.individualsWithAges,
    //   diseaseTypes: Array.from(dataValidation.diseaseTypes),
    //   relationTypes: Array.from(dataValidation.relationTypes)
    // });
    
    // Create the request DTO
    const requestDto: PedigreeRequestDto = {
      patientId: this.patient.id,
      data: currentData, // Send the complete normalized data
      createdBy: this.originalCreatedBy || currentUserId, // Use original creator for existing pedigrees
      modifiedBy: currentUserId
    };
    
    // console.log('Built PedigreeRequestDto:', {
    //   patientId: requestDto.patientId,
    //   dataLength: Array.isArray(requestDto.data) ? requestDto.data.length : 'N/A',
    //   createdBy: requestDto.createdBy,
    //   modifiedBy: requestDto.modifiedBy,
    //   mode: this.mode,
    //   dataIntegrity: {
    //     hasCompleteData: dataValidation.totalIndividuals > 0,
    //     preservesDiseases: dataValidation.individualsWithDiseases > 0,
    //     preservesRelations: dataValidation.individualsWithRelations > 0,
    //     preservesAges: dataValidation.individualsWithAges > 0
    //   }
    // });
    
    return requestDto;
  }

  /**
   * Pulisce la cache di PedigreeJS per il paziente corrente
   * Utilizzato per forzare un refresh completo dei dati
   */
  clearPedigreeCache(): void {
    if (!this.pedigreeOptions) {
      return;
    }
    
    try {
      // Clear the pedigree cache for this specific patient
      pedigreejs.pedigreejs_pedcache.clear_pedigree_data(this.pedigreeOptions);
      // console.log(`Cleared pedigree cache for patient ${this.patient.id}`);
    } catch (error) {
      console.error('Error clearing pedigree cache:', error);
    }
  }

  /**
   * Salva il pedigree corrente nel database
   * Gestisce la validazione, la costruzione del DTO e l'invio al backend
   */
  savePedigree(): void {
    // Validate that we have a current user
    const currentUserId = this.getCurrentUserId();
    if (!currentUserId) {
      this.error = 'Utente non autenticato. Effettua il login per salvare.';
      return;
    }
    
    // Get current pedigree data
    const currentData = this.getCurrentPedigreeData();
    if (!currentData) {
      this.error = 'Impossibile ottenere i dati del pedigree. Verifica che ci siano dati da salvare.';
      return;
    }
    
    // Check if there are actually changes to save
    if (!this.hasUnsavedChanges()) {
      this.showSuccessMessage(
        'Nessuna modifica da salvare',
        'Il pedigree è già aggiornato e non ci sono modifiche da salvare.',
        ['Tutte le modifiche sono già state salvate in precedenza']
      );
      return;
    }
    
    // Build the PedigreeRequestDto
    const requestDto = this.buildPedigreeRequestDto(currentData);
    if (!requestDto) {
      this.error = 'Errore nella preparazione dei dati per il salvataggio.';
      return;
    }
    
    // Start saving process
    this.saving = true;
    this.error = null;
    
    this.pedigreeService.save(requestDto).subscribe({
      next: (response) => {
        this.saving = false;
        
        if (response.success && response.data) {
          console.log('Pedigree salvato con successo');
          
          // Update current pedigree with saved data
          this.currentPedigree = response.data;
          
          // CRITICAL: Sync the data property with what was actually saved
          // This ensures hasUnsavedChanges() works correctly after saving
          if (this.currentPedigree && currentData) {
            this.currentPedigree.data = [...currentData]; // Deep copy of saved data
          }
          
          // Update original creator ID for future saves
          this.originalCreatedBy = response.data.createdBy;
          
          // Switch to EDIT mode if we were creating
          if (this.mode === 'CREATE') {
            this.mode = 'EDIT';
          }
          
          // IMPORTANTE: Aggiorna il timestamp per sincronizzare lo stato con gli altri bottoni
          this.pedigreeLoadedAt = Date.now();
          
          // Track this patient for intelligent refresh
          if (this.patient.id) {
            sessionStorage.setItem('lastEditedPatientId', this.patient.id.toString());
          }
          
          // Show custom success dialog instead of native alert
          this.showSuccessMessage(
            'Pedigree salvato con successo!',
            'Il pedigree è stato salvato correttamente nell\'archivio.',
            [
              `ID Pedigree: ${response.data.id}`,
              `Paziente: ${this.patient.firstName} ${this.patient.lastName}`
            ]
          );
          
        } else {
          this.error = 'Errore nel salvataggio: ' + (response.message || 'Risposta non valida dal server');
          console.error('Errore salvataggio pedigree:', response);
        }
      },
      error: (err) => {
        this.saving = false;
        this.error = 'Errore di rete durante il salvataggio. Riprova più tardi.';
        console.error('Errore chiamata servizio salvataggio:', err);
      }
    });
  }

  /**
   * Resetta il pedigree corrente ricaricando i dati originali
   * Chiede conferma all'utente prima di procedere
   */
  resetPedigree(): void {
    console.log('Reset pedigree requested');
    // Show custom detailed reset dialog instead of native confirm
    this.showResetDialog = true;
  }

  /**
   * Conferma il reset del pedigree dopo aver mostrato il dialog dettagliato
   */
  confirmReset(): void {
    console.log('Reset pedigree confirmed');
    this.showResetDialog = false;
    
    try {
      // Clear the cache before reinitializing
      this.clearPedigreeCache();
      
      // Always reinitialize with just the patient as proband
      // This ensures we start fresh regardless of CREATE or EDIT mode
      this.prepareNewPedigree();
      
      // Show success message
      this.showIOMessage('✅ Pedigree resettato con successo! Ora è presente solo il paziente come proband.', 'success');
      
    } catch (error) {
      console.error('Errore durante il reset:', error);
      this.showIOMessage('❌ Errore durante il reset del pedigree: ' + error, 'error');
    }
  }

  /**
   * Annulla il reset del pedigree
   */
  cancelReset(): void {
    console.log('Reset pedigree cancelled');
    this.showResetDialog = false;
    // Just close the dialog, user remains in the editor with current state
  }

  /**
   * Mostra il dialog di successo personalizzato
   */
  showSuccessMessage(title: string, message: string, details?: string[]): void {
    this.successDialogTitle = title;
    this.successDialogMessage = message;
    this.successDialogDetails = details || [];
    this.showSuccessDialog = true;
    }

  /**
   * Chiude il dialog di successo
   */
  closeSuccessDialog(): void {
    this.showSuccessDialog = false;
    this.successDialogTitle = '';
    this.successDialogMessage = '';
    this.successDialogDetails = [];
  }

  /**
   * Gestisce la navigazione di ritorno alla lista pazienti
   * Controlla se ci sono modifiche non salvate e mostra il dialog appropriato
   */
  goBackToPatients(): void {
    // Set flag to indicate we're navigating specifically to patients list
    this.isNavigatingToPatients = true;
    
    // Check for unsaved changes before navigating away
    if (this.hasUnsavedChanges()) {
      // Show custom dialog instead of native confirm
      this.showUnsavedDialog = true;
      return;
    }
    
    // No unsaved changes, navigate directly
    this.navigateToPatientsList();
  }

  /**
   * Salva il pedigree nel database e poi permette la navigazione
   * Modificato per gestire il guard di navigazione
   */
  saveAndExit(): void {
    console.log('saveAndExit() called');
    const wasNavigatingToPatients = this.isNavigatingToPatients;
    this.showUnsavedDialog = false;
    this.isNavigatingToPatients = false; // Reset flag
    
    // Get current pedigree data
    const currentData = this.getCurrentPedigreeData();
    if (!currentData) {
      this.error = 'Impossibile ottenere i dati del pedigree per il salvataggio.';
      this.resolveDeactivation(false); // Non permettere la navigazione se c'è un errore
      return;
    }
    
    // Build the PedigreeRequestDto
    const requestDto = this.buildPedigreeRequestDto(currentData);
    if (!requestDto) {
      this.error = 'Errore nella preparazione dei dati per il salvataggio.';
      this.resolveDeactivation(false); // Non permettere la navigazione se c'è un errore
      return;
    }
    
    // Start saving process
    this.saving = true;
    this.error = null;
    
    this.pedigreeService.save(requestDto).subscribe({
      next: (response) => {
        this.saving = false;
        
        if (response.success && response.data) {
          console.log('Pedigree salvato con successo prima dell\'uscita');
          
          // Aggiorna lo stato interno anche quando si salva ed esce
          this.currentPedigree = response.data;
          
          // CRITICAL: Sync the data property with what was actually saved
          if (this.currentPedigree && currentData) {
            this.currentPedigree.data = [...currentData]; // Deep copy of saved data
          }
          
          this.originalCreatedBy = response.data.createdBy;
          this.pedigreeLoadedAt = Date.now();
          
          // Switch to EDIT mode if we were creating
          if (this.mode === 'CREATE') {
            this.mode = 'EDIT';
          }
          
          // Track this patient for intelligent refresh
          if (this.patient.id) {
            sessionStorage.setItem('lastEditedPatientId', this.patient.id.toString());
          }
          
          // If we were specifically navigating to patients, go there directly
          // Otherwise, just allow the navigation to proceed to wherever the user was going
          if (wasNavigatingToPatients) {
          this.navigateToPatientsList();
            this.resolveDeactivation(false); // Don't allow guard navigation since we're handling it manually
          } else {
            this.resolveDeactivation(true); // Allow the original navigation to proceed
          }
          
        } else {
          this.error = 'Errore nel salvataggio: ' + (response.message || 'Risposta non valida dal server');
          console.error('Errore salvataggio pedigree:', response);
          this.resolveDeactivation(false); // Non permettere la navigazione se il salvataggio fallisce
        }
      },
      error: (err) => {
        this.saving = false;
        this.error = 'Errore di rete durante il salvataggio. Riprova più tardi.';
        console.error('Errore chiamata servizio salvataggio:', err);
        this.resolveDeactivation(false); // Non permettere la navigazione se c'è un errore di rete
      }
    });
  }

  /**
   * Esce senza salvare nel database ma mantiene le modifiche nella cache del browser
   * Modificato per gestire il guard di navigazione
   */
  exitWithoutSaving(): void {
    console.log('exitWithoutSaving() called');
    const wasNavigatingToPatients = this.isNavigatingToPatients;
    this.showUnsavedDialog = false;
    this.isNavigatingToPatients = false; // Reset flag
    
    // Track this patient for intelligent refresh
    if (this.patient.id) {
      sessionStorage.setItem('lastEditedPatientId', this.patient.id.toString());
    }
    
    // If we were specifically navigating to patients, go there directly
    // Otherwise, just allow the navigation to proceed to wherever the user was going
    if (wasNavigatingToPatients) {
    this.navigateToPatientsList();
      this.resolveDeactivation(false); // Don't allow guard navigation since we're handling it manually
    } else {
      this.resolveDeactivation(true); // Allow the original navigation to proceed
    }
  }

  /**
   * Chiude il dialog di conferma e rimane nell'editor
   * Modificato per gestire il guard di navigazione
   */
  stayHere(): void {
    console.log('stayHere() called');
    this.showUnsavedDialog = false;
    this.isNavigatingToPatients = false; // Reset flag
    // Non permettere la navigazione, l'utente vuole rimanere
    this.resolveDeactivation(false);
  }

  /**
   * Naviga alla lista dei pazienti (pagina genetica)
   * Metodo privato utilizzato dalle altre funzioni di navigazione
   */
  private navigateToPatientsList(): void {
    this.router.navigate(['/dashboard/genetica']);
  }

  /**
   * Restituisce il titolo della pagina in base alla modalità corrente
   * @returns Il titolo appropriato per la modalità CREATE o EDIT
   */
  getPageTitle(): string {
    return this.mode === 'CREATE' ? 'Crea Pedigree' : 'Modifica Pedigree';
  }

  /**
   * Restituisce l'icona appropriata per la pagina in base alla modalità corrente
   * @returns La classe CSS dell'icona appropriata
   */
  getPageIcon(): string {
    return this.mode === 'CREATE' ? 'feather icon-plus' : 'feather icon-edit';
  }

  /**
   * Recupera l'ID dell'utente correntemente autenticato
   * @returns L'ID dell'utente corrente o null se non autenticato
   */
  getCurrentUserId(): number | null {
    const currentUser = this.authService.currentUserValue;
    return currentUser?.userId || null;
  }

  /**
   * Configura un interceptor per i dialog jQuery UI per forzare il posizionamento centrato
   * e assicurarsi che non tocchino mai i bordi dello schermo
   */
  private setupDialogInterceptor(): void {
    // Intercetta l'evento di apertura del dialog
    $(document).off('dialogopen.pedigreeViewer').on('dialogopen.pedigreeViewer', (event: any, ui: any) => {
      const dialog = $(event.target);
      const dialogWidget = dialog.closest('.ui-dialog');
      
      if (dialogWidget.length > 0) {
        console.log('Dialog aperto, applicando stili di centratura e margini');
        
        // Forza il posizionamento e le dimensioni con margini di sicurezza
        this.forceDialogCentering(dialogWidget);
        
        // Riapplica gli stili ogni volta che il dialog viene ridimensionato
        dialog.off('dialogresize.pedigreeViewer').on('dialogresize.pedigreeViewer', () => {
          setTimeout(() => this.forceDialogCentering(dialogWidget), 10);
        });
      }
    });
    
    // Intercetta anche la creazione di nuovi dialog
    const originalDialog = ($ as any).fn.dialog;
    if (originalDialog) {
      ($ as any).fn.dialog = function(options: any) {
        const result = originalDialog.apply(this, arguments);
        
        // Se è una chiamata di inizializzazione (non getter)
        if (typeof options === 'object' || options === undefined) {
          const self = this;
          setTimeout(() => {
            const dialogWidget = self.closest('.ui-dialog');
            if (dialogWidget.length > 0) {
              console.log('Nuovo dialog creato, applicando stili');
              // Riferimento al metodo della classe
              const component = (window as any).currentPedigreeComponent;
              if (component && component.forceDialogCentering) {
                component.forceDialogCentering(dialogWidget);
              }
            }
          }, 50);
        }
        
        return result;
      };
    }
    
    // Salva il riferimento al componente per l'interceptor
    (window as any).currentPedigreeComponent = this;
  }
  
  /**
   * Forza il centraggio del dialog con margini di sicurezza
   * @param dialogWidget - L'elemento jQuery del dialog widget
   */
  private forceDialogCentering(dialogWidget: any): void {
    const windowWidth = $(window).width() || window.innerWidth;
    const windowHeight = $(window).height() || window.innerHeight;
    
    // Margini di sicurezza
    const marginX = 40; // 20px per lato
    const marginY = 40; // 20px sopra e sotto
    
    // Calcola le dimensioni massime
    const maxWidth = windowWidth - marginX;
    const maxHeight = windowHeight - marginY;
    
    // Ottieni le dimensioni correnti del dialog
    let dialogWidth = dialogWidget.outerWidth();
    let dialogHeight = dialogWidget.outerHeight();
    
    // Limita le dimensioni se necessario
    if (dialogWidth > maxWidth) {
      dialogWidth = maxWidth;
      dialogWidget.width(dialogWidth);
    }
    
    if (dialogHeight > maxHeight) {
      dialogHeight = maxHeight;
      dialogWidget.height(dialogHeight);
    }
    
    // Calcola la posizione centrata
    const left = (windowWidth - dialogWidth) / 2;
    const top = (windowHeight - dialogHeight) / 2;
    
    // Applica il posizionamento
    dialogWidget.css({
      'position': 'fixed',
      'left': Math.max(marginX / 2, left) + 'px',
      'top': Math.max(marginY / 2, top) + 'px',
      'max-width': maxWidth + 'px',
      'max-height': maxHeight + 'px',
      'z-index': '9999'
    });
    
    // Assicurati che il contenuto sia scrollabile se necessario
    const dialogContent = dialogWidget.find('.ui-dialog-content');
    if (dialogContent.length > 0) {
      const headerHeight = dialogWidget.find('.ui-dialog-titlebar').outerHeight() || 0;
      const maxContentHeight = maxHeight - headerHeight - 20; // 20px di padding
      
      dialogContent.css({
        'max-height': maxContentHeight + 'px',
        'overflow-y': 'auto'
      });
    }
    
    console.log(`Dialog posizionato: ${left}px, ${top}px (${dialogWidth}x${dialogHeight})`);
  }

  /**
   * Pulisce i messaggi di stato I/O
   */
  clearIOMessage(): void {
    this.ioMessage = null;
  }

  /**
   * Mostra un messaggio di stato I/O
   */
  private showIOMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.ioMessage = message;
    this.ioMessageType = type;
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        if (this.ioMessage === message) {
          this.clearIOMessage();
        }
      }, 5000);
    }
  }

  /**
   * Esporta il pedigree corrente come PNG ad alta risoluzione
   */
  exportToPNG(): void {
    if (!this.pedigreeInitialized || !this.pedigreeOptions) {
      this.showIOMessage('Pedigree non inizializzato. Impossibile esportare.', 'error');
      return;
    }
    
    try {
      this.showIOMessage('Generazione immagine PNG in corso...', 'info');
      
      // Usa la funzione nativa di PedigreeJS per export PNG ad alta risoluzione
      (window as any).pedigreejs.pedigreejs_io.img_download(
        this.pedigreeOptions, 
        4, // 4x resolution per qualità stampa
        "image/png"
      );
      
      this.showIOMessage('✅ Immagine PNG generata con successo! Il download dovrebbe iniziare automaticamente.', 'success');
      
    } catch (error) {
      console.error('Errore export PNG:', error);
      this.showIOMessage('❌ Errore durante l\'esportazione PNG: ' + error, 'error');
    }
  }

  /**
   * Esporta il pedigree corrente come SVG vettoriale
   */
  exportToSVG(): void {
    if (!this.pedigreeInitialized || !this.pedigreeOptions) {
      this.showIOMessage('Pedigree non inizializzato. Impossibile esportare.', 'error');
      return;
    }
    
    try {
      this.showIOMessage('Generazione grafico SVG in corso...', 'info');
      
      // Crea l'SVG printable usando la stessa logica di PedigreeJS
      const printableSvg = this.createPrintableSVG();
      
      // Usa la funzione nativa di PedigreeJS per il download
      (window as any).pedigreejs.pedigreejs_io.svg_download(printableSvg);
      
      this.showIOMessage('✅ Grafico SVG generato con successo! Il download dovrebbe iniziare automaticamente.', 'success');
      
    } catch (error) {
      console.error('Errore export SVG:', error);
      this.showIOMessage('❌ Errore durante l\'esportazione SVG: ' + error, 'error');
    }
  }

  /**
   * Crea un SVG printable seguendo la logica di PedigreeJS
   */
  private createPrintableSVG(): any {
    try {
      // Ottieni i dati correnti dal cache
      const local_dataset = (window as any).pedigreejs.pedigreejs_pedcache.current(this.pedigreeOptions);
      if (local_dataset !== undefined && local_dataset !== null) {
        this.pedigreeOptions.dataset = local_dataset;
      }

      // Crea un nuovo div contenitore
      const svg_div = $('<div></div>');
      
      // Clona l'SVG esistente
      const svg = $('#' + this.pedigreeOptions.targetDiv).find('svg').clone().appendTo(svg_div);
      
      // Ottieni i bounds usando la funzione di PedigreeJS
      const bounds = (window as any).pedigreejs.pedigreejs_zoom.get_bounds(this.pedigreeOptions);
      
      // Calcola le dimensioni A4 (come fa PedigreeJS)
      const a4 = {w: (595-40), h: (842-50)};
      const d = {w: Math.abs(bounds.xmax - bounds.xmin), h: Math.abs(bounds.ymax - bounds.ymin)};
      const f = 1;
      const k = (f / Math.max(d.w/a4.w, d.h/a4.h));
      
      // Calcola le trasformazioni
      const xi = -(bounds.xmin - (this.pedigreeOptions.symbol_size)) * k;
      const yi = -(bounds.ymin - (this.pedigreeOptions.symbol_size)) * k;
      
      // Applica le dimensioni e trasformazioni all'SVG
      svg.attr('width', a4.w);
      svg.attr('height', d.h * k);
      svg.find(".diagram").attr("transform", `translate(${xi}, ${yi}) scale(${k})`);
      
      return svg_div;
      
    } catch (error) {
      console.error('Errore nella creazione dell\'SVG printable:', error);
      
      // Fallback: usa l'SVG esistente così com'è
      const svg_div = $('<div></div>');
      const svg = $('#' + this.pedigreeOptions.targetDiv).find('svg').clone().appendTo(svg_div);
      return svg_div;
    }
  }

  /**
   * Esporta i dati del pedigree in formato JSON
   */
  exportToJSON(): void {
    try {
      const currentData = this.getCurrentPedigreeData();
      if (!currentData) {
        this.showIOMessage('Nessun dato del pedigree disponibile per l\'esportazione.', 'error');
        return;
      }
      
      this.showIOMessage('Preparazione file JSON in corso...', 'info');
      
      // Crea un oggetto completo con metadati
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          patientName: `${this.patient.firstName} ${this.patient.lastName}`,
          patientId: this.patient.id,
          mode: this.mode,
          version: 'PedigreeJS v4.0.0-rc1'
        },
        pedigreeData: currentData
      };
      
      const jsonData = JSON.stringify(exportData, null, 2);
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `pedigree_${this.patient.firstName}_${this.patient.lastName}_${timestamp}.json`;
      
      this.downloadFile(jsonData, filename, 'application/json');
      this.showIOMessage(`✅ File JSON "${filename}" generato con successo!`, 'success');
      
    } catch (error) {
      console.error('Errore export JSON:', error);
      this.showIOMessage('❌ Errore durante l\'esportazione JSON: ' + error, 'error');
    }
  }

  /**
   * Esporta il pedigree in formato BOADICEA v4 (standard medico)
   */
  exportToBoadicea(): void {
    try {
      const currentData = this.getCurrentPedigreeData();
      if (!currentData) {
        this.showIOMessage('Nessun dato del pedigree disponibile per l\'esportazione.', 'error');
        return;
      }
      
      this.showIOMessage('Conversione in formato BOADICEA v4 in corso...', 'info');
      
      const boadiceaContent = this.convertToBoadiceaFormat(currentData);
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `pedigree_boadicea_${this.patient.firstName}_${this.patient.lastName}_${timestamp}.txt`;
      
      this.downloadFile(boadiceaContent, filename, 'text/plain');
      this.showIOMessage(`✅ File BOADICEA v4 "${filename}" generato con successo!`, 'success');
      
    } catch (error) {
      console.error('Errore export BOADICEA:', error);
      this.showIOMessage('❌ Errore durante l\'esportazione BOADICEA: ' + error, 'error');
    }
  }

  /**
   * Esporta il pedigree in formato CanRisk (analisi rischio avanzata)
   */
  exportToCanRisk(): void {
    try {
      const currentData = this.getCurrentPedigreeData();
      if (!currentData) {
        this.showIOMessage('Nessun dato del pedigree disponibile per l\'esportazione.', 'error');
        return;
      }
      
      this.showIOMessage('Conversione in formato CanRisk in corso...', 'info');
      
      const canriskContent = this.convertToCanRiskFormat(currentData);
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `pedigree_canrisk_${this.patient.firstName}_${this.patient.lastName}_${timestamp}.txt`;
      
      this.downloadFile(canriskContent, filename, 'text/plain');
      this.showIOMessage(`✅ File CanRisk "${filename}" generato con successo!`, 'success');
      
    } catch (error) {
      console.error('Errore export CanRisk:', error);
      this.showIOMessage('❌ Errore durante l\'esportazione CanRisk: ' + error, 'error');
    }
  }

  /**
   * Converte i dati del pedigree nel formato CanRisk v4
   */
  private convertToCanRiskFormat(data: any[]): string {
    try {
      // Usa la funzione nativa di PedigreeJS per generare il formato CanRisk
      const familyId = `FAM_${this.patient.id}`;
      const meta = this.generateCanRiskMeta();
      const version = 4; // Usa la versione più recente di CanRisk
      const ethnicity = undefined; // Potrebbe essere esteso in futuro
      
      // Chiama la funzione get_pedigree del modulo canrisk_file
      const canriskContent = (window as any).pedigreejs.pedigreejs_canrisk_file.get_pedigree(
        data, 
        familyId, 
        meta, 
        false, // isanon = false per mantenere i nomi reali
        version, 
        ethnicity
      );
      
      return canriskContent;
      
    } catch (error) {
      console.error('Errore nella conversione CanRisk:', error);
      
      // Fallback: genera un formato CanRisk semplificato manualmente
      return this.generateSimpleCanRiskFormat(data);
    }
  }

  /**
   * Genera i metadati per il formato CanRisk
   */
  private generateCanRiskMeta(): string {
    let meta = '';
    
    // Aggiungi informazioni del paziente se disponibili
    if (this.patient.dateOfBirth) {
      const age = this.calculateAge(this.patient.dateOfBirth);
      if (age !== null) {
        meta += `;AGE=${age}`;
      }
    }
    
    // Aggiungi altre informazioni se disponibili
    // Questi dati potrebbero essere estesi in futuro con form dedicati
    
    return meta;
  }

  /**
   * Genera un formato CanRisk semplificato come fallback
   */
  private generateSimpleCanRiskFormat(data: any[]): string {
    const familyId = `FAM_${this.patient.id}`;
    
    // Header CanRisk v4
    let content = '##CanRisk 4.0\n';
    content += '##FamID\tName\tTarget\tIndivID\tFathID\tMothID\tSex\tMZtwin\tDead\tAge\tYob\tBC1\tBC2\tOC\tPRO\tPAN\tAshkn\tBRCA1\tBRCA2\tPALB2\tATM\tCHEK2\tBARD1\tRAD51D\tRAD51C\tBRIP1\tHOXB13\tER:PR:HER2:CK14:CK56\n';
    
    // Converti ogni individuo
    data.forEach((person, index) => {
      const target = person.proband ? '1' : '0';
      const sex = person.sex === 'M' ? 'M' : (person.sex === 'F' ? 'F' : 'U');
      const age = person.age || '0';
      const yob = person.yob || '0';
      const status = person.status === 1 ? '1' : '0'; // 1 = dead, 0 = alive
      
      // Malattie (età diagnosi o 0 se non affetto)
      const bc1 = person.breast_cancer_diagnosis_age || (person.breast_cancer ? '50' : '0');
      const bc2 = person.breast_cancer2_diagnosis_age || '0';
      const oc = person.ovarian_cancer_diagnosis_age || (person.ovarian_cancer ? '50' : '0');
      const pro = person.prostate_cancer_diagnosis_age || (person.prostate_cancer ? '50' : '0');
      const pan = person.pancreatic_cancer_diagnosis_age || (person.pancreatic_cancer ? '50' : '0');
      
      // Genitori (0 se non specificati)
      const father = person.father || '0';
      const mother = person.mother || '0';
      
      // Gemelli monozigoti (0 se non gemello)
      const mztwin = person.mztwin || '0';
      
      // Ashkenazi (0 = no, 1 = yes)
      const ashkenazi = person.ashkenazi ? '1' : '0';
      
      // Test genetici (formato: tipo:risultato, 0:0 se non testato)
      const brca1Test = person.brca1_gene_test ? `${person.brca1_gene_test.type}:${person.brca1_gene_test.result}` : '0:0';
      const brca2Test = person.brca2_gene_test ? `${person.brca2_gene_test.type}:${person.brca2_gene_test.result}` : '0:0';
      const palb2Test = person.palb2_gene_test ? `${person.palb2_gene_test.type}:${person.palb2_gene_test.result}` : '0:0';
      const atmTest = person.atm_gene_test ? `${person.atm_gene_test.type}:${person.atm_gene_test.result}` : '0:0';
      const chek2Test = person.chek2_gene_test ? `${person.chek2_gene_test.type}:${person.chek2_gene_test.result}` : '0:0';
      const bard1Test = person.bard1_gene_test ? `${person.bard1_gene_test.type}:${person.bard1_gene_test.result}` : '0:0';
      const rad51dTest = person.rad51d_gene_test ? `${person.rad51d_gene_test.type}:${person.rad51d_gene_test.result}` : '0:0';
      const rad51cTest = person.rad51c_gene_test ? `${person.rad51c_gene_test.type}:${person.rad51c_gene_test.result}` : '0:0';
      const brip1Test = person.brip1_gene_test ? `${person.brip1_gene_test.type}:${person.brip1_gene_test.result}` : '0:0';
      const hoxb13Test = person.hoxb13_gene_test ? `${person.hoxb13_gene_test.type}:${person.hoxb13_gene_test.result}` : '0:0';
      
      // Marcatori patologici (formato: ER:PR:HER2:CK14:CK56)
      const er = person.er_bc_pathology || '0';
      const pr = person.pr_bc_pathology || '0';
      const her2 = person.her2_bc_pathology || '0';
      const ck14 = person.ck14_bc_pathology || '0';
      const ck56 = person.ck56_bc_pathology || '0';
      const pathology = `${er}:${pr}:${her2}:${ck14}:${ck56}`;
      
      // Costruisci la riga
      const row = [
        familyId, person.display_name || person.name, target, person.name,
        father, mother, sex, mztwin, status, age, yob,
        bc1, bc2, oc, pro, pan, ashkenazi,
        brca1Test, brca2Test, palb2Test, atmTest, chek2Test,
        bard1Test, rad51dTest, rad51cTest, brip1Test, hoxb13Test,
        pathology
      ].join('\t');
      
      content += row + '\n';
    });
    
    return content;
  }

  /**
   * Converte i dati del pedigree nel formato BOADICEA v4
   */
  private convertToBoadiceaFormat(data: any[]): string {
    const familyId = `FAM_${this.patient.id}`;
    
    // Header BOADICEA v4
    let content = 'BOADICEA import pedigree file format 4.0\n';
    content += 'FamID\tName\tTarget\tIndivID\tFathID\tMothID\tSex\tMZtwin\tDead\tAge\tYob\t1stBrCa\t2ndBrCa\tOvCa\tProCa\tPanCa\tAshkn\tBRCA1t\tBRCA1r\tBRCA2t\tBRCA2r\tPALB2t\tPALB2r\tATMt\tATMr\tCHEK2t\tCHEK2r\tER\tPR\tHER2\tCK14\tCK56\n';
    
    // Converti ogni individuo
    data.forEach((person, index) => {
      const target = person.proband ? '1' : '0';
      const sex = person.sex === 'M' ? 'M' : (person.sex === 'F' ? 'F' : 'U');
      const age = person.age || '0';
      const yob = person.yob || '0';
      const status = person.status === 1 ? '1' : '0'; // 1 = dead, 0 = alive
      
      // Malattie (età diagnosi o 0 se non affetto)
      const breastCancer = person.breast_cancer_diagnosis_age || (person.breast_cancer ? '50' : '0');
      const ovarianCancer = person.ovarian_cancer_diagnosis_age || (person.ovarian_cancer ? '50' : '0');
      const prostateCancer = person.prostate_cancer_diagnosis_age || (person.prostate_cancer ? '50' : '0');
      const pancreaticCancer = person.pancreatic_cancer_diagnosis_age || (person.pancreatic_cancer ? '50' : '0');
      
      // Genitori (0 se non specificati)
      const father = person.father || '0';
      const mother = person.mother || '0';
      
      // Gemelli monozigoti (0 se non gemello)
      const mztwin = person.mztwin || '0';
      
      // Test genetici (formato: tipo:risultato, 0:0 se non testato)
      const brca1Test = person.brca1_gene_test ? `${person.brca1_gene_test.type}:${person.brca1_gene_test.result}` : '0:0';
      const brca2Test = person.brca2_gene_test ? `${person.brca2_gene_test.type}:${person.brca2_gene_test.result}` : '0:0';
      const palb2Test = person.palb2_gene_test ? `${person.palb2_gene_test.type}:${person.palb2_gene_test.result}` : '0:0';
      const atmTest = person.atm_gene_test ? `${person.atm_gene_test.type}:${person.atm_gene_test.result}` : '0:0';
      const chek2Test = person.chek2_gene_test ? `${person.chek2_gene_test.type}:${person.chek2_gene_test.result}` : '0:0';
      
      // Marcatori patologici
      const er = person.er_bc_pathology || '0';
      const pr = person.pr_bc_pathology || '0';
      const her2 = person.her2_bc_pathology || '0';
      const ck14 = person.ck14_bc_pathology || '0';
      const ck56 = person.ck56_bc_pathology || '0';
      
      // Ashkenazi (0 = no, 1 = yes)
      const ashkenazi = person.ashkenazi ? '1' : '0';
      
      // Costruisci la riga
      const row = [
        familyId, person.display_name || person.name, target, person.name,
        father, mother, sex, mztwin, status, age, yob,
        breastCancer, '0', ovarianCancer, prostateCancer, pancreaticCancer,
        ashkenazi, brca1Test, brca2Test, palb2Test, atmTest, chek2Test,
        er, pr, her2, ck14, ck56
      ].join('\t');
      
      content += row + '\n';
    });
    
    return content;
  }

  /**
   * Gestisce l'import di file pedigree
   */
  importFromFile(event: any): void {
    const file = event.target.files[0];
    if (!file) return;
    
    this.showIOMessage(`Caricamento file "${file.name}" in corso...`, 'info');
    this.loading = true;
    this.error = null;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        // Determina il tipo di file e processa di conseguenza
        if (file.name.toLowerCase().endsWith('.json')) {
          this.importFromJSON(content, file.name);
        } else if (content.includes('BOADICEA') || content.includes('CanRisk')) {
          this.importFromMedicalFormat(content, file.name);
        } else if (file.name.toLowerCase().endsWith('.ped')) {
          this.importFromPEDFormat(content, file.name);
        } else {
          // Prova a rilevare automaticamente il formato
          this.importFromMedicalFormat(content, file.name);
        }
        
      } catch (error) {
        console.error('Errore import file:', error);
        this.showIOMessage(`❌ Errore durante l'importazione di "${file.name}": ${error}`, 'error');
      } finally {
        this.loading = false;
        // Reset file input
        event.target.value = '';
      }
    };
    
    reader.onerror = () => {
      this.loading = false;
      this.showIOMessage(`❌ Errore nella lettura del file "${file.name}"`, 'error');
      event.target.value = '';
    };
    
    reader.readAsText(file);
  }

  /**
   * Importa da file JSON
   */
  private importFromJSON(content: string, filename: string): void {
    try {
      const parsedData = JSON.parse(content);
      let data: any[];
      
      // Gestisci diversi formati JSON
      if (parsedData.pedigreeData && Array.isArray(parsedData.pedigreeData)) {
        // Formato con metadati
        data = parsedData.pedigreeData;
        console.log('Importato JSON con metadati:', parsedData.metadata);
      } else if (Array.isArray(parsedData)) {
        // Array diretto
        data = parsedData;
      } else {
        throw new Error('Il file JSON deve contenere un array di individui o un oggetto con proprietà "pedigreeData"');
      }
      
      if (data.length === 0) {
        throw new Error('Il file JSON non contiene dati del pedigree');
      }
      
      // Valida e inizializza con i nuovi dati
      this.initializePedigreeJS(data);
      this.mode = 'EDIT'; // Cambia in modalità edit
      this.showIOMessage(`✅ File JSON "${filename}" importato con successo! ${data.length} individui caricati.`, 'success');
      
    } catch (error) {
      throw new Error(`File JSON non valido: ${error}`);
    }
  }

  /**
   * Importa da formati medici (BOADICEA/CanRisk)
   */
  private importFromMedicalFormat(content: string, filename: string): void {
    try {
      // Usa i parser esistenti di PedigreeJS
      const parsedData = (window as any).pedigreejs.pedigreejs_io.load_data(content, this.pedigreeOptions);
      
      if (!parsedData || !Array.isArray(parsedData)) {
        throw new Error('Dati non validi nel file medico');
      }
      
      if (parsedData.length === 0) {
        throw new Error('Il file non contiene dati del pedigree');
      }
      
      this.initializePedigreeJS(parsedData);
      this.mode = 'EDIT';
      this.showIOMessage(`✅ File medico "${filename}" importato con successo! ${parsedData.length} individui caricati.`, 'success');
      
    } catch (error) {
      throw new Error(`Errore parsing formato medico: ${error}`);
    }
  }

  /**
   * Importa da formato PED (Linkage)
   */
  private importFromPEDFormat(content: string, filename: string): void {
    try {
      // Usa il parser PED di PedigreeJS
      const parsedData = (window as any).pedigreejs.pedigreejs_io.readLinkage(content.split('\n'));
      
      if (!parsedData || !Array.isArray(parsedData)) {
        throw new Error('Dati non validi nel file PED');
      }
      
      if (parsedData.length === 0) {
        throw new Error('Il file PED non contiene dati del pedigree');
      }
      
      this.initializePedigreeJS(parsedData);
      this.mode = 'EDIT';
      this.showIOMessage(`✅ File PED "${filename}" importato con successo! ${parsedData.length} individui caricati.`, 'success');
      
    } catch (error) {
      throw new Error(`Errore parsing formato PED: ${error}`);
    }
  }

  /**
   * Utility per download file
   */
  private downloadFile(content: string, filename: string, contentType: string): void {
    try {
      const blob = new Blob([content], { type: contentType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Errore download file:', error);
      throw new Error('Errore durante il download del file');
    }
  }

  /**
   * Zoom In - Ingrandisce il pedigree
   */
  zoomIn(): void {
    if (!this.pedigreeInitialized || !this.pedigreeOptions) {
      console.warn('PedigreeJS non inizializzato per zoom in');
      return;
    }
    
    try {
      // Usa la funzione btn_zoom di PedigreeJS con fattore di ingrandimento
      (window as any).pedigreejs.pedigreejs_zooming.btn_zoom(this.pedigreeOptions, 1.2);
      // console.log('Zoom in applicato');
    } catch (error) {
      console.error('Errore durante zoom in:', error);
      this.showIOMessage('❌ Errore durante lo zoom in', 'error');
    }
  }

  /**
   * Zoom Out - Rimpicciolisce il pedigree
   */
  zoomOut(): void {
    if (!this.pedigreeInitialized || !this.pedigreeOptions) {
      console.warn('PedigreeJS non inizializzato per zoom out');
      return;
    }
    
    try {
      // Usa la funzione btn_zoom di PedigreeJS con fattore di rimpicciolimento
      (window as any).pedigreejs.pedigreejs_zooming.btn_zoom(this.pedigreeOptions, 0.8);
      // console.log('Zoom out applicato');
    } catch (error) {
      console.error('Errore durante zoom out:', error);
      this.showIOMessage('❌ Errore durante lo zoom out', 'error');
    }
  }

  /**
   * Scale to Fit - Adatta il pedigree alla finestra
   */
  scaleToFit(): void {
    if (!this.pedigreeInitialized || !this.pedigreeOptions) {
      console.warn('PedigreeJS non inizializzato per scale to fit');
      return;
    }
    
    try {
      // Usa la funzione scale_to_fit di PedigreeJS
      (window as any).pedigreejs.pedigreejs_zooming.scale_to_fit(this.pedigreeOptions);
      // console.log('Scale to fit applicato');
      this.showIOMessage('✅ Pedigree adattato alla finestra', 'success');
    } catch (error) {
      console.error('Errore durante scale to fit:', error);
      this.showIOMessage('❌ Errore durante l\'adattamento alla finestra', 'error');
    }
  }

  /**
   * Toggle Fullscreen - Attiva/disattiva la modalità schermo intero
   */
  toggleFullscreen(): void {
    if (!this.pedigreeInitialized || !this.pedigreeOptions) {
      console.warn('PedigreeJS non inizializzato per fullscreen');
      return;
    }
    
    try {
      const isCurrentlyFullscreen = this.isFullscreen();
      
      if (!isCurrentlyFullscreen) {
        // Entra in fullscreen
        const targetElement = document.getElementById(this.pedigreeOptions.targetDiv);
        if (targetElement) {
          this.requestFullscreen(targetElement);
          this.showIOMessage('✅ Modalità schermo intero attivata', 'success');
        } else {
          throw new Error('Elemento target non trovato');
        }
      } else {
        // Esce da fullscreen
        this.exitFullscreen();
        this.showIOMessage('✅ Modalità schermo intero disattivata', 'success');
      }
      
      // Dopo il cambio di modalità, adatta il pedigree alla nuova dimensione
      setTimeout(() => {
        if (this.pedigreeInitialized && this.pedigreeOptions) {
          (window as any).pedigreejs.pedigreejs_zooming.scale_to_fit(this.pedigreeOptions);
        }
      }, 500);
      
    } catch (error) {
      console.error('Errore durante toggle fullscreen:', error);
      this.showIOMessage('❌ Errore durante il cambio modalità fullscreen', 'error');
    }
  }

  /**
   * Verifica se il browser è attualmente in modalità fullscreen
   */
  private isFullscreen(): boolean {
    return !!(
      (document as any).fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
  }

  /**
   * Richiede la modalità fullscreen per l'elemento specificato
   */
  private requestFullscreen(element: HTMLElement): void {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if ((element as any).webkitRequestFullscreen) {
      (element as any).webkitRequestFullscreen(); // Safari
    } else if ((element as any).mozRequestFullScreen) {
      (element as any).mozRequestFullScreen(); // Firefox
    } else if ((element as any).msRequestFullscreen) {
      (element as any).msRequestFullscreen(); // IE/Edge
    } else {
      throw new Error('Fullscreen non supportato da questo browser');
    }
  }

  /**
   * Esce dalla modalità fullscreen
   */
  private exitFullscreen(): void {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if ((document as any).webkitExitFullscreen) {
      (document as any).webkitExitFullscreen(); // Safari
    } else if ((document as any).mozCancelFullScreen) {
      (document as any).mozCancelFullScreen(); // Firefox
    } else if ((document as any).msExitFullscreen) {
      (document as any).msExitFullscreen(); // IE/Edge
    } else {
      throw new Error('Exit fullscreen non supportato da questo browser');
    }
  }

  /**
   * Print/PDF - Apre il dialog di stampa nativo del browser per stampare o salvare come PDF
   */
  printPedigree(): void {
    if (!this.pedigreeInitialized || !this.pedigreeOptions) {
      this.showIOMessage('Pedigree non inizializzato. Impossibile stampare.', 'error');
      return;
    }
    
    try {
      this.showIOMessage('Preparazione per stampa/PDF in corso...', 'info');
      
      // Crea l'SVG printable ottimizzato per stampa A4
      const printableSvg = this.createPrintableSVG();
      
      // Usa la funzione print nativa di PedigreeJS
      (window as any).pedigreejs.pedigreejs_io.print(printableSvg);
      
      this.showIOMessage('✅ Dialog di stampa aperto! Puoi stampare o salvare come PDF.', 'success');
      
    } catch (error) {
      console.error('Errore durante print/PDF:', error);
      this.showIOMessage('❌ Errore durante l\'apertura del dialog di stampa: ' + error, 'error');
    }
  }

  /**
   * Implementazione dell'interfaccia CanComponentDeactivate
   * Controlla se ci sono modifiche non salvate prima di permettere la navigazione
   * @returns Promise<boolean> che si risolve quando l'utente fa una scelta
   */
  canDeactivate(): Promise<boolean> | boolean {
    // Se non ci sono modifiche non salvate, permetti la navigazione
    if (!this.hasUnsavedChanges()) {
      return true;
    }

    // Se c'è già un dialog aperto, restituisci la promise esistente
    if (this.deactivationPromise) {
      return this.deactivationPromise;
    }

    // Reset any loading states that might interfere with dialog interaction
    this.loading = false;
    this.saving = false;

    // If this method is called without the flag being set, it means navigation 
    // is happening from somewhere other than the "Back to Patients" button
    // (e.g., sidebar, breadcrumb, browser back button, etc.)
    if (!this.isNavigatingToPatients) {
      console.log('Navigation detected from guard (not back to patients button)');
    }

    // Crea una nuova promise per gestire la scelta dell'utente
    this.deactivationPromise = new Promise<boolean>((resolve) => {
      this.deactivationResolve = resolve;
      // Mostra il dialog personalizzato
      this.showUnsavedDialog = true;
      
      // Force change detection to ensure dialog is rendered
      setTimeout(() => {
        console.log('Unsaved changes dialog shown, waiting for user choice...');
        console.log('Navigation to patients:', this.isNavigatingToPatients);
      }, 0);
    });

    return this.deactivationPromise;
  }

  /**
   * Risolve la promise di deactivation con il valore specificato
   * @param canDeactivate - true per permettere la navigazione, false per bloccarla
   */
  private resolveDeactivation(canDeactivate: boolean): void {
    if (this.deactivationResolve) {
      this.deactivationResolve(canDeactivate);
      this.deactivationResolve = null;
      this.deactivationPromise = null;
    }
  }

  /**
   * Gestisce l'evento beforeunload per avvisare l'utente di modifiche non salvate
   * quando tenta di chiudere la finestra o fare refresh della pagina
   */
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    if (this.hasUnsavedChanges()) {
      // Mostra il dialog nativo del browser per confermare l'uscita
      $event.returnValue = 'Hai modifiche non salvate. Sei sicuro di voler uscire?';
    }
  }
}
