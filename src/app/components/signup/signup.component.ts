import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Role } from '../../models/models';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatSnackBarModule],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  step = signal<number>(1); // 1 = Details form, 2 = OTP verification
  role = signal<Role>('CUSTOMER');
  email = signal<string>('');
  otp = signal<string>('');
  name = signal<string>('');
  phone = signal<string>('');
  password = signal<string>('');
  agentId = signal<string>('');

  sendingOtp = signal<boolean>(false);
  verifyingOtp = signal<boolean>(false);
  error = signal<string | null>(null);

  // Phase 1: Submit details and send OTP
  submitDetails() {
    if (!this.email()) return;
    this.sendingOtp.set(true);
    this.error.set(null);

    this.auth.sendOtp(this.email()).subscribe({
      next: (msg) => {
        this.sendingOtp.set(false);
        this.snack.open(msg || 'Verification OTP sent successfully', 'Close', { duration: 3000 });
        this.step.set(2);
      },
      error: (err) => {
        this.sendingOtp.set(false);
        this.error.set(err.error?.message || err.error || 'Failed to send verification OTP.');
      }
    });
  }

  // Phase 2: Verify OTP and complete Registration
  verifyAndRegister() {
    if (this.otp().length !== 6) return;
    this.verifyingOtp.set(true);
    this.error.set(null);

    // 1. Verify OTP first
    this.auth.verifyOtp(this.email(), this.otp()).subscribe({
      next: (msg) => {
        // 2. On OTP verification success, register
        this.completeRegistration();
      },
      error: (err) => {
        this.verifyingOtp.set(false);
        this.error.set(err.error?.message || err.error || 'Invalid OTP code.');
      }
    });
  }

  private completeRegistration() {
    if (this.role() === 'AGENT') {
      this.auth.registerAgent({
        name: this.name(),
        email: this.email(),
        contact: this.phone(),
        password: this.password(),
        role: 'AGENT'
      }).subscribe({
        next: () => {
          this.verifyingOtp.set(false);
          this.snack.open('Agent registered successfully', 'Close', { duration: 4000 });
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.verifyingOtp.set(false);
          this.error.set(err.error?.message || err.error || 'Registration failed.');
        }
      });
    } else {
      const parsedAgentId = parseInt(this.agentId(), 10);
      if (isNaN(parsedAgentId)) {
        this.verifyingOtp.set(false);
        this.error.set('Agent ID must be a numeric value.');
        return;
      }

      this.auth.registerCustomer({
        name: this.name(),
        email: this.email(),
        contact: this.phone(),
        password: this.password(),
        role: 'CUSTOMER',
        agentId: parsedAgentId
      }).subscribe({
        next: () => {
          this.verifyingOtp.set(false);
          this.snack.open('Customer registered successfully', 'Close', { duration: 4000 });
          this.router.navigate(['/login']);
        },
        error: (err) => {
          this.verifyingOtp.set(false);
          this.error.set(err.error?.message || err.error || 'Registration failed.');
        }
      });
    }
  }
}
