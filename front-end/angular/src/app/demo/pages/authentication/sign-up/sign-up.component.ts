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
  loading: boolean = false;
  subscribeNewsletter: boolean = false;


  constructor(private authService: AuthService, private router: Router) {}


  onSubmit(): void {
    this.loading = true;
    this.error = '';

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
            this.error = response.message || 'Registration failed';
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'An error occurred. Please try again.';
        }
      });
  }
}
