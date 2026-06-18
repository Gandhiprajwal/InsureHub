import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { InitialsPipe } from '../../pipes/initials.pipe';
import { PhonePipe } from '../../pipes/phone.pipe';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, DecimalPipe, InitialsPipe, PhonePipe],
  templateUrl: './agent-dashboard.component.html',
  styleUrls: ['./agent-dashboard.component.css']
})
export class AgentDashboardComponent {
  private auth = inject(AuthService);
  private data = inject(DataService);
  private router = inject(Router);

  agent = this.auth.current;

  customers = computed(() => {
    const a = this.agent();
    if (!a) return [];
    this.data.usersSig();
    return this.data.getCustomersForAgent(a.agentId!);
  });

  customerRows = computed(() => {
    this.data.policiesSig();
    return this.customers().map((u) => {
      const policies = this.data.getPoliciesForCustomer(u.id);
      const active = policies.filter((p) => this.data.statusOf(p) !== 'Lapsed').length;
      const lapsed = policies.filter((p) => this.data.statusOf(p) === 'Lapsed').length;
      const premium = policies.reduce((s, p) => s + p.premium, 0);
      return { user: u, total: policies.length, active, lapsed, premium };
    });
  });

  stats = computed(() => {
    this.data.policiesSig();
    const a = this.agent();
    if (!a) return { active: 0, lapsed: 0, profit: 0 };
    const policies = this.data.getPoliciesForAgent(a.agentId!);
    const active = policies.filter((p) => this.data.statusOf(p) !== 'Lapsed').length;
    const lapsed = policies.filter((p) => this.data.statusOf(p) === 'Lapsed').length;
    const profit = policies
      .filter((p) => this.data.statusOf(p) !== 'Lapsed')
      .reduce((s, p) => s + p.premium * 0.1, 0);
    return { active, lapsed, profit };
  });

  open(id: string) {
    this.router.navigate(['/agent/customers', id]);
  }
}
