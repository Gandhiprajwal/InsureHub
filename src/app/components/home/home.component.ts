import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  isLoggedIn = this.auth.isLoggedIn;
  currentUser = this.auth.current;

  // FAQ Accordion index
  activeFaq = signal<number | null>(null);

  // Premium Calculator Signals
  calcType = signal<'Life' | 'Home' | 'Health' | 'Vehicle'>('Life');
  calcCoverage = signal<number>(1000000);
  calcAge = signal<number>(30);
  calcHasRider = signal<boolean>(false);
  calcPropertyType = signal<'apartment' | 'house'>('apartment');
  calcVehicleType = signal<'two-wheeler' | 'four-wheeler'>('four-wheeler');

  // FAQs
  faqs = [
    {
      q: 'What is InsureHub, and how does it help me?',
      a: 'InsureHub is a next-generation policy management platform that brings insurance agents and policyholders together. It enables you to track, pay, renew, and customize life, home, health, and vehicle policies under a single unified dashboard, removing all traditional paperwork.'
    },
    {
      q: 'How do I purchase or renew a policy?',
      a: 'It is incredibly simple. For existing policies, go to your dashboard, review due or lapsed policies, and click "Renew". For new policies, you can connect directly with one of our certified agents (e.g. Aarav Sharma or Priya Verma) who will create a tailor-made plan for you.'
    },
    {
      q: 'What are the 4 main types of insurance you offer?',
      a: 'We specialize in Life (term & wealth protection), Home (property & asset coverage), Health (cashless medical treatments), and Vehicle (automobile liability and comprehensive protection) insurance.'
    },
    {
      q: 'Can I add multiple policies under a single account?',
      a: 'Yes, absolutely. Customers can hold multiple active policies simultaneously. You can easily view all policy details, coverage amounts, premiums, and due dates directly on your Customer Dashboard.'
    },
    {
      q: 'How does the 30-day grace period work?',
      a: 'Every policy comes with a 30-day grace period after the renewal date. If payment is made during this grace period, your policy remains "Due" but active. Beyond this period, it shifts to "Lapsed" status, and coverage will be suspended until a formal renewal is processed.'
    }
  ];

  // Min and Max values for coverage slider based on type
  coverageMin = computed(() => {
    switch (this.calcType()) {
      case 'Life': return 100000;
      case 'Home': return 500000;
      case 'Health': return 50000;
      case 'Vehicle': return 50000;
    }
  });

  coverageMax = computed(() => {
    switch (this.calcType()) {
      case 'Life': return 10000000; // 10M
      case 'Home': return 20000000; // 20M
      case 'Health': return 5000000;  // 5M
      case 'Vehicle': return 3000000;  // 3M
    }
  });

  coverageStep = computed(() => {
    switch (this.calcType()) {
      case 'Life': return 100000;
      case 'Home': return 250000;
      case 'Health': return 50000;
      case 'Vehicle': return 25000;
    }
  });

  // Calculate premium value
  estimatedPremium = computed(() => {
    const type = this.calcType();
    const cov = this.calcCoverage();
    const age = this.calcAge();
    const rider = this.calcHasRider();
    const prop = this.calcPropertyType();
    const vehicle = this.calcVehicleType();

    let rate = 0;
    let multiplier = 1;

    switch (type) {
      case 'Life':
        rate = 0.0008; // 0.08% base rate annually
        multiplier = 1 + (age - 18) * 0.03;
        break;
      case 'Home':
        rate = 0.0005; // 0.05% base rate
        multiplier = prop === 'house' ? 1.25 : 1.0;
        break;
      case 'Health':
        rate = 0.0018; // 0.18% base rate
        multiplier = (1 + (age - 18) * 0.04) * (rider ? 1.2 : 1.0);
        break;
      case 'Vehicle':
        rate = 0.0032; // 0.32% base rate
        multiplier = vehicle === 'four-wheeler' ? 1.5 : 1.0;
        break;
    }

    const annualPremium = cov * rate * multiplier;
    return Math.round(annualPremium / 12); // return monthly premium
  });

  // Keep coverage in range when switching types
  onTypeChange(type: 'Life' | 'Home' | 'Health' | 'Vehicle') {
    this.calcType.set(type);
    const min = this.coverageMin();
    const max = this.coverageMax();
    let current = this.calcCoverage();

    if (current < min) {
      this.calcCoverage.set(min);
    } else if (current > max) {
      this.calcCoverage.set(max);
    } else {
      const step = this.coverageStep();
      this.calcCoverage.set(Math.round(current / step) * step);
    }
  }

  toggleFaq(index: number) {
    if (this.activeFaq() === index) {
      this.activeFaq.set(null);
    } else {
      this.activeFaq.set(index);
    }
  }

  goToDashboard() {
    const user = this.currentUser();
    if (user) {
      this.router.navigate([user.role.toUpperCase() === 'AGENT' ? '/agent' : '/customer']);
    }
  }
}
