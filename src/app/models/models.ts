export type Role = 'agent' | 'customer';

export type PolicyType = 'Life' | 'Health' | 'Home' | 'Vehicle';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // demo only — never do this in real apps
  role: Role;
  agentId?: string; // when role = customer, links to the agent
  phone?: string;
}

export interface Policy {
  id: string;
  customerId: string;
  type: PolicyType;
  policyNumber: string;
  premium: number; // amount paid on renewal
  coverage: number;
  startDate: string; // ISO
  renewalDate: string; // ISO — exactly 1 year from start
  dueDate: string; // ISO — renewalDate + 30 days grace
}

export type PolicyStatus = 'Active' | 'Lapsed' | 'Due';
