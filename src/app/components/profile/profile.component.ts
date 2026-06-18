import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { DataService } from '../../services/data.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { InitialsPipe } from '../../pipes/initials.pipe';
import { PhonePipe } from '../../pipes/phone.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, InitialsPipe, PhonePipe],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  private auth = inject(AuthService);
  private profileService = inject(ProfileService);
  private data = inject(DataService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  user = this.auth.current;
  profileForm!: FormGroup;

  saving = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  constructor() {
    const u = this.user();
    if (!u) {
      this.router.navigate(['/login']);
      return;
    }

    this.profileForm = this.fb.group({
      name: [u.name, [Validators.required, Validators.minLength(2)]],
      email: [u.email, [Validators.required, Validators.email]],
      phone: [u.phone || '', [Validators.pattern(/^\+?[0-9\s-]{10,15}$/)]],
      password: [u.password, [Validators.required, Validators.minLength(4)]]
    });
  }

  get f() { return this.profileForm.controls; }

  // Computed agent portfolio stats
  agentStats = computed(() => {
    const a = this.user();
    if (!a || a.role !== 'agent') return { customersCount: 0, activePolicies: 0 };
    this.data.policiesSig();
    const customers = this.data.getCustomersForAgent(a.agentId!);
    const policies = this.data.getPoliciesForAgent(a.agentId!);
    const activePolicies = policies.filter((p) => this.data.statusOf(p) !== 'Lapsed').length;
    return {
      customersCount: customers.length,
      activePolicies
    };
  });

  // Computed customer stats
  customerStats = computed(() => {
    const c = this.user();
    if (!c || c.role !== 'customer') return { policiesCount: 0 };
    this.data.policiesSig();
    const policies = this.data.getPoliciesForCustomer(c.id);
    return {
      policiesCount: policies.length
    };
  });

  // Assigned Agent info for customers
  assignedAgent = computed(() => {
    const c = this.user();
    if (!c || c.role !== 'customer' || !c.agentId) return null;
    return this.data.getAgentByAgentId(c.agentId);
  });

  goBack() {
    const role = this.user()?.role;
    if (role === 'agent') {
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

    this.profileService.updateProfile(formValues).then((res) => {
      this.saving.set(false);
      if (res.ok) {
        this.successMsg.set('Profile settings updated successfully.');
        setTimeout(() => this.successMsg.set(''), 3500);
      } else {
        this.errorMsg.set(res.error || 'Failed to update profile.');
      }
    }).catch(err => {
      this.saving.set(false);
      this.errorMsg.set('An error occurred while saving.');
    });
  }
}
