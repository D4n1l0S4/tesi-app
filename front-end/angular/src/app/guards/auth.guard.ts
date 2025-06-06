// src/app/auth/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth-service.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.authService.isAuthenticated()) {
      return true;
    }

    // Reindirizza al login se l'utente non è autenticato
    this.router.navigate(['/auth/signin']);
    return false;
  }
}

// Export per la funzione canActivate moderna
export const authGuard = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  return new AuthGuard(
    inject(AuthService),
    inject(Router)
  ).canActivate(route, state);
};

// Importazione di inject utilizzato nella funzione authGuard
import { inject } from '@angular/core';