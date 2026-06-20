import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { PolicyService } from '../../services/policy.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { InitialsPipe } from '../../pipes/initials.pipe';
import { PhonePipe } from '../../pipes/phone.pipe';
import { AgentProfile, CustomerDetails } from '../../models/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, InitialsPipe, PhonePipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private auth = inject(AuthService);
  private profileService = inject(ProfileService);
  private policyService = inject(PolicyService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  user = this.auth.current;
  profileForm!: FormGroup;

  saving = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  // Loaded dynamically from APIs
  profileData = signal<any>(null);
  assignedAgent = signal<AgentProfile | null>(null);

  // Stats signals
  agentCustomersCount = signal(0);
  agentActivePolicies = signal(0);
  customerPoliciesCount = signal(0);

  constructor() {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s-]{10,15}$/)]]
    });
  }

  ngOnInit() {
    const u = this.user();
    if (!u) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadProfile();
  }

  loadProfile() {
    const role = this.auth.role();

    this.profileService.getProfile().subscribe({
      next: (res) => {
        this.profileData.set(res);
        this.profileForm.patchValue({
          name: res.name || '',
          email: res.email || '',
          phone: res.contact || ''
        });

        if (role === 'CUSTOMER') {
          this.loadCustomerAgentAndStats(res);
        } else if (role === 'AGENT') {
          this.loadAgentStats();
        }
      },
      error: (err) => {
        this.errorMsg.set('Failed to load profile details.');
      }
    });
  }

  loadCustomerAgentAndStats(customer: CustomerDetails) {
    // 1. Load customer's policies count
    this.policyService.getCustomerPolicies().subscribe({
      next: (policies) => {
        this.customerPoliciesCount.set(policies.length);
      }
    });

    // 2. Load assigned agent details using getCustomerAgent() or agentId from response if available
    this.policyService.getCustomerAgent().subscribe({
      next: (agent) => {
        this.assignedAgent.set(agent);
      },
      error: () => {
        // Fallback: If no direct endpoint, and customer object has agentId
        const agentId = (customer as any).agentId;
        if (agentId) {
          this.policyService.getAgentDetails(agentId).subscribe({
            next: (agent) => this.assignedAgent.set(agent),
            error: () => {}
          });
        }
      }
    });
  }

  loadAgentStats() {
    // Load agent's customers count
    this.policyService.getAgentCustomers().subscribe({
      next: (customers) => {
        this.agentCustomersCount.set(customers.length);
      }
    });

    // Load agent's active policies count
    this.policyService.getAgentPolicies().subscribe({
      next: (policies) => {
        const active = policies.filter((p) => p.policyStatus === 'ACTIVE' || p.policyStatus === 'DUE').length;
        this.agentActivePolicies.set(active);
      }
    });
  }

  get f() { return this.profileForm.controls; }

  // Computed properties matching templates
  agentStats = computed(() => {
    return {
      customersCount: this.agentCustomersCount(),
      activePolicies: this.agentActivePolicies()
    };
  });

  customerStats = computed(() => {
    return {
      policiesCount: this.customerPoliciesCount()
    };
  });

  goBack() {
    const role = this.auth.role();
    if (role === 'AGENT') {
      this.router.navigate(['/agent']);
    } else {
      this.router.navigate(['/customer']);
    }
  }

  saveProfile() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMsg.set('');
    this.successMsg.set('');

    const formValues = this.profileForm.value;
    const updateRequest = {
      name: formValues.name,
      email: formValues.email,
      contact: formValues.phone
    };

    this.profileService.updateProfile(updateRequest).subscribe({
      next: () => {
        this.saving.set(true); // wait, keep saving true until reload
        this.successMsg.set('Profile settings updated successfully.');
        // Reload profile data to make sure it syncs
        this.loadProfile();
        this.saving.set(false);
        setTimeout(() => this.successMsg.set(''), 3500);
      },
      error: (err) => {
        this.saving.set(false);
        this.errorMsg.set(err.error?.message || err.error || 'Failed to update profile.');
      }
    });
  }
}
