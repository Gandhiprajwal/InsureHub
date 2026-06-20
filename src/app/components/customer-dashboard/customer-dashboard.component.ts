import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { PolicyService } from '../../services/policy.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { PolicyListComponent } from '../policy-list/policy-list.component';
import { InitialsPipe } from '../../pipes/initials.pipe';
import { PhonePipe } from '../../pipes/phone.pipe';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { PurchaseDialogComponent } from '../purchase-dialog/purchase-dialog.component';
import { CustomerDetails, CustomerPolicyResponse, AgentProfile } from '../../models/models';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, NavbarComponent, PolicyListComponent, InitialsPipe, PhonePipe, MatDialogModule],
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.css']
})
export class CustomerDashboardComponent implements OnInit {
  user: any;

  constructor(
    private auth: AuthService,
    private profileService: ProfileService,
    private policyService: PolicyService,
    private dialog: MatDialog
  ) {
    this.user = this.auth.current;
  }

  // Signal stores
  customerDetails = signal<CustomerDetails | null>(null);
  customerPolicies = signal<CustomerPolicyResponse[]>([]);
  agentDetails = signal<AgentProfile | null>(null);

  ngOnInit() {
    this.refreshData();
  }

  refreshData() {
    // 1. Fetch customer details
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.customerDetails.set(profile);
        this.loadAgent();
      },
      error: () => {}
    });

    // 2. Fetch customer policies
    this.policyService.getCustomerPolicies().subscribe({
      next: (policies) => {
        this.customerPolicies.set(policies);
      },
      error: () => {}
    });
  }

  loadAgent() {
    // Fetch assigned agent details
    this.policyService.getCustomerAgent().subscribe({
      next: (agent) => {
        this.agentDetails.set(agent);
      },
      error: () => {}
    });
  }

  // Mapped bindings for HTML
  policies = computed(() => this.customerPolicies());

  agent = computed(() => {
    const a = this.agentDetails();
    if (!a) return null;
    return {
      name: a.name,
      email: a.email,
      phone: a.contact, // map contact -> phone to align with template
      agentId: (a as any).agentId || '—'
    };
  });

  counts = computed(() => {
    const list = this.customerPolicies();
    return {
      active: list.filter((p) => p.policyStatus === 'ACTIVE').length,
      due: list.filter((p) => p.policyStatus === 'DUE').length,
      lapsed: list.filter((p) => p.policyStatus === 'LAPSED').length
    };
  });

  openPurchaseDialog() {
    const custId = this.customerDetails()?.customerId;
    if (!custId) return;

    const dialogRef = this.dialog.open(PurchaseDialogComponent, {
      data: { customerId: custId },
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        this.refreshData();
      }
    });
  }
}
