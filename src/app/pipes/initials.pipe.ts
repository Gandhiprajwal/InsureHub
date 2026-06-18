import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'appInitials',
  standalone: true
})
export class InitialsPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) return '';
    return value
      .split(' ')
      .filter(part => part.length > 0)
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }
}
