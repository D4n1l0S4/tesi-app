// Angular Import 
import { NgModule } from '@angular/core'; 
import { Routes, RouterModule } from '@angular/router';  

// project import 
import { AdminComponent } from './theme/layout/admin/admin.component'; 
import { GuestComponent } from './theme/layout/guest/guest.component';
import { authGuard } from './guards/auth.guard';
import { UnsavedChangesGuard } from './guards/unsaved-changes.guard';

/**
 * Configurazione dei percorsi dell'applicazione
 * 
 * NOTA IMPORTANTE: In questa configurazione esistono due percorsi con path vuoto (''):
 * 1. Il primo percorso è associato a GuestComponent e ha priorità per gli utenti non autenticati
 *    - Reindirizza automaticamente a 'auth/signin' per la pagina di login
 * 
 * 2. Il secondo percorso è associato a AdminComponent ed è destinato agli utenti autenticati
 *    - Reindirizza a '/analytics' quando l'utente è autenticato
 * 
 * Questo schema consente di gestire diversi stati dell'applicazione:
 * - Stato Guest: per utenti non autenticati, mostrando componenti di autenticazione
 * - Stato Admin: per utenti autenticati, mostrando componenti del dashboard e altre funzionalità
 * 
 * Angular utilizza il primo percorso corrispondente nell'ordine in cui sono dichiarati,
 * quindi l'accesso iniziale porterà sempre a GuestComponent e al login.
 * Il percorso AdminComponent viene attivato tramite logica di autenticazione.
 */

const routes: Routes = [
  {
    path: '',
    component: GuestComponent,
    children: [
      {
        path: '',
        redirectTo: 'auth/signin',
        pathMatch: 'full'
      },
      {
        path: 'auth/signup',
        loadComponent: () => import('./demo/pages/authentication/sign-up/sign-up.component')
      },
      {
        path: 'auth/signin',
        loadComponent: () => import('./demo/pages/authentication/sign-in/sign-in.component')
      }
    ]
  },
  {
    path:'',
    component: AdminComponent,
    canActivate: [authGuard], // Aggiunto authGuard per proteggere tutte le rotte di Admin
    children: [
      // '' is the standard fallback website when you access to localhost:4200
      {
        path: '',
        redirectTo: '/analytics',
        pathMatch: 'full'
      },
      {
        path: 'analytics',
        loadComponent: () => import('./demo/dashboard/dash-analytics.component')
      },
      {
        path: 'component',
        loadChildren: () => import('./demo/ui-element/ui-basic.module').then((m) => m.UiBasicModule)
      },
      {
        path: 'chart',
        loadComponent: () => import('./demo/chart-maps/core-apex.component')
      },
      {
        path: 'forms',
        loadComponent: () => import('./demo/forms/form-elements/form-elements.component')
      },
      {
        path: 'tables',
        loadComponent: () => import('./demo/tables/tbl-bootstrap/tbl-bootstrap.component')
      },
      {
        path: 'sample-page',
        loadComponent: () => import('./demo/other/sample-page/sample-page.component')
      },
      {
        path: 'patients',
        loadComponent: () => import('./pages/patients/patient-list/patient-list.component').then(m => m.PatientListComponent)
      },
      {
        path: 'dashboard/genetica',
        loadComponent: () => import('./components/genetica/genetica.component').then(m => m.GeneticaComponent)
      },
      {
        path: 'pedigree-viewer',
        loadComponent: () => import('./components/pedigree-viewer/pedigree-viewer.component').then(m => m.PedigreeViewerComponent),
        canDeactivate: [UnsavedChangesGuard]
      },
      {//è un test per vedere se funziona
        path: 'test/search-caregiver',
        loadComponent: () => import('./components/search-caregiver-by-fiscal-code/search-caregiver-by-fiscal-code.component').then(m => m.SearchCaregiverByFiscalCodeComponent)
      }     
    ]
  },
];
 
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}