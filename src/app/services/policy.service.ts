import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {
  AgentDashboardStats,
  AgentCustomerResponse,
  AgentPolicyResponse,
  CustomerPolicyResponse,
  PurchasePolicyRequest,
  RenewPreviewResponse,
  RenewPaymentRequest,
  RenewPaymentResponse,
  AgentProfile
} from '../models/models';
import { environment } from '../../environments/environment';

const USE_MOCK = environment.useMock;

@Injectable({ providedIn: 'root' })
export class PolicyService {
  private http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  private mockPolicies: any[] = [
    {
      policyId: 'POL-123',
      policyType: 'LIFEINSURANCE',
      policyStartDate: '2026-01-01',
      policyEndDate: '2031-01-01',
      premiumAmount: 5000,
      policyStatus: 'ACTIVE',
      customerId: 2001
    },
    {
      policyId: 'POL-456',
      policyType: 'VEHICLEINSURANCE',
      policyStartDate: '2025-06-15',
      policyEndDate: '2026-06-15',
      premiumAmount: 8500,
      policyStatus: 'LAPSED',
      customerId: 2001
    },
    {
      policyId: 'POL-789',
      policyType: 'HEALTHINSURANCE',
      policyStartDate: '2025-12-01',
      policyEndDate: '2026-12-01',
      premiumAmount: 12000,
      policyStatus: 'DUE',
      customerId: 2001
    }
  ];

  getAgentDashboardStats(): Observable<AgentDashboardStats> {
    if (USE_MOCK) {
      const active = this.mockPolicies.filter(p => p.policyStatus === 'ACTIVE' || p.policyStatus === 'DUE').length;
      return of({
        activePolicies: active,
        totalCustomers: 25,
        totalProfit: 12500.50
      });
    }
    return this.http.get<AgentDashboardStats>(`${this.apiUrl}/agent/dashboard`);
  }

  getAgentCustomers(): Observable<AgentCustomerResponse[]> {
    if (USE_MOCK) {
      return of([
        {
          customerId: 2001,
          name: 'Rahul Customer',
          email: 'rahul@gmail.com',
          contact: '9876543211'
        }
      ]);
    }
    return this.http.get<AgentCustomerResponse[]>(`${this.apiUrl}/agent/customers`);
  }

  getAgentPolicies(): Observable<AgentPolicyResponse[]> {
    if (USE_MOCK) {
      return of(this.mockPolicies);
    }
    return this.http.get<AgentPolicyResponse[]>(`${this.apiUrl}/agent/policies`);
  }

  getCustomerPolicies(): Observable<CustomerPolicyResponse[]> {
    if (USE_MOCK) {
      return of(this.mockPolicies.map(p => ({
        policyId: p.policyId,
        policyType: p.policyType,
        premiumAmount: p.premiumAmount,
        policyStatus: p.policyStatus,
        customerId: p.customerId
      })));
    }
    return this.http.get<CustomerPolicyResponse[]>(`${this.apiUrl}/customer/policies`);
  }

  purchasePolicy(request: PurchasePolicyRequest): Observable<{ policyId: string }> {
    if (USE_MOCK) {
      const newId = 'POL-' + Math.floor(Math.random() * 900 + 100);
      const start = request.policyStartDate || new Date().toISOString().substring(0, 10);
      const term = request.termInYears || 5;
      const end = new Date(new Date(start).setFullYear(new Date(start).getFullYear() + term)).toISOString().substring(0, 10);
      this.mockPolicies.push({
        policyId: newId,
        policyType: request.policyType,
        policyStartDate: start,
        policyEndDate: end,
        premiumAmount: request.premiumAmount,
        policyStatus: 'ACTIVE',
        customerId: request.customerId || 2001,
        nominee: request.nominee
      });
      return of({ policyId: newId });
    }
    return this.http.post<{ policyId: string }>(`${this.apiUrl}/customer/purchase-policy`, request);
  }

  getRenewPreview(policyId: string): Observable<RenewPreviewResponse> {
    if (USE_MOCK) {
      const policy = this.mockPolicies.find(p => p.policyId === policyId);
      const originalPremium = policy?.premiumAmount || 5000;
      const penalty = policy?.policyStatus === 'LAPSED' ? 250 : 0;
      return of({
        policyId: policyId,
        policyType: policy?.policyType || 'LIFEINSURANCE',
        originalPremiumAmount: originalPremium,
        penaltyAmount: penalty,
        renewalPremiumAmount: originalPremium + penalty,
        policyStatus: policy?.policyStatus || 'ACTIVE'
      });
    }
    return this.http.get<RenewPreviewResponse>(`${this.apiUrl}/policies/renew/preview?policyId=${policyId}`);
  }

  renewPolicy(request: RenewPaymentRequest): Observable<RenewPaymentResponse> {
    if (USE_MOCK) {
      const policy = this.mockPolicies.find(p => p.policyId === request.policyId);
      const originalPremium = policy?.premiumAmount || 5000;
      const penalty = policy?.policyStatus === 'LAPSED' ? 250 : 0;
      const pType = policy?.policyType || 'LIFEINSURANCE';
      if (policy) {
        policy.policyStatus = 'ACTIVE';
        const curEnd = new Date(policy.policyEndDate);
        policy.policyEndDate = new Date(curEnd.setFullYear(curEnd.getFullYear() + 1)).toISOString().substring(0, 10);
      }
      return of({
        policyId: request.policyId,
        policyType: pType,
        originalPremiumAmount: originalPremium,
        penaltyAmount: penalty,
        renewalPremiumAmount: originalPremium + penalty,
        lastPremiumPaymentDate: new Date().toISOString().substring(0, 10),
        policyStatus: 'ACTIVE'
      });
    }
    return this.http.post<RenewPaymentResponse>(`${this.apiUrl}/policies/renew`, request);
  }

  getAgentDetails(agentId: number | string): Observable<AgentProfile> {
    if (USE_MOCK) {
      return of({
        name: 'Aarav Sharma',
        email: 'agent@demo.com',
        contact: '9876543210',
        agentId: 1001
      });
    }
    return this.http.get<AgentProfile>(`${this.apiUrl}/agent/${agentId}`);
  }

  getCustomerAgent(): Observable<AgentProfile> {
    if (USE_MOCK) {
      return of({
        name: 'Aarav Sharma',
        email: 'agent@demo.com',
        contact: '9876543210',
        agentId: 1001
      });
    }
    return this.http.get<AgentProfile>(`${this.apiUrl}/customer/agent`);
  }
}
