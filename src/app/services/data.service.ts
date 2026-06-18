import { Injectable, signal } from '@angular/core';
import { Policy, PolicyStatus, PolicyType, Role, User } from '../models/models';

const USERS_KEY = 'ih_users';
const POLICIES_KEY = 'ih_policies';
const AGENT_SEQ_KEY = 'ih_agent_seq';

function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
function addYears(iso: string, years: number): string {
  const d = new Date(iso);
  d.setFullYear(d.getFullYear() + years);
  return d.toISOString();
}
function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

@Injectable({ providedIn: 'root' })
export class DataService {
  private readonly _users = signal<User[]>([]);
  private readonly _policies = signal<Policy[]>([]);
  readonly usersSig = this._users.asReadonly();
  readonly policiesSig = this._policies.asReadonly();

  constructor() {
    this.load();
    if (this._users().length === 0) this.seed();
  }

  // --- persistence ---
  private load() {
    try {
      const u = localStorage.getItem(USERS_KEY);
      const p = localStorage.getItem(POLICIES_KEY);
      if (u) this._users.set(JSON.parse(u));
      if (p) this._policies.set(JSON.parse(p));
    } catch {
      /* ignore */
    }
  }
  private persist() {
    localStorage.setItem(USERS_KEY, JSON.stringify(this._users()));
    localStorage.setItem(POLICIES_KEY, JSON.stringify(this._policies()));
  }

  // --- seed demo data ---
  private seed() {
    const today = new Date();
    const agent1: User = {
      id: uid('u'),
      name: 'Aarav Sharma',
      email: 'agent@demo.com',
      password: 'demo123',
      role: 'agent',
      agentId: 'AGT001',
      phone: '+91 98000 11111',
    };
    const agent2: User = {
      id: uid('u'),
      name: 'Priya Verma',
      email: 'agent2@demo.com',
      password: 'demo123',
      role: 'agent',
      agentId: 'AGT002',
      phone: '+91 98000 22222',
    };
    const c1: User = {
      id: uid('u'),
      name: 'John Doe',
      email: 'john@demo.com',
      password: 'demo123',
      role: 'customer',
      agentId: 'AGT001',
      phone: '+91 90000 11111',
    };
    const c2: User = {
      id: uid('u'),
      name: 'Maya Patel',
      email: 'maya@demo.com',
      password: 'demo123',
      role: 'customer',
      agentId: 'AGT001',
      phone: '+91 90000 22222',
    };
    const c3: User = {
      id: uid('u'),
      name: 'Rahul Iyer',
      email: 'rahul@demo.com',
      password: 'demo123',
      role: 'customer',
      agentId: 'AGT001',
      phone: '+91 90000 33333',
    };
    const c4: User = {
      id: uid('u'),
      name: 'Sara Khan',
      email: 'sara@demo.com',
      password: 'demo123',
      role: 'customer',
      agentId: 'AGT002',
      phone: '+91 90000 44444',
    };

    this._users.set([agent1, agent2, c1, c2, c3, c4]);
    localStorage.setItem(AGENT_SEQ_KEY, '3');

    const mkPolicy = (
      customerId: string,
      type: PolicyType,
      premium: number,
      coverage: number,
      startOffsetDays: number,
    ): Policy => {
      const start = addDays(today.toISOString(), startOffsetDays);
      const renewal = addYears(start, 1);
      return {
        id: uid('p'),
        customerId,
        type,
        policyNumber: `${type.slice(0, 2).toUpperCase()}-${Math.floor(Math.random() * 900000 + 100000)}`,
        premium,
        coverage,
        startDate: start,
        renewalDate: renewal,
        dueDate: addDays(renewal, 30),
      };
    };

    this._policies.set([
      // active (renewal far away)
      mkPolicy(c1.id, 'Life', 12000, 1000000, -60),
      mkPolicy(c1.id, 'Vehicle', 8500, 400000, -120),
      // due soon (renewal within 30 days)
      mkPolicy(c2.id, 'Health', 15500, 500000, -345),
      // lapsed (past due+30)
      mkPolicy(c3.id, 'Home', 22000, 2500000, -420),
      mkPolicy(c3.id, 'Life', 18000, 1500000, -90),
      mkPolicy(c4.id, 'Vehicle', 9500, 350000, -30),
      mkPolicy(c4.id, 'Health', 11000, 300000, -200),
    ]);

    this.persist();
  }

  // --- users ---
  getUsers(): User[] { return this._users(); }
  getUserById(id: string): User | undefined { return this._users().find((u) => u.id === id); }
  getAgentByAgentId(agentId: string): User | undefined {
    return this._users().find((u) => u.role === 'agent' && u.agentId === agentId);
  }
  getCustomersForAgent(agentId: string): User[] {
    return this._users().filter((u) => u.role === 'customer' && u.agentId === agentId);
  }

  createUser(input: {
    name: string; email: string; password: string; role: Role; agentId?: string; phone?: string;
  }): User {
    let agentId = input.agentId;
    if (input.role === 'agent') {
      const seq = parseInt(localStorage.getItem(AGENT_SEQ_KEY) ?? '2', 10) + 1;
      localStorage.setItem(AGENT_SEQ_KEY, String(seq));
      agentId = `AGT${String(seq).padStart(3, '0')}`;
    }
    const user: User = {
      id: uid('u'),
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role,
      agentId,
      phone: input.phone,
    };
    this._users.update((list) => [...list, user]);
    this.persist();
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    let updated: User | undefined;
    this._users.update((list) =>
      list.map((u) => {
        if (u.id !== id) return u;
        updated = { ...u, ...updates };
        return updated;
      })
    );
    this.persist();
    return updated;
  }

  // --- policies ---
  getPoliciesForCustomer(customerId: string): Policy[] {
    return this._policies().filter((p) => p.customerId === customerId);
  }
  getPoliciesForAgent(agentId: string): Policy[] {
    const customerIds = this.getCustomersForAgent(agentId).map((c) => c.id);
    return this._policies().filter((p) => customerIds.includes(p.customerId));
  }

  /**
   * Renew a policy: pushes start/renewal/due dates forward by 1 year.
   * Returns the new policy.
   */
  renewPolicy(policyId: string): Policy | undefined {
    let updated: Policy | undefined;
    this._policies.update((list) =>
      list.map((p) => {
        if (p.id !== policyId) return p;
        const newStart = new Date().toISOString();
        const newRenewal = addYears(newStart, 1);
        updated = {
          ...p,
          startDate: newStart,
          renewalDate: newRenewal,
          dueDate: addDays(newRenewal, 30),
        };
        return updated;
      }),
    );
    this.persist();
    return updated;
  }

  // --- derived helpers ---
  statusOf(policy: Policy, now = new Date()): PolicyStatus {
    const renewal = new Date(policy.renewalDate).getTime();
    const due = new Date(policy.dueDate).getTime();
    const t = now.getTime();
    if (t > due) return 'Lapsed';
    if (t > renewal) return 'Due';
    return 'Active';
  }

  daysUntil(iso: string, now = new Date()): number {
    const ms = new Date(iso).getTime() - now.getTime();
    return Math.ceil(ms / (1000 * 60 * 60 * 24));
  }
}
