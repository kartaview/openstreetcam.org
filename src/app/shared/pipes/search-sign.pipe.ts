import { Pipe, PipeTransform } from '@angular/core';

import { IApolloSign } from '../api-services/apollo/models';

@Pipe({ name: 'searchSign' })
export class SearchSignPipe implements PipeTransform {
  transform(signs: IApolloSign[], tags: string[], region: string): IApolloSign[] {
    const newSigns = [];
    signs.forEach(sign => {
      if (sign.region === region) {
        let found = true;
        const signName = sign.name.toLowerCase();
        tags.some(tag => {
          if (signName.indexOf(tag) === -1) {
            found = false;
            return true;
          }
        });
        if (found) {
          newSigns.push(sign);
        }
      }
    });
    return newSigns;
  }
}
