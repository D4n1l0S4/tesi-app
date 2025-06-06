import { Injectable } from '@angular/core';
import { CanDeactivate, Router } from '@angular/router';
import { Observable } from 'rxjs';

export interface CanComponentDeactivate {
  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UnsavedChangesGuard implements CanDeactivate<CanComponentDeactivate> {
  
  constructor(private router: Router) {}
  
  canDeactivate(component: CanComponentDeactivate): Observable<boolean> | Promise<boolean> | boolean {
    const result = component.canDeactivate ? component.canDeactivate() : true;
    
    // Se il risultato è una Promise, gestiamo il caso in cui la navigazione viene bloccata
    if (result instanceof Promise) {
      return result.catch((error) => {
        console.error('Error in canDeactivate:', error);
        return false; // Blocca la navigazione in caso di errore
      });
    }
    
    return result;
  }
} 