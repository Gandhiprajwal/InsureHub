import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Policy } from '../../models/models';

@Component({
  selector: 'app-policy-list',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe],
  templateUrl: './policy-list.component.html',
  styleUrls: ['./policy-list.component.css']
})
export class PolicyListComponent {
  private data = inject(DataService);

  readonly policies = input.required<Policy[]>();
  readonly readonly = input<boolean>(false);

  paying = signal<Policy | null>(null);

  status = (p: Policy) => this.data.statusOf(p);

  openPay(p: Policy) { this.paying.set(p); }
  confirmPay() {
    const p = this.paying();
    if (!p) return;
    this.data.renewPolicy(p.id);
    this.paying.set(null);
  }
}
