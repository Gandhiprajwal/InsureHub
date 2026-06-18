import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private auth = inject(AuthService);

  // Example HttpClient import:
  // constructor(private http: HttpClient) {}

  /**
   * Update the user profile.
   * To connect this function to a real API, uncomment the HTTP code template.
   */
  updateProfile(updates: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
  }): Promise<{ ok: boolean; error?: string }> {
    
    /* 
    ==================================================================
    DUMMY API CALL TEMPLATE:
    ==================================================================
    To invoke your backend API, replace the local execution below with:
    
    return this.http.put<{ ok: boolean, error?: string }>('/api/user/profile', updates)
      .toPromise()
      .then(response => {
         // Sync local state if API succeeded
         if (response && response.ok) {
           this.auth.updateProfile(updates);
         }
         return response || { ok: false, error: 'Unknown response' };
      })
      .catch(err => {
         return { ok: false, error: err.message || 'Server error' };
      });
    ==================================================================
    */

    // local-only implementation for the mock database
    const result = this.auth.updateProfile(updates);
    if (result.ok) {
      return Promise.resolve({ ok: true });
    } else {
      return Promise.resolve({ ok: false, error: result.error });
    }
  }
}
