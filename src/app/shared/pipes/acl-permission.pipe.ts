import { Pipe, PipeTransform } from '@angular/core';

import { AuthProviderService } from '../auth/authProvider.service';

@Pipe({ name: 'aclPermission' })
export class ACLPermissionPipe implements PipeTransform {
  constructor(protected _auth: AuthProviderService) {

  }

  transform(resource, permission: string, parentUserId?: number): boolean {
    return this._auth.can(permission, resource, parentUserId);
  }
}
