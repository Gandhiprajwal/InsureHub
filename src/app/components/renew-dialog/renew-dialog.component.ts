import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { PolicyService } from '../../services/policy.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RenewPreviewResponse } from '../../models/models';

@Component({
  selector: 'app-renew-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  templateUrl: './renew-dialog.component.html',
  styleUrls: ['./renew-dialog.component.css']
})
export class RenewDialogComponent implements OnInit {
  dialogRef = inject(MatDialogRef<RenewDialogComponent>);
  private data = inject(MAT_DIALOG_DATA);
  private policyService = inject(PolicyService);
  private snack = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  loading = signal(true);
  submitting = signal(false);
  preview = signal<RenewPreviewResponse | null>(null);

  paymentForm!: FormGroup;
  months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  years: string[] = [];

  constructor() {
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 15; i++) {
      this.years.push(String(currentYear + i));
    }
  }

  ngOnInit() {
    this.initForm();
    this.fetchPreview();
  }

  initForm() {
    this.paymentForm = this.fb.group({
      cardHolderName: ['', [Validators.required, Validators.minLength(2)]],
      cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9\s]{16,19}$/)]],
      expiryMonth: ['', [Validators.required]],
      expiryYear: ['', [Validators.required]],
      cvv: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]]
    });
  }

  get f() { return this.paymentForm.controls; }

  onCardNumberInput(event: Event) {
    const input = event.target as HTMLInputElement;
    let trimmed = input.value.replace(/\s+/g, '');
    if (trimmed.length > 16) {
      trimmed = trimmed.substring(0, 16);
    }
    const parts = [];
    for (let i = 0; i < trimmed.length; i += 4) {
      parts.push(trimmed.substring(i, i + 4));
    }
    const formatted = parts.join(' ');
    input.value = formatted;
    this.paymentForm.patchValue({ cardNumber: formatted }, { emitEvent: false });
  }

  fetchPreview() {
    this.loading.set(true);
    this.policyService.getRenewPreview(this.data.policyId).subscribe({
      next: (preview) => {
        this.preview.set(preview);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.snack.open(err.error?.message || err.error || 'Failed to fetch renewal preview.', 'Close', { duration: 4500 });
        this.dialogRef.close();
      }
    });
  }

  formatType(type: string | undefined): string {
    if (!type) return '—';
    if (type === 'LIFEINSURANCE') return 'Life Insurance';
    if (type === 'HEALTHINSURANCE') return 'Health Insurance';
    if (type === 'HOMEINSURANCE') return 'Home Insurance';
    if (type === 'VEHICLEINSURANCE') return 'Vehicle Insurance';
    return type;
  }

  getStatusClass(status: string | undefined) {
    if (!status) return '';
    const st = status.toUpperCase();
    if (st === 'ACTIVE') return 'badge-active';
    if (st === 'LAPSED') return 'badge-lapsed';
    return 'badge-due';
  }

  onSubmit() {
    if (this.paymentForm.invalid) return;
    this.submitting.set(true);

    const payload = {
      policyId: this.data.policyId,
      cardHolderName: this.paymentForm.value.cardHolderName,
      cardNumber: this.paymentForm.value.cardNumber.replace(/\s+/g, ''),
      expiryMonth: this.paymentForm.value.expiryMonth,
      expiryYear: this.paymentForm.value.expiryYear,
      cvv: this.paymentForm.value.cvv
    };

    this.policyService.renewPolicy(payload).subscribe({
      next: () => {
        this.submitting.set(false);
        this.snack.open('Policy renewed successfully', 'Close', { duration: 4000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.submitting.set(false);
        this.snack.open(err.error?.message || err.error || 'Renewal payment failed.', 'Close', { duration: 4000 });
      }
    });
  }
}
