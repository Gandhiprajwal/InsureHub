import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, of } from 'rxjs';
import {
  Role,
  User,
  DecodedToken,
  LoginResponse,
  RegisterAgentRequest,
  RegisterCustomerRequest
} from '../models/models';
import { environment } from '../../environments/environment';

const USE_MOCK = environment.useMock;

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;
  private readonly apiUrl = environment.apiUrl;

  private readonly _token = signal<string | null>(null);
  private readonly _role = signal<Role | null>(null);
  private readonly _currentEmail = signal<string>('');
  private readonly _profileDetails = signal<any>(null);

  readonly token = this._token.asReadonly();
  readonly role = this._role.asReadonly();
  readonly isLoggedIn = computed(() => this._token() !== null);

  readonly current = computed<User | null>(() => {
    const role = this._role();
    const email = this._currentEmail();
    const profile = this._profileDetails();
    if (!role || !email) return null;
    return {
      id: email,
      name: profile?.name || email.split('@')[0],
      email: email,
      role: role,
      agentId: profile?.agentId ? String(profile.agentId) : (profile?.customerId ? String(profile.customerId) : undefined)
    };
  });

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('jwt_token');
    const role = localStorage.getItem('role') as Role | null;
    if (token && role) {
      this._token.set(token);
      this._role.set(role);
      const decoded = this.decodeToken(token);
      if (decoded) {
        this._currentEmail.set(decoded.sub || '');
      }
      this.loadUserProfile();
    }
  }

  private decodeToken(token: string): DecodedToken | null {
    if (USE_MOCK) {
      return { sub: this._currentEmail() || 'user@gmail.com', role: this._role() || 'CUSTOMER' };
    }
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }

  loadUserProfile() {
    const role = this._role();
    if (!role) return;

    if (USE_MOCK) {
      if (role === 'AGENT') {
        this._profileDetails.set({
          name: 'John Agent',
          email: this._currentEmail() || 'john@gmail.com',
          contact: '9876543210',
          agentId: 1001
        });
      } else {
        this._profileDetails.set({
          customerId: 2001,
          name: 'Rahul Customer',
          email: this._currentEmail() || 'rahul@gmail.com',
          contact: '9876543211',
          agentId: 1001
        });
      }
      return;
    }

    const endpoint = role === 'AGENT' ? `${this.apiUrl}/agent/profile` : `${this.apiUrl}/customer/profile`;
    this.http.get<any>(endpoint).subscribe({
      next: (profile) => {
        this._profileDetails.set(profile);
      },
      error: () => {}
    });
  }

  sendOtp(email: string): Observable<string> {
    if (USE_MOCK) {
      return of('OTP sent successfully (Mock Mode)');
    }
    return this.http.post(`${this.baseUrl}/send-otp`, { email }, { responseType: 'text' });
  }

  verifyOtp(email: string, otp: string): Observable<string> {
    if (USE_MOCK) {
      return of('OTP verified successfully (Mock Mode)');
    }
    return this.http.post(`${this.baseUrl}/verify-otp`, { email, otp }, { responseType: 'text' });
  }

  registerAgent(agent: RegisterAgentRequest): Observable<any> {
    if (USE_MOCK) {
      return of({ agentId: 1001 });
    }
    return this.http.post(`${this.baseUrl}/register-agent`, agent);
  }

  registerCustomer(customer: RegisterCustomerRequest): Observable<any> {
    if (USE_MOCK) {
      return of({ customerId: 2001 });
    }
    return this.http.post(`${this.baseUrl}/register-customer`, customer);
  }

  login(email: string, password: string, role: Role): Observable<LoginResponse> {
    if (USE_MOCK) {
      localStorage.setItem('jwt_token', 'mock-jwt-token');
      localStorage.setItem('role', role);
      this._token.set('mock-jwt-token');
      this._role.set(role);
      this._currentEmail.set(email);
      this.loadUserProfile();
      return of({
        token: 'mock-jwt-token',
        role: role,
        message: `${role === 'AGENT' ? 'Agent' : 'Customer'} logged in successfully (Mock Mode)`
      });
    }

    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, { email, password, role }).pipe(
      tap((res) => {
        if (res && res.token) {
          localStorage.setItem('jwt_token', res.token);
          localStorage.setItem('role', res.role);
          this._token.set(res.token);
          this._role.set(res.role);
          const decoded = this.decodeToken(res.token);
          if (decoded) {
            this._currentEmail.set(decoded.sub || '');
          }
          this.loadUserProfile();
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('role');
    this._token.set(null);
    this._role.set(null);
    this._currentEmail.set('');
    this._profileDetails.set(null);
  }
}
