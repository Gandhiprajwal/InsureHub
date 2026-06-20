import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { AgentProfile, CustomerDetails } from '../models/models';
import { environment } from '../../environments/environment';

const USE_MOCK = environment.useMock;

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private readonly apiUrl = environment.apiUrl;

  getProfile(): Observable<any> {
    if (USE_MOCK) {
      const role = this.auth.role();
      const userObj = this.auth.current();
      if (role === 'AGENT') {
        return of({
          name: userObj?.name || 'John Agent',
          email: userObj?.email || 'john@gmail.com',
          contact: '9876543210',
          agentId: 1001
        });
      } else {
        return of({
          customerId: 2001,
          name: userObj?.name || 'Rahul Customer',
          email: userObj?.email || 'rahul@gmail.com',
          contact: '9876543211',
          agentId: 1001
        });
      }
    }

    const role = this.auth.role();
    if (role === 'AGENT') {
      return this.http.get<AgentProfile>(`${this.apiUrl}/agent/profile`);
    } else {
      return this.http.get<CustomerDetails>(`${this.apiUrl}/customer/profile`);
    }
  }

  updateProfile(updates: { name: string; email: string; contact: string }): Observable<any> {
    if (USE_MOCK) {
      return of({ message: 'Profile updated successfully (Mock Mode)', ...updates });
    }

    const role = this.auth.role();
    if (role === 'AGENT') {
      return this.http.put(`${this.apiUrl}/agent/profile`, updates);
    } else {
      return this.http.put(`${this.apiUrl}/customer/profile`, updates);
    }
  }
}
