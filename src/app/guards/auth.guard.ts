import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/models';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  router.navigate(['/login']);
  return false;
};

export const roleGuard = (role: Role): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const u = auth.current();
    if (u && u.role === role) return true;
    router.navigate([u?.role === 'agent' ? '/agent' : '/login']);
    return false;
  };
};
