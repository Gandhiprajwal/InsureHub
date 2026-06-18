import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Role } from '../../models/models';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  role = signal<Role>('customer');
  name = '';
  email = '';
  phone = '';
  password = '';
  agentId = '';
  error = signal<string | null>(null);

  submit() {
    this.error.set(null);
    const res = this.auth.signup({
      name: this.name,
      email: this.email,
      password: this.password,
      role: this.role(),
      agentId: this.role() === 'customer' ? this.agentId.trim().toUpperCase() : undefined,
      phone: this.phone,
    });
    if (!res.ok) {
      this.error.set(res.error);
      return;
    }
    this.router.navigate([this.role() === 'agent' ? '/agent' : '/customer']);
  }
}
