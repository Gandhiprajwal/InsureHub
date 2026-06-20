import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  router.navigate(['/login']);
  return false;
};

export const roleGuard = (role: string): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const userRole = auth.role();
    if (userRole && userRole.toUpperCase() === role.toUpperCase()) return true;
    router.navigate([userRole === 'AGENT' ? '/agent' : (userRole === 'CUSTOMER' ? '/customer' : '/login')]);
    return false;
  };
};

