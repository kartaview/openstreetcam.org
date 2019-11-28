import { Pipe, PipeTransform } from '@angular/core';
/*
 * Formats integer number
 * Usage:
 *   value | integerNumberDraw
 * Example:
 *   {{ 20000 | integerNumberDraw }}
 *   formats to: 20 000
*/
@Pipe({ name: 'integerNumberDraw' })
export class IntegerNumberDraw implements PipeTransform {
  transform(value: any): string {
    return parseInt(value, 10).toString().replace(/(?!^)(?=(?:\d{3})+(?:\.|$))/gm, ' ');
  }
}
