import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { PolicyService } from '../../services/policy.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { InitialsPipe } from '../../pipes/initials.pipe';
import { PhonePipe } from '../../pipes/phone.pipe';
import {
  AgentDashboardStats,
  AgentCustomerResponse,
  AgentPolicyResponse
} from '../../models/models';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, DecimalPipe, InitialsPipe, PhonePipe],
  templateUrl: './agent-dashboard.component.html',
  styleUrls: ['./agent-dashboard.component.css']
})
export class AgentDashboardComponent implements OnInit {
  private auth = inject(AuthService);
  private policyService = inject(PolicyService);
  private router = inject(Router);

  agent = this.auth.current;

  // Signal stores for backend data
  dashboardStats = signal<AgentDashboardStats | null>(null);
  customersList = signal<AgentCustomerResponse[]>([]);
  policiesList = signal<AgentPolicyResponse[]>([]);

  ngOnInit() {
    this.loadAgentData();
  }

  loadAgentData() {
    // 1. Fetch dashboard stats
    this.policyService.getAgentDashboardStats().subscribe({
      next: (stats) => this.dashboardStats.set(stats),
      error: () => {}
    });

    // 2. Fetch customer list
    this.policyService.getAgentCustomers().subscribe({
      next: (customers) => this.customersList.set(customers),
      error: () => {}
    });

    // 3. Fetch policies to build detailed row info
    this.policyService.getAgentPolicies().subscribe({
      next: (policies) => this.policiesList.set(policies),
      error: () => {}
    });
  }

  // Compatible list for HTML bindings
  customers = computed(() => {
    return this.customersList().map(c => ({
      id: c.customerId.toString(),
      name: c.name,
      email: c.email,
      phone: c.contact,
      agentId: this.agent()?.agentId || ''
    }));
  });

  customerRows = computed(() => {
    const customers = this.customersList();
    const policies = this.policiesList();

    return customers.map((c) => {
      // Find policies associated with this customerId (handle string/number comparison safely)
      const userPolicies = policies.filter((p: any) => String(p.customerId) === String(c.customerId));
      const active = userPolicies.filter((p) => p.policyStatus === 'ACTIVE' || p.policyStatus === 'DUE').length;
      const lapsed = userPolicies.filter((p) => p.policyStatus === 'LAPSED').length;
      const premium = userPolicies.reduce((sum, p) => sum + p.premiumAmount, 0);

      return {
        user: {
          id: c.customerId.toString(),
          name: c.name,
          email: c.email,
          phone: c.contact
        },
        total: userPolicies.length,
        active,
        lapsed,
        premium
      };
    });
  });

  stats = computed(() => {
    const statsData = this.dashboardStats();
    const policies = this.policiesList();

    const active = statsData?.activePolicies ?? policies.filter((p) => p.policyStatus === 'ACTIVE' || p.policyStatus === 'DUE').length;
    const lapsed = policies.filter((p) => p.policyStatus === 'LAPSED').length;
    const profit = statsData?.totalProfit ?? policies.filter((p) => p.policyStatus !== 'LAPSED').reduce((sum, p) => sum + p.premiumAmount * 0.1, 0);

    return {
      active,
      lapsed,
      profit
    };
  });

  open(id: string) {
    this.router.navigate(['/agent/customers', id]);
  }
}
