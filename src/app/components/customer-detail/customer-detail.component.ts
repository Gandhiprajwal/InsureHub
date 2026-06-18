import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule, DecimalPipe } from '@angular/common';
import { DataService } from '../../services/data.service';
import { NavbarComponent } from '../navbar/navbar.component';
import { PolicyListComponent } from '../policy-list/policy-list.component';
import { InitialsPipe } from '../../pipes/initials.pipe';
import { PhonePipe } from '../../pipes/phone.pipe';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, NavbarComponent, PolicyListComponent, DecimalPipe, InitialsPipe, PhonePipe],
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.css']
})
export class CustomerDetailComponent {
  private data = inject(DataService);
  private router = inject(Router);

  readonly id = input.required<string>();

  customer = computed(() => {
    this.data.usersSig();
    return this.data.getUserById(this.id());
  });
  policies = computed(() => {
    this.data.policiesSig();
    return this.data.getPoliciesForCustomer(this.id());
  });
  totalPremium = computed(() => this.policies().reduce((s, p) => s + p.premium, 0));

  back() {
    this.router.navigate(['/agent']);
  }
}
