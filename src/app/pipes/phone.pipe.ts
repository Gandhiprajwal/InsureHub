import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'appPhone',
  standalone: true
})
export class PhonePipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) return '—';
    const clean = value.replace(/[\s-]/g, '');
    // If it's a 10-digit number
    if (/^\d{10}$/.test(clean)) {
      return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
    }
    // If it's +91 followed by 10 digits
    if (/^\+91\d{10}$/.test(clean)) {
      return `+91 ${clean.slice(3, 8)} ${clean.slice(8)}`;
    }
    return value;
  }
}
