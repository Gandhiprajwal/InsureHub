import { Component } from '@angular/core';
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
  user: any;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {
    this.user = this.auth.current;
  }

  home(): string {
    const u = this.auth.current();
    return u ? (u.role?.toUpperCase() === 'AGENT' ? '/agent' : '/customer') : '/';
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
