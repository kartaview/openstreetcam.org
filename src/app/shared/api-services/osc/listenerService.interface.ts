import { Observable } from 'rxjs/Observable';
import { IListenerMaintenanceMetadata } from './models';
import { IApiOSCListenerMaintenanceRequestOptions } from './requests/v2';

export interface IListenerService {
  getMaintenances(options: IApiOSCListenerMaintenanceRequestOptions): Observable<IListenerMaintenanceMetadata>;
}
