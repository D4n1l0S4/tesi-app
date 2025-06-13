// angular import
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthService } from '../../../../services/auth-service.service';
import { RegisterRequest } from '../../../../models/register-request.model';


@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [SharedModule, RouterModule, FormsModule, HttpClientModule, CommonModule],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})


export default class SignUpComponent {

  registerRequest: RegisterRequest = {
    username: '',
    password: '',
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateBirth: '',
    address: ''
  };

  error: string = '';
  fieldErrors: { [key: string]: string } = {}; // Errori specifici per campo
  loading: boolean = false;
  subscribeNewsletter: boolean = false;


  constructor(private authService: AuthService, private router: Router) {}

  // Metodo per ottenere l'errore specifico di un campo
  getFieldError(fieldName: string): string {
    return this.fieldErrors[fieldName] || '';
  }

  // Metodo per verificare se un campo ha errori
  hasFieldError(fieldName: string): boolean {
    return !!this.fieldErrors[fieldName];
  }

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    this.fieldErrors = {}; // Reset errori specifici

    // Verifica che i campi obbligatori siano compilati
    if (!this.registerRequest.username || !this.registerRequest.password || !this.registerRequest.email ||
        !this.registerRequest.firstName || !this.registerRequest.lastName || !this.registerRequest.phone) {
          this.loading = false;
          this.error = 'Please fill in all required fields.';
          return;
    }

    // Controlla se i campi opzionali sono vuoti e setta a undefined
    if (!this.registerRequest.dateBirth) {
      this.registerRequest.dateBirth = undefined;
    }
    
    if (!this.registerRequest.address) {
      this.registerRequest.address = undefined;
    }

    this.authService.register(this.registerRequest)
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            // Mostra un messaggio di successo (opzionale)
            alert(response.message || 'Registration successful!');
            
            // Reindirizza alla pagina di login
            this.router.navigate(['/auth/signin']);
          } else {
            // Gestisce errori di validazione specifici
            if (response.validationErrors && Object.keys(response.validationErrors).length > 0) {
              this.fieldErrors = response.validationErrors;
            } else {
              this.error = response.message || 'Registration failed';
            }
          }
        },
        error: (err) => {
          this.loading = false;
          // Gestisce errori di validazione anche in caso di errore HTTP
          if (err.error?.validationErrors && Object.keys(err.error.validationErrors).length > 0) {
            this.fieldErrors = err.error.validationErrors;
          } else {
            this.error = err.error?.message || 'An error occurred. Please try again.';
          }
        }
      });
  }
}
