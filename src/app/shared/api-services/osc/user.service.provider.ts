import { AuthProviderService } from '../../auth/authProvider.service';
import { UserVxService } from './userVx.service';
import { UserV2Service } from './userV2.service';
import { IUserService } from './userService.interface';
import { ApiOSCService } from '../api-osc.service';
import { environment } from 'environments/environment';

export let userServiceFactory = (apiService: ApiOSCService, auth: AuthProviderService) => {
  switch (environment.apiVersion) {
    case 1:
      return new UserVxService(apiService, auth);
    case 2:
      return new UserV2Service(apiService, auth);
    default:
      return new UserVxService(apiService, auth);
  }
};
export let userServiceProvider = {
  provide: UserVxService,
  useFactory: userServiceFactory,
  deps: [ApiOSCService, AuthProviderService]
};
