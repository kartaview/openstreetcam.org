import { PhotoVxService } from './photoVx.service';
import { PhotoV2Service } from './photoV2.service';
import { ApiOSCService } from '../api-osc.service';
import { environment } from 'environments/environment';

export let photoServiceFactory = (apiService: ApiOSCService) => {
  switch (environment.apiVersion) {
    case 1:
      return new PhotoVxService(apiService);
    case 2:
      return new PhotoV2Service(apiService);
    default:
      return new PhotoVxService(apiService);
  }
};
export let photoServiceProvider = {
  provide: PhotoVxService,
  useFactory: photoServiceFactory,
  deps: [ApiOSCService]
};
