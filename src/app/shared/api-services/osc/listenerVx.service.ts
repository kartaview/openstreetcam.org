import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { ApiOSCService } from '../api-osc.service';
import { ListenerMaintenanceMetadata, IListenerMaintenanceMetadata } from './models';
import { IListenerService } from './listenerService.interface';
import { AuthProviderService } from '../../auth/authProvider.service';
import { IApiOSCListenerMaintenanceRequestOptions } from './requests/v2';

@Injectable()
export class ListenerVxService implements IListenerService {
  private _getListenerUrl = '/2.0/listener/';

  constructor(private _apiService: ApiOSCService, private auth: AuthProviderService) { }

  getMaintenances(options: IApiOSCListenerMaintenanceRequestOptions): Observable<IListenerMaintenanceMetadata> {
    return this._apiService.get(`${this._getListenerUrl}maintenance`, options)
      .map((response: Response) => {
        const json = response.json();
        const result = new ListenerMaintenanceMetadata();
        if (json.result) {
          return result.matchAPIResponseV2(json.result);
        }
        return result;
      })
      .catch(this._apiService.handleError);
  }

}
