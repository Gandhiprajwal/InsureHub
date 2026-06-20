export type Role = 'AGENT' | 'CUSTOMER';

export type PolicyType = 'LIFEINSURANCE' | 'HEALTHINSURANCE' | 'HOMEINSURANCE' | 'VEHICLEINSURANCE';

export type PolicyStatus = 'ACTIVE' | 'LAPSED' | 'DUE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  agentId?: string;
  phone?: string;
}

export interface DecodedToken {
  sub: string;
  role: Role;
  exp?: number;
  [key: string]: any;
}

export interface LoginResponse {
  token: string;
  role: Role;
  message: string;
}

export interface SendOtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface RegisterAgentRequest {
  name: string;
  email: string;
  contact: string;
  password?: string;
  role: 'AGENT';
}

export interface RegisterCustomerRequest {
  name: string;
  email: string;
  contact: string;
  password?: string;
  role: 'CUSTOMER';
  agentId: number;
}

export interface AgentDashboardStats {
  activePolicies: number;
  totalCustomers: number;
  totalProfit: number;
}

export interface AgentProfile {
  name: string;
  email: string;
  contact: string;
}

export interface CustomerDetails {
  customerId: number;
  name: string;
  email: string;
  contact: string;
}

export interface AgentCustomerResponse {
  customerId: number;
  name: string;
  email: string;
  contact: string;
  totalPolicies?: number;
  activePolicies?: number;
  lapsedPolicies?: number;
  totalPremium?: number;
}



export interface AgentPolicyResponse {
  policyId: string;
  policyType: PolicyType;
  policyStartDate: string;
  policyEndDate: string;
  premiumAmount: number;
  policyStatus: PolicyStatus;
  customerId?: number;
  nominee?: string;
  lastPremiumPaymentDate?: string;
  lastPremiumDate?: string;
}

export interface CustomerPolicyResponse {
  policyId: string;
  policyType: PolicyType;
  policyStartDate?: string;
  policyEndDate?: string;
  premiumAmount: number;
  policyStatus: PolicyStatus;
  customerId: number;
  nominee?: string;
  lastPremiumPaymentDate?: string;
  lastPremiumDate?: string;
}

export interface PurchasePolicyRequest {
  customerId: number;
  policyType: PolicyType;
  premiumAmount: number;
  policyStartDate: string;
  termInYears: number;
  nominee: string;
}

export interface RenewPreviewResponse {
  policyId: string;
  policyType: PolicyType;
  originalPremiumAmount: number;
  penaltyAmount: number;
  renewalPremiumAmount: number;
  policyStatus: PolicyStatus;
}

export interface RenewPaymentRequest {
  policyId: string;
  cardHolderName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

export interface RenewPaymentResponse {
  policyId: string;
  policyType: PolicyType;
  originalPremiumAmount: number;
  penaltyAmount: number;
  renewalPremiumAmount: number;
  lastPremiumPaymentDate: string;
  policyStatus: PolicyStatus;
}

