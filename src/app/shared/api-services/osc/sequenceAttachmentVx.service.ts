import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { ApiOSCService } from '../api-osc.service';
import { ISequenceAttachment, SequenceAttachment, ISequenceAttachmentMetadata, SequenceAttachmentMetadata } from './models';
import { IApiOSCSequenceAttachmentRequestOptions } from './requests/v2';
import { ISequenceAttachmentService } from './sequenceAttachmentService.interface';
import { AuthProviderService } from '../../auth/authProvider.service';


@Injectable()
export class SequenceAttachmentVxService implements ISequenceAttachmentService {
  private _getSequenceAttachmentUrl = '/2.0/sequence-attachment/';

  constructor(private _apiService: ApiOSCService, private auth: AuthProviderService) { }

  get(id: number): Observable<ISequenceAttachment> {
    return this._apiService.get(`${this._getSequenceAttachmentUrl}${id}`)
      .map((response: Response) => {
        const json = response.json();
        if (json.result) {
          const attachment = new SequenceAttachment();
          return attachment.matchAPIResponseV2(json.result);
        }
        return null;
      })
      .catch(this._apiService.handleError);
  }

  getSequenceAttachments(options: IApiOSCSequenceAttachmentRequestOptions): Observable<ISequenceAttachmentMetadata> {
    return this._apiService.get(`${this._getSequenceAttachmentUrl}`)
      .map((response: Response) => {
        const json = response.json();
        const result = new SequenceAttachmentMetadata();
        if (json.result) {
          return result.matchAPIResponseV2(json.result);
        }
        return result;
      })
      .catch(this._apiService.handleError);
  }

}
