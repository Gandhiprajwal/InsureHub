// Application Route Configuration
import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./components/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'signup',
    loadComponent: () => import('./components/signup/signup.component').then((m) => m.SignupComponent),
  },
  {
    path: 'agent',
    canActivate: [authGuard, roleGuard('agent')],
    loadComponent: () =>
      import('./components/agent-dashboard/agent-dashboard.component').then((m) => m.AgentDashboardComponent),
  },
  {
    path: 'agent/customers/:id',
    canActivate: [authGuard, roleGuard('agent')],
    loadComponent: () =>
      import('./components/customer-detail/customer-detail.component').then((m) => m.CustomerDetailComponent),
  },
  {
    path: 'customer',
    canActivate: [authGuard, roleGuard('customer')],
    loadComponent: () =>
      import('./components/customer-dashboard/customer-dashboard.component').then((m) => m.CustomerDashboardComponent),
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/profile/profile.component').then((m) => m.ProfileComponent),
  },
  { path: '**', redirectTo: 'login' },
];
