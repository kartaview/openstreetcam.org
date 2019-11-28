import { Observable } from 'rxjs/Observable';
import { ISequenceAttachment, ISequenceAttachmentMetadata } from './models';
import { IApiOSCSequenceAttachmentRequestOptions } from './requests/v2';

export interface ISequenceAttachmentService {
  get(id: number): Observable<ISequenceAttachment>;
  getSequenceAttachments(options: IApiOSCSequenceAttachmentRequestOptions): Observable<ISequenceAttachmentMetadata>;
}
