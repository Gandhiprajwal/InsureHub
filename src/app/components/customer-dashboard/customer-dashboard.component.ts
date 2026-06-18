import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { DataService } from '../../services/data.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { PolicyListComponent } from '../policy-list/policy-list.component';
import { InitialsPipe } from '../../pipes/initials.pipe';
import { PhonePipe } from '../../pipes/phone.pipe';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, PolicyListComponent, InitialsPipe, PhonePipe],
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.css']
})
export class CustomerDashboardComponent {
  private auth = inject(AuthService);
  private data = inject(DataService);

  user = this.auth.current;
  policies = computed(() => {
    this.data.policiesSig();
    const u = this.user();
    return u ? this.data.getPoliciesForCustomer(u.id) : [];
  });
  agent = computed(() => {
    const u = this.user();
    return u?.agentId ? this.data.getAgentByAgentId(u.agentId) : undefined;
  });
  counts = computed(() => {
    const list = this.policies();
    return {
      active: list.filter((p) => this.data.statusOf(p) === 'Active').length,
      due: list.filter((p) => this.data.statusOf(p) === 'Due').length,
      lapsed: list.filter((p) => this.data.statusOf(p) === 'Lapsed').length,
    };
  });
}
