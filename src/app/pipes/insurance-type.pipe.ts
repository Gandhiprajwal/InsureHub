import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'insuranceType',
  standalone: true
})
export class InsuranceTypePipe implements PipeTransform {
  transform(value: string | undefined | null, format: 'short' | 'full' = 'full'): string {
    if (!value) return '';
    const upper = value.toUpperCase();

    let typeName = '';
    if (upper === 'LIFEINSURANCE' || upper === 'LIFE') {
      typeName = 'Life';
    } else if (upper === 'HEALTHINSURANCE' || upper === 'HEALTH') {
      typeName = 'Health';
    } else if (upper === 'HOMEINSURANCE' || upper === 'HOME') {
      typeName = 'Home';
    } else if (upper === 'VEHICLEINSURANCE' || upper === 'VEHICLE') {
      typeName = 'Vehicle';
    } else {
      // Fallback: title case the unknown string
      typeName = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }

    return format === 'short' ? typeName : `${typeName} Insurance`;
  }
}
