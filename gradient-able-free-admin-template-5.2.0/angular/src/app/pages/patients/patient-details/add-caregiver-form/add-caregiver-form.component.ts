import { Component, EventEmitter, Input, Output, SimpleChanges, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { CaregiverService } from '../../../../services/caregiver.service';
import { CaregiverDTO } from '../../../../models/caregiver-dto.model';
import { PatientCaregiverAssociationService } from '../../../../services/patient-caregiver-association.service';
import { PatientCaregiverAssociationDTO } from '../../../../models/patient-caregiver-association-dto.model';

@Component({
  selector: 'app-add-caregiver-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-caregiver-form.component.html',
  styleUrls: ['./add-caregiver-form.component.scss']
})
export class AddCaregiverFormComponent implements OnChanges {
  @Input() patientId!: number;
  @Input() caregiverData: any = null;
  @Input() readonlyFields: boolean = false;
  @Output() cancelForm = new EventEmitter<void>();
  @Output() submitCaregiver = new EventEmitter<any>();

  caregiverForm: FormGroup;
  submitted = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private caregiverService: CaregiverService,
    private patientCaregiverAssociationService: PatientCaregiverAssociationService
  ) {
    this.caregiverForm = this.fb.group({
      id: [null],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [
        Validators.required, 
        this.phoneValidator()
      ]],
      address: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      fiscalCode: ['', [
        Validators.required,
        Validators.minLength(16),
        Validators.maxLength(16),
        this.fiscalCodeValidator()
      ]],
      gender: ['', Validators.required],
      relationship: ['', Validators.required]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['caregiverData'] && this.caregiverData) {
      this.caregiverForm.patchValue({
        id: this.caregiverData.id || null,
        firstName: this.caregiverData.firstName || '',
        lastName: this.caregiverData.lastName || '',
        email: this.caregiverData.email || '',
        phone: this.caregiverData.phone || '',
        address: this.caregiverData.address || '',
        dateOfBirth: this.caregiverData.dateOfBirth || '',
        fiscalCode: this.caregiverData.fiscalCode || '',
        gender: this.caregiverData.gender || ''
      });
      console.log('Valore di gender ricevuto dal back-end:', this.caregiverData.gender);
    }
    if (changes['readonlyFields']) {
      const fields = ['firstName', 'lastName', 'email', 'phone', 'address', 'dateOfBirth', 'fiscalCode'];
      fields.forEach(field => {
        if (this.readonlyFields) {
          this.caregiverForm.get(field)?.disable();
        } else {
          this.caregiverForm.get(field)?.enable();
        }
      });
      // La relazione resta sempre abilitata
      this.caregiverForm.get('relationship')?.enable();
    }
  }

  // Validator personalizzato per il numero di telefono
  phoneValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const value = control.value;
      
      if (!value) {
        return null; // Lascia gestire il required validator
      }
      
      // Rimuovi spazi, trattini, parentesi e segno più
      const cleanedValue = value.replace(/[\s()-+]/g, '');
      
      // Verifica che contenga solo numeri
      const isValid = /^\d+$/.test(cleanedValue);
      
      return isValid ? null : { 'invalidPhone': { value: value } };
    };
  }

  // Validator personalizzato per il codice fiscale
  fiscalCodeValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const value = control.value;
      
      if (!value) {
        return null; // Lascia gestire il required validator
      }

      // Verifica che il codice fiscale corrisponda al pattern richiesto
      const isValid = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/.test(value);
      
      return isValid ? null : { 
        'invalidFiscalCode': { 
          value: value,
          message: 'Il codice fiscale deve essere composto da:\n' +
                  '- 6 lettere maiuscole\n' +
                  '- 2 numeri\n' +
                  '- 1 lettera maiuscola\n' +
                  '- 2 numeri\n' +
                  '- 1 lettera maiuscola\n' +
                  '- 3 numeri\n' +
                  '- 1 lettera maiuscola'
        } 
      };
    };
  }

  // Getter per accedere facilmente ai form controls
  get f() { return this.caregiverForm.controls; }

  onSubmit() {
    this.submitted = true;
    this.errorMessage = null;

    if (this.caregiverForm.valid) {
      const formValue = this.caregiverForm.value;
      const caregiverData: CaregiverDTO & { id?: number } = {
        id: formValue.id,
        firstName: formValue.firstName,
        lastName: formValue.lastName,
        email: formValue.email,
        phone: formValue.phone,
        address: formValue.address,
        dateOfBirth: formValue.dateOfBirth ? formValue.dateOfBirth.toString() : '',
        fiscalCode: formValue.fiscalCode,
        gender: formValue.gender
      };

      this.submitCaregiver.emit({
        caregiver: caregiverData,
        relationship: formValue.relationship
      });
    }
  }

  onCancel() {
    this.cancelForm.emit();
  }

  getGenderLabel(gender: string): string {
    switch (gender) {
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
} 