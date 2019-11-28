import { Pipe, PipeTransform } from '@angular/core';
/*
 * Formats float number
 * Usage:
 *   value | floatNumberDraw
 * Example:
 *   {{ 20000.543 | floatNumberDraw }}
 *   formats to: 20 000.543
*/
@Pipe({name: 'floatNumberDraw'})
export class FloatNumberDraw implements PipeTransform {
  transform(value: any): string {
    return parseFloat(value).toString().replace(/(?!^)(?=(?:\d{3})+(?:\.|$))/gm, ' ');
  }
}
