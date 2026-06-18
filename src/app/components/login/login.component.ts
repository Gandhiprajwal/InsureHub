import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Role } from '../../models/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  role = signal<Role>('agent');
  email = '';
  password = '';
  error = signal<string | null>(null);

  submit() {
    this.error.set(null);
    const res = this.auth.login(this.email, this.password, this.role());
    if (!res.ok) {
      this.error.set(res.error);
      return;
    }
    this.router.navigate([this.role() === 'agent' ? '/agent' : '/customer']);
  }
}
