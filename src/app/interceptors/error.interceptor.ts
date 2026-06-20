import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snackBar = inject(MatSnackBar);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred.';
      if (error.error && typeof error.error === 'object' && error.error.message) {
        errorMessage = error.error.message;
      } else if (typeof error.error === 'string') {
        errorMessage = error.error;
      }

      switch (error.status) {
        case 401:
          errorMessage = errorMessage || 'Unauthorized. Please login again.';
          snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
          localStorage.removeItem('jwt_token');
          localStorage.removeItem('role');
          router.navigate(['/login']);
          break;
        case 403:
          errorMessage = errorMessage || 'Access Forbidden.';
          snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
          break;
        case 404:
          errorMessage = errorMessage || 'Requested resource not found.';
          snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
          break;
        case 500:
          errorMessage = errorMessage || 'Internal Server Error. Please try again later.';
          snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
          break;
        default:
          snackBar.open(errorMessage, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
          break;
      }

      return throwError(() => error);
    })
  );
};
