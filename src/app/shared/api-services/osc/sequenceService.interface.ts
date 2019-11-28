import { Observable } from 'rxjs/Observable';
import { ISequence, ISequenceMetadata, IPhoto, IUploadHistory } from './models';
import { IApiOSCSequenceRequestOptions } from './requests/v2';

export interface ISequenceService {
  get(id: number): Observable<ISequence>;
  getSequences(options: IApiOSCSequenceRequestOptions): Observable<ISequenceMetadata>;
  getPhotos(sequenceId: number): Observable<IPhoto[]>;
  getUploadHistory(sequenceId: number): Observable<IUploadHistory>;
}
