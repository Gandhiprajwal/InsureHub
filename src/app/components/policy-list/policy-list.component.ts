import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, Input, Output, EventEmitter, signal, computed } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RenewDialogComponent } from '../renew-dialog/renew-dialog.component';

export interface NormalizedPolicy {
  id: string;
  type: string;
  policyNumber: string;
  premium: number;
  coverage: number;
  startDate: string;
  renewalDate: string;
  dueDate: string;
  status: 'Active' | 'Due' | 'Lapsed';
  raw: any;
}

@Component({
  selector: 'app-policy-list',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, MatDialogModule],
  templateUrl: './policy-list.component.html',
  styleUrls: ['./policy-list.component.css']
})
export class PolicyListComponent {
  private dialog = inject(MatDialog);

  private _policies = signal<any[]>([]);

  @Input() set policies(value: any[]) {
    this._policies.set(value || []);
  }

  @Input() readonly = false;

  // Output to notify parent dashboard to refresh
  @Output() renewed = new EventEmitter<void>();

  // Normalize policy structures between different endpoints
  normalizedPolicies = computed<NormalizedPolicy[]>(() => {
    return this._policies().map((p: any) => {
      const statusVal = p.policyStatus || 'ACTIVE';
      let status: 'Active' | 'Due' | 'Lapsed' = 'Active';
      if (statusVal.toUpperCase() === 'ACTIVE') status = 'Active';
      else if (statusVal.toUpperCase() === 'DUE') status = 'Due';
      else if (statusVal.toUpperCase() === 'LAPSED') status = 'Lapsed';

      let typeDisplay = p.policyType || 'Life';
      if (typeDisplay === 'LIFEINSURANCE') typeDisplay = 'Life';
      else if (typeDisplay === 'HEALTHINSURANCE') typeDisplay = 'Health';
      else if (typeDisplay === 'HOMEINSURANCE') typeDisplay = 'Home';
      else if (typeDisplay === 'VEHICLEINSURANCE') typeDisplay = 'Vehicle';

      const premium = p.premiumAmount || p.premium || 0;
      const coverage = p.coverage || (premium * 100) || 500000;

      const startDate = p.policyStartDate || p.startDate || new Date().toISOString();
      const renewalDate = p.policyEndDate || p.renewalDate || new Date(new Date(startDate).setFullYear(new Date(startDate).getFullYear() + 1)).toISOString();
      const dueDate = p.dueDate || new Date(new Date(renewalDate).setDate(new Date(renewalDate).getDate() + 30)).toISOString();

      return {
        id: p.policyId || p.id,
        type: typeDisplay,
        policyNumber: p.policyId || p.policyNumber || 'POL-—',
        premium,
        coverage,
        startDate,
        renewalDate,
        dueDate,
        status,
        raw: p
      };
    });
  });

  status = (p: NormalizedPolicy) => p.status;

  openPay(p: NormalizedPolicy) {
    const dialogRef = this.dialog.open(RenewDialogComponent, {
      data: { policyId: p.id },
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe((success) => {
      if (success) {
        this.renewed.emit();
      }
    });
  }
}
