// angular import
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// project import
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { AuthService } from '../../../../services/auth-service.service';
import { LoginRequest } from '../../../../models/login-request.model';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [SharedModule, RouterModule, FormsModule, HttpClientModule, CommonModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})


export default class SignInComponent {

  loginRequest: LoginRequest = {
    username: '',
    password: ''
  };

  error: string = '';
  loading: boolean = false;
  saveCredentials: boolean = false;

  constructor( private authService: AuthService, private router: Router) { }


  onSubmit(): void {
    this.loading = true;
    this.error = '';

    this.authService.login(this.loginRequest)
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response.success) {
            // Se non vogliamo salvare le credenziali, rimuoviamo dal localStorage
            if (!this.saveCredentials) {
              localStorage.removeItem('savedCredentials');
            } else {
              // Salva le credenziali se l'utente ha selezionato "Save credentials"
              localStorage.setItem('savedCredentials', JSON.stringify({
                username: this.loginRequest.username
              }));
            }
            
            // Reindirizza alla home o alla dashboard
            this.router.navigate(['/analytics']);
          } else {
            this.error = response.message || 'Login failed';
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'An error occurred. Please try again.';
        }
      });
  }


  ngOnInit(): void {
    // Controlla se ci sono credenziali salvate
    const savedCredentials = localStorage.getItem('savedCredentials');
    if (savedCredentials) {
      const credentials = JSON.parse(savedCredentials);
      this.loginRequest.username = credentials.username;
      this.saveCredentials = true;
    }
  }
  
}
