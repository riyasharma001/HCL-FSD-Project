import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'masters',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/masters/masters.component').then(m => m.MastersComponent)
  },
  {
    path: 'orders',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/orders/orders.component').then(m => m.OrdersComponent)
  },
  {
    path: 'procurement',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/procurement/procurement.component').then(m => m.ProcurementComponent)
  },
  {
    path: 'finance',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/finance/finance.component').then(m => m.FinanceComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
