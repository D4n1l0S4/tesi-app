import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../../services/patient.service';
import { Patient } from '../../../models/patient.model';
import { TableColumn } from '../../../models/table-column.model';
import { PatientFormComponent } from '../patient-form/patient-form.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { PatientDetailsComponent } from '../patient-details/patient-details.component';

@Component({
  selector: 'app-patient-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PatientFormComponent, ConfirmDialogComponent, PatientDetailsComponent],
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss']
})
export class PatientListComponent implements OnInit {
  // Rendo Math disponibile nel template
  protected Math = Math;

  showForm: boolean = false;
  selectedPatient: Patient | null = null;
  showDeleteConfirm: boolean = false;
  patientToDelete: Patient | null = null;

  patients: Patient[] = [];
  filteredPatients: Patient[] = [];
  displayedPatients: Patient[] = [];
  loading: boolean = true;
  error: string | null = null;
  searchTerm: string = '';

  // Configurazione paginazione
  pageSize: number = 5;
  currentPage: number = 1;
  pageSizeOptions: number[] = [5, 10, 15];
  totalItems: number = 0;

  // Configurazione ordinamento
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Configurazione delle colonne
  columns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true, searchable: true, type: 'number' },
    { key: 'firstName', label: 'Nome', sortable: true, searchable: true, type: 'text' },
    { key: 'lastName', label: 'Cognome', sortable: true, searchable: true, type: 'text' },
    { key: 'dateOfBirth', label: 'Data di Nascita', sortable: true, searchable: true, type: 'date' },
    { key: 'age', label: 'Età', sortable: true, searchable: false, type: 'number' },
    { key: 'actions', label: 'Azioni', sortable: false }
  ];

  // Variabili per il modal di dettaglio
  showDetailsModal = false;
  patientDetails: Patient | null = null;

  constructor(
    private patientService: PatientService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.loading = true;
    this.error = null;
    
    this.patientService.getAllPatients().subscribe({
      next: (data) => {
        this.patients = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Errore nel caricamento dei pazienti';
        this.loading = false;
        console.error('Errore:', error);
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.applyFilters();
  }

  private applyFilters(): void {
    // Se il campo di ricerca è vuoto, mostriamo tutti i pazienti
    if (!this.searchTerm || !this.searchTerm.trim()) {
      this.filteredPatients = [...this.patients];
      this.totalItems = this.patients.length;
      this.updatePagination();
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase().trim();
    this.filteredPatients = this.patients.filter(patient => {
      return this.columns.some(column => {
        if (!column.searchable) return false;
        
        const value = this.getPatientValue(patient, column);
        if (value === null || value === undefined) return false;

        // Gestione speciale per le date
        if (column.type === 'date' && value instanceof Date) {
          return value.toLocaleDateString().toLowerCase().includes(searchTermLower);
        }

        // Per tutti gli altri tipi di dati
        return String(value).toLowerCase().includes(searchTermLower);
      });
    });

    this.totalItems = this.filteredPatients.length;
    this.updatePagination();
  }

  getPatientValue(patient: Patient, column: TableColumn): any {
    if (column.key === 'age') {
      return this.calculateAge(patient.dateOfBirth);
    }
    return patient[column.key as keyof Patient];
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

  // Metodi per la paginazione
  onPageSizeChange(event: Event): void {
    // pageSize è già aggiornato grazie a ngModel
    this.currentPage = 1;
    this.updatePagination();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedPatients = this.filteredPatients.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get pages(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Metodi per l'ordinamento
  onSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortData();
  }

  sortData(): void {
    if (!this.sortColumn) return;

    this.filteredPatients.sort((a, b) => {
      const aValue = this.getPatientValue(a, { key: this.sortColumn } as TableColumn);
      const bValue = this.getPatientValue(b, { key: this.sortColumn } as TableColumn);

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return this.sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return this.sortDirection === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      return this.sortDirection === 'asc'
        ? aValue - bValue
        : bValue - aValue;
    });

    this.updatePagination();
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) return 'fa-sort';
    return this.sortDirection === 'asc' ? 'fa-sort-up' : 'fa-sort-down';
  }

  toggleForm(patient?: Patient): void {
    this.selectedPatient = patient || null;
    this.showForm = !this.showForm;
    
    // Chiudi la finestra dei dettagli se è aperta
    if (this.showDetailsModal) {
      this.closeDetails();
    }
  }

  onPatientSaved(patient: Patient): void {
    console.log('Paziente salvato ricevuto:', patient);
    this.showForm = false;
    this.selectedPatient = null;
    
    // Ricarichiamo la lista dei pazienti dal server
    this.loading = true;
    this.patientService.getAllPatients().subscribe({
      next: (data) => {
        console.log('Lista pazienti aggiornata:', data);
        this.patients = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Errore nel caricamento dei pazienti:', error);
        this.error = 'Errore nel caricamento dei pazienti';
        this.loading = false;
      }
    });
  }

  onDeleteClick(patient: Patient): void {
    this.patientToDelete = patient;
    this.showDeleteConfirm = true;
    
    // Chiudi la finestra dei dettagli se è aperta
    if (this.showDetailsModal) {
      this.closeDetails();
    }
  }

  onDeleteConfirm(): void {
    if (this.patientToDelete?.id) {
      this.patientService.deletePatient(this.patientToDelete.id).subscribe({
        next: (response) => {
          console.log('Messaggio dal server:', response.message);
          this.showDeleteConfirm = false;
          this.patientToDelete = null;
          this.loadPatients();
        },
        error: (error) => {
          console.error('Errore durante l\'eliminazione:', error);
          this.showDeleteConfirm = false;
          this.patientToDelete = null;
        }
      });
    }
  }

  onDeleteCancel(): void {
    this.showDeleteConfirm = false;
    this.patientToDelete = null;
  }

  viewDetails(patient: Patient): void {
    this.patientDetails = patient;
    this.showDetailsModal = true;
  }

  closeDetails(): void {
    this.showDetailsModal = false;
    this.patientDetails = null;
  }
} 