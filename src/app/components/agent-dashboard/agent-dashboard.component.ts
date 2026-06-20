import { Component, computed, signal, OnInit } from '@angular/core';
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
  agent: any;

  constructor(
    private auth: AuthService,
    private policyService: PolicyService,
    private router: Router
  ) {
    this.agent = this.auth.current;
  }

  // Signal stores for backend data
  dashboardStats = signal<AgentDashboardStats | null>(null);
  customersList = signal<AgentCustomerResponse[]>([]);

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

    return customers.map((c: any) => {
      // Access pre-calculated stats returned inside the customer model from the backend
      return {
        user: {
          id: c.customerId.toString(),
          name: c.name,
          email: c.email,
          phone: c.contact
        },
        total: c.totalPolicies ?? c.total ?? 0,
        active: c.activePolicies ?? c.active ?? 0,
        lapsed: c.lapsedPolicies ?? c.lapsed ?? 0,
        premium: c.totalPremium ?? c.premium ?? 0
      };
    });
  });

  stats = computed(() => {
    const statsData = this.dashboardStats();
    const customers = this.customersList();

    const fallbackActive = customers.reduce((sum: number, c: AgentCustomerResponse) => sum + (c.activePolicies || 0), 0);
    const fallbackLapsed = customers.reduce((sum: number, c: AgentCustomerResponse) => sum + (c.lapsedPolicies || 0), 0);
    const fallbackProfit = customers.reduce((sum: number, c: AgentCustomerResponse) => sum + (c.totalPremium || 0) * 0.1, 0);

    const active = statsData?.activePolicies ?? fallbackActive;
    const lapsed = fallbackLapsed;
    const profit = statsData?.totalProfit ?? fallbackProfit;

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
