import { SequenceVxService } from './sequenceVx.service';
import { SequenceV2Service } from './sequenceV2.service';
import { ApiOSCService } from '../api-osc.service';
import { environment } from 'environments/environment';


export let sequenceServiceFactory = (apiService: ApiOSCService) => {
  switch (environment.apiVersion) {
    case 1:
      return new SequenceVxService(apiService);
    case 2:
      return new SequenceV2Service(apiService);
    default:
      return new SequenceVxService(apiService);
  }
};

export const sequenceServiceProvider = {
  provide: SequenceVxService,
  useFactory: sequenceServiceFactory,
  deps: [ApiOSCService]
};
