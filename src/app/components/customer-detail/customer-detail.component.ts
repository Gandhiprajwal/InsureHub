import { Component, computed, inject, Input, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { PolicyService } from '../../services/policy.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { PolicyListComponent } from '../policy-list/policy-list.component';
import { InitialsPipe } from '../../pipes/initials.pipe';
import { PhonePipe } from '../../pipes/phone.pipe';
import { AgentCustomerResponse, AgentPolicyResponse } from '../../models/models';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, NavbarComponent, PolicyListComponent, DecimalPipe, InitialsPipe, PhonePipe],
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.css']
})
export class CustomerDetailComponent implements OnInit {
  private policyService = inject(PolicyService);
  private router = inject(Router);

  private _id = signal<string>('');
  
  @Input() set id(value: string) {
    this._id.set(value);
  }
  
  get idVal() {
    return this._id();
  }

  // Stores
  customersList = signal<AgentCustomerResponse[]>([]);
  policiesList = signal<AgentPolicyResponse[]>([]);

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    // 1. Fetch agent's customer list
    this.policyService.getAgentCustomers().subscribe({
      next: (customers) => this.customersList.set(customers)
    });

    // 2. Fetch agent's policy list
    this.policyService.getAgentPolicies().subscribe({
      next: (policies) => this.policiesList.set(policies)
    });
  }

  customer = computed(() => {
    const matched = this.customersList().find((c) => String(c.customerId) === String(this._id()));
    if (!matched) return null;
    return {
      id: matched.customerId.toString(),
      name: matched.name,
      email: matched.email,
      phone: matched.contact
    };
  });

  policies = computed(() => {
    return this.policiesList().filter((p: any) => String(p.customerId) === String(this._id()));
  });

  totalPremium = computed(() => {
    return this.policies().reduce((sum, p) => sum + (p.premiumAmount || 0), 0);
  });

  back() {
    this.router.navigate(['/agent']);
  }
}
