import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { InitialsPipe } from '../../pipes/initials.pipe';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, InitialsPipe],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  user = this.auth.current;
  home = () => (this.auth.current()?.role === 'agent' ? '/agent' : '/customer');

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
