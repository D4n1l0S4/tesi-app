import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CaregiverService } from '../../services/caregiver.service';
import { CaregiverResponse } from '../../models/caregiver-response.model';

@Component({
  selector: 'app-search-caregiver-by-fiscal-code',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-caregiver-by-fiscal-code.component.html',
  styleUrls: ['./search-caregiver-by-fiscal-code.component.scss']
})
export class SearchCaregiverByFiscalCodeComponent {
  searchForm: FormGroup;
  searchResult: CaregiverResponse | null = null;
  errorMessage: string | null = null;
  fiscalCodeError: string = '';
  isFiscalCodeValid: boolean = false;
  @Output() caregiverFound = new EventEmitter<any>();
  @Output() caregiverNotFound = new EventEmitter<string>();
  @Output() cancel = new EventEmitter<void>();
  showNotFoundMessage = false;

  constructor(
    private fb: FormBuilder,
    private caregiverService: CaregiverService
  ) {
    this.searchForm = this.fb.group({
      fiscalCode: ['', [Validators.required, Validators.minLength(16), Validators.maxLength(16)]]
    });
  }

  onFiscalCodeChange(event: any): void {
    const fiscalCode = event.target.value.toUpperCase();
    this.searchForm.patchValue({ fiscalCode }, { emitEvent: false });
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

  isFieldInvalid(fieldName: string): boolean {
    const field = this.searchForm.get(fieldName);
    return field ? (field.invalid && (field.dirty || field.touched)) : false;
  }

  onSubmit(): void {
    if (this.searchForm.invalid || !this.isFiscalCodeValid) {
      return;
    }

    const fiscalCode = this.searchForm.get('fiscalCode')?.value;
    this.errorMessage = null;
    this.searchResult = null;
    this.showNotFoundMessage = false;

    this.caregiverService.findByFiscalCode(fiscalCode).subscribe({
      next: (response) => {
        if (response.success) {
          this.searchResult = response.data;
          this.errorMessage = null;
          this.caregiverFound.emit(response.data);
        } else {
          this.searchResult = null;
          this.errorMessage = null;
          this.showNotFoundMessage = true;
          console.log('Messaggio dal backend:(questa stampa viene fatta nel SearchCaregiverByFiscalCodeComponent.ts)', response.message);
        }
      },
      error: (error) => {
        this.searchResult = null;
        this.errorMessage = 'Si è verificato un errore durante la ricerca del caregiver. Riprova più tardi.';
        console.error('Errore nella ricerca del caregiver:', error);
      }
    });
  }

  onProceedToAddCaregiver(): void {
    this.showNotFoundMessage = false;
    const fiscalCode = this.searchForm.get('fiscalCode')?.value || '';
    this.caregiverNotFound.emit(fiscalCode);
  }

  onCancel(): void {
    this.cancel.emit();
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