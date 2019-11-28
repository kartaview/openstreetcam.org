import { AuthProviderService } from '../../auth/authProvider.service';
import { SequenceAttachmentVxService } from './sequenceAttachmentVx.service';
import { SequenceAttachmentV2Service } from './sequenceAttachmentV2.service';
import { ApiOSCService } from '../api-osc.service';
import { environment } from 'environments/environment';

export let sequenceAttachmentServiceFactory = (apiService: ApiOSCService, auth: AuthProviderService) => {
  switch (environment.apiVersion) {
    case 1:
      return new SequenceAttachmentVxService(apiService, auth);
    case 2:
      return new SequenceAttachmentV2Service(apiService, auth);
    default:
      return new SequenceAttachmentVxService(apiService, auth);
  }
};
export let sequenceAttachmentServiceProvider = {
  provide: SequenceAttachmentVxService,
  useFactory: sequenceAttachmentServiceFactory,
  deps: [ApiOSCService, AuthProviderService]
};
