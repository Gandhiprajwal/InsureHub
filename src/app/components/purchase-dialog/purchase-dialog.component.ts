import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { PolicyService } from '../../services/policy.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PolicyType, PurchasePolicyRequest } from '../../models/models';

@Component({
  selector: 'app-purchase-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './purchase-dialog.component.html',
  styleUrls: ['./purchase-dialog.component.css']
})
export class PurchaseDialogComponent {
  purchaseForm: FormGroup;
  submitting = signal(false);

  constructor(
    public dialogRef: MatDialogRef<PurchaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private policyService: PolicyService,
    private snack: MatSnackBar,
    private fb: FormBuilder
  ) {
    const todayStr = new Date().toISOString().substring(0, 10);
    this.purchaseForm = this.fb.group({
      policyType: ['LIFEINSURANCE', [Validators.required]],
      premiumAmount: [5000, [Validators.required, Validators.min(100)]],
      termInYears: [10, [Validators.required, Validators.min(1), Validators.max(50)]],
      policyStartDate: [todayStr, [Validators.required]],
      nominee: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  get f() { return this.purchaseForm.controls; }

  setPolicyType(type: 'LIFEINSURANCE' | 'HEALTHINSURANCE' | 'HOMEINSURANCE' | 'VEHICLEINSURANCE') {
    this.purchaseForm.patchValue({ policyType: type });
    this.purchaseForm.get('policyType')?.markAsTouched();
  }

  onSubmit() {
    if (this.purchaseForm.invalid) return;
    this.submitting.set(true);

    const payload: PurchasePolicyRequest = {
      customerId: this.data.customerId,
      policyType: this.purchaseForm.value.policyType as PolicyType,
      premiumAmount: this.purchaseForm.value.premiumAmount,
      policyStartDate: this.purchaseForm.value.policyStartDate,
      termInYears: this.purchaseForm.value.termInYears,
      nominee: this.purchaseForm.value.nominee
    };

    this.policyService.purchasePolicy(payload).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.snack.open('Policy purchased successfully', 'Close', { duration: 4000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.submitting.set(false);
        this.snack.open(err.error?.message || err.error || 'Failed to purchase policy.', 'Close', { duration: 4000 });
      }
    });
  }
}
