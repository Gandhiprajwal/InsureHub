import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Role } from '../../models/models';
import { CommonModule } from '@angular/common';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatSnackBarModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private snack = inject(MatSnackBar);

  step = signal<number>(1); // 1 = Credentials, 2 = OTP check
  role = signal<Role>('AGENT');
  email = '';
  password = '';
  otp = '';
  
  sendingOtp = signal<boolean>(false);
  loggingIn = signal<boolean>(false);
  error = signal<string | null>(null);

  // Phase 1: Submit email/password and send OTP
  submitLogin() {
    this.error.set(null);
    this.sendingOtp.set(true);

    this.auth.sendOtp(this.email).subscribe({
      next: (msg) => {
        this.sendingOtp.set(false);
        this.snack.open(msg || 'Verification OTP sent successfully', 'Close', { duration: 3000 });
        this.step.set(2);
      },
      error: (err) => {
        this.sendingOtp.set(false);
        this.error.set(err.error?.message || err.error || 'Failed to send OTP verification code.');
      }
    });
  }

  // Phase 2: Verify OTP and log in
  verifyAndLogin() {
    if (this.otp.length !== 6) return;
    this.loggingIn.set(true);
    this.error.set(null);

    // 1. Verify the OTP first
    this.auth.verifyOtp(this.email, this.otp).subscribe({
      next: () => {
        // 2. Perform the authentication call
        this.completeLogin();
      },
      error: (err) => {
        this.loggingIn.set(false);
        this.error.set(err.error?.message || err.error || 'Invalid OTP code.');
      }
    });
  }

  private completeLogin() {
    this.auth.login(this.email, this.password, this.role()).subscribe({
      next: (res) => {
        this.loggingIn.set(false);
        this.snack.open('Logged in successfully', 'Close', { duration: 3000 });
        this.router.navigate([res.role === 'AGENT' ? '/agent' : '/customer']);
      },
      error: (err) => {
        this.loggingIn.set(false);
        this.error.set(err.error?.message || err.error || 'Authentication failed. Please verify password and role.');
      }
    });
  }
}
