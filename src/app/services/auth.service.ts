import { Injectable, computed, signal } from '@angular/core';
import { Role, User } from '../models/models';
import { DataService } from './data.service';

const SESSION_KEY = 'ih_session_user_id';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _current = signal<User | null>(null);
  readonly current = this._current.asReadonly();
  readonly isLoggedIn = computed(() => this._current() !== null);

  constructor(private data: DataService) {
    const id = localStorage.getItem(SESSION_KEY);
    if (id) {
      const u = this.data.getUserById(id);
      if (u) this._current.set(u);
    }
  }

  login(email: string, password: string, role: Role): { ok: true } | { ok: false; error: string } {
    const user = this.data
      .getUsers()
      .find((u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role);
    if (!user) return { ok: false, error: 'No account found for that email and role.' };
    if (user.password !== password) return { ok: false, error: 'Incorrect password.' };
    this._current.set(user);
    localStorage.setItem(SESSION_KEY, user.id);
    return { ok: true };
  }

  signup(input: {
    name: string;
    email: string;
    password: string;
    role: Role;
    agentId?: string;
    phone?: string;
  }): { ok: true } | { ok: false; error: string } {
    const exists = this.data
      .getUsers()
      .some((u) => u.email.toLowerCase() === input.email.toLowerCase());
    if (exists) return { ok: false, error: 'An account with that email already exists.' };

    if (input.role === 'customer') {
      if (!input.agentId) return { ok: false, error: 'Agent ID is required for customers.' };
      const agent = this.data.getAgentByAgentId(input.agentId);
      if (!agent) return { ok: false, error: 'No agent found with that Agent ID.' };
    }

    const user = this.data.createUser(input);
    this._current.set(user);
    localStorage.setItem(SESSION_KEY, user.id);
    return { ok: true };
  }

  updateProfile(updates: {
    name: string;
    email: string;
    phone?: string;
    password?: string;
  }): { ok: true } | { ok: false; error: string } {
    const user = this._current();
    if (!user) return { ok: false, error: 'No user is currently logged in.' };

    if (updates.email.toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = this.data
        .getUsers()
        .some((u) => u.id !== user.id && u.email.toLowerCase() === updates.email.toLowerCase());
      if (emailExists) return { ok: false, error: 'An account with that email already exists.' };
    }

    const updatedUser = this.data.updateUser(user.id, updates);
    if (!updatedUser) return { ok: false, error: 'Failed to update profile.' };

    this._current.set(updatedUser);
    return { ok: true };
  }

  logout() {
    this._current.set(null);
    localStorage.removeItem(SESSION_KEY);
  }
}
