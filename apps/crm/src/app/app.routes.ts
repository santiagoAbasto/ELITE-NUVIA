import { Routes } from '@angular/router'
import { authGuard } from './core/auth.guard'

export const routes: Routes = [
  {
    path: 'ELITE-CRM/ADMIN/login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'ELITE-CRM/ADMIN/dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent),
  },
  {
    path: 'ELITE-CRM/ADMIN/propiedades',
    canActivate: [authGuard],
    loadComponent: () => import('./propiedades/propiedades-list.component').then(m => m.PropiedadesListComponent),
  },
  {
    path: 'ELITE-CRM/ADMIN/leads',
    canActivate: [authGuard],
    loadComponent: () => import('./leads/leads-list.component').then(m => m.LeadsListComponent),
  },
  {
    path: 'ELITE-CRM/ADMIN',
    redirectTo: 'ELITE-CRM/ADMIN/dashboard',
    pathMatch: 'full',
  },
  { path: '', redirectTo: 'ELITE-CRM/ADMIN/login', pathMatch: 'full' },
]
