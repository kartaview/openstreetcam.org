import { AuthProviderService } from '../../auth/authProvider.service';
import { ListenerVxService } from './listenerVx.service';
import { ListenerV2Service } from './listenerV2.service';
import { ApiOSCService } from '../api-osc.service';
import { environment } from 'environments/environment';

export let listenerServiceFactory = (apiService: ApiOSCService, auth: AuthProviderService) => {
  switch (environment.apiVersion) {
    case 1:
      return new ListenerVxService(apiService, auth);
    case 2:
      return new ListenerV2Service(apiService, auth);
    default:
      return new ListenerVxService(apiService, auth);
  }
};
export let listenerServiceProvider = {
  provide: ListenerVxService,
  useFactory: listenerServiceFactory,
  deps: [ApiOSCService, AuthProviderService]
};
