import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PatientService } from '../../../services/patient.service';
import { Patient } from '../../../models/patient.model';

@Component({
  selector: 'app-patient-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-form.component.html',
  styleUrls: ['./patient-form.component.scss']
})
export class PatientFormComponent implements OnInit {
  @Input() patient: Patient | null = null;
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  form: FormGroup;
  isEditMode: boolean = false;
  hasChanges: boolean = false;
  fiscalCodeError: string = '';
  isFiscalCodeValid: boolean = false;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService
  ) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      fiscalCode: ['', [Validators.required, Validators.minLength(16), Validators.maxLength(16)]],
      gender: ['', Validators.required]
    });

    // Sottoscrizione ai cambiamenti del form
    this.form.valueChanges.subscribe(() => {
      this.checkForChanges();
    });
  }

  ngOnInit(): void {
    if (this.patient) {
      this.isEditMode = true;
      this.form.patchValue({
        firstName: this.patient.firstName,
        lastName: this.patient.lastName,
        dateOfBirth: this.patient.dateOfBirth,
        email: this.patient.email,
        phone: this.patient.phone,
        address: this.patient.address,
        fiscalCode: this.patient.fiscalCode,
        gender: this.patient.gender
      });
      
      // Valida il codice fiscale esistente
      if (this.patient.fiscalCode) {
        this.validateFiscalCode(this.patient.fiscalCode);
      }
    } else {
      // In modalità creazione, inizializza isFiscalCodeValid a false
      this.isFiscalCodeValid = false;
    }
  }

  onFiscalCodeChange(event: any): void {
    const fiscalCode = event.target.value.toUpperCase();
    this.form.patchValue({ fiscalCode }, { emitEvent: false });
    this.validateFiscalCode(fiscalCode);
  }

  validateFiscalCode(fiscalCode: string): void {
    this.fiscalCodeError = '';
    this.isFiscalCodeValid = true;

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
      this.fiscalCodeError = errorMessage;
      this.isFiscalCodeValid = false;
      return;
    }

    // Controllo formato
    const fiscalCodeRegex = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;
    if (!fiscalCodeRegex.test(fiscalCode)) {
      this.fiscalCodeError = errorMessage;
      this.isFiscalCodeValid = false;
      return;
    }
  }

  private checkForChanges(): void {
    if (!this.patient) {
      this.hasChanges = true;
      return;
    }

    const formValues = this.form.value;
    this.hasChanges = Object.keys(formValues).some(key => {
      return formValues[key] !== this.patient![key as keyof Patient];
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onSubmit(): void {
    console.log('🔍 DEBUG - onSubmit chiamato');
    console.log('📝 Form valid:', this.form.valid);
    console.log('🆔 Fiscal Code valid:', this.isFiscalCodeValid);
    console.log('📊 Form errors:', this.form.errors);
    console.log('📋 Form value:', this.form.value);
    console.log('🔄 Has changes:', this.hasChanges);
    
    // Stampa errori specifici per ogni campo
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      if (control && control.errors) {
        console.log(`❌ Errore nel campo ${key}:`, control.errors);
      }
    });

    if (this.form.valid && this.isFiscalCodeValid) {
      const patientData = this.form.value;
      
      if (this.isEditMode && this.patient?.id) {
        if (!this.hasChanges) {
          alert('Non sono state apportate modifiche al paziente.');
          return;
        }
        
        console.log('🚀 Chiamando updatePatient...');
        // Modifica paziente esistente
        this.patientService.updatePatient(this.patient.id, patientData).subscribe({
          next: (updatedPatient) => {
            console.log('✅ Paziente aggiornato:', updatedPatient);
            this.save.emit(updatedPatient);
            this.form.reset();
          },
          error: (error) => {
            console.error('❌ Errore durante l\'aggiornamento:', error);
            alert('Si è verificato un errore durante l\'aggiornamento del paziente.');
          }
        });
      } else {
        console.log('🚀 Chiamando createPatient...');
        // Creazione nuovo paziente
        this.patientService.createPatient(patientData).subscribe({
          next: (newPatient) => {
            console.log('✅ Nuovo paziente creato:', newPatient);
            this.save.emit(newPatient);
            this.form.reset();
          },
          error: (error) => {
            console.error('❌ Errore durante la creazione:', error);
            alert('Si è verificato un errore durante la creazione del paziente.');
          }
        });
      }
    } else {
      console.log('❌ Form non valido o codice fiscale non valido');
      console.log('📝 Form valid:', this.form.valid);
      console.log('🆔 Fiscal Code valid:', this.isFiscalCodeValid);
      console.log('📊 Fiscal Code Error:', this.fiscalCodeError);
    }
  }

  // Metodo helper per debug - chiamalo dalla console del browser
  debugFormStatus(): void {
    console.log('=== STATO DEL FORM ===');
    console.log('Valid:', this.form.valid);
    console.log('Fiscal Code Valid:', this.isFiscalCodeValid);
    console.log('Has Changes:', this.hasChanges);
    console.log('Is Edit Mode:', this.isEditMode);
    console.log('Form Value:', this.form.value);
    console.log('Form Errors:', this.form.errors);
    
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      console.log(`${key}:`, {
        value: control?.value,
        valid: control?.valid,
        errors: control?.errors
      });
    });
  }
} 