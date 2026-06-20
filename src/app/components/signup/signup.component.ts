import { Component, signal } from '@angular/core';
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
  constructor(
    private auth: AuthService,
    private router: Router,
    private snack: MatSnackBar
  ) {}

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
    this.error.set(null);

    // Validate Name: starts with uppercase, followed by lowercase
    const nameRegex = /^[A-Z][a-z]+(?:\s[A-Z][a-z]+)*$/;
    if (!nameRegex.test(this.name())) {
      this.error.set("Name must start with an uppercase letter followed by lowercase letters (e.g. 'Rahul Sharma').");
      return;
    }

    // Validate Email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.email())) {
      this.error.set("Please enter a valid email address.");
      return;
    }

    // Validate Contact Number: 10 digits starting with 6-9
    const phoneRegex = /^[6-9][0-9]{9}$/;
    if (!phoneRegex.test(this.phone())) {
      this.error.set("Contact number must be a valid 10-digit number starting with 6, 7, 8, or 9 (e.g. 9876543210).");
      return;
    }

    // Validate Password: 1 Upper, 1 lower, 1 special, min 8 length
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
    if (!passwordRegex.test(this.password())) {
      this.error.set("Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, and 1 special character.");
      return;
    }

    this.sendingOtp.set(true);

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
