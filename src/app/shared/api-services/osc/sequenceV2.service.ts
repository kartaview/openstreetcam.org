import { Injectable } from '@angular/core';
import { ApiOSCService } from '../api-osc.service';
import {
  ISequence, IPhoto, Photo, Sequence, IUploadHistory,
  SequenceAttachment, SequenceMetadata
} from './models';


import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { ISequenceService } from './sequenceService.interface';

import { IApiOSCSequenceRequestOptions } from './requests/v2';

@Injectable()
export class SequenceV2Service implements ISequenceService {
  private _getSequenceUrl = '/2.0/sequence/';

  constructor(private _apiService: ApiOSCService) { }

  get(id: number): Observable<ISequence> {
    return this._apiService.get(`${this._getSequenceUrl}${id}`)
      .map((response: Response) => {
        const json = response.json();
        if (json.result) {
          const attachment = new Sequence();
          return this._matchSequenceAdditionalData(attachment.matchAPIResponseV2(json.result), json.result);
        }
        return null;
      })
      .catch(this._apiService.handleError);
  }

  getSequences(options: IApiOSCSequenceRequestOptions): Observable<SequenceMetadata> {
    return this._apiService.get(`${this._getSequenceUrl}`, options)
      .map((response: Response) => {
        const json = response.json();
        const sequences = new SequenceMetadata();
        if (json.result) {
          sequences.data = [];
          sequences.hasMoreData = false;
          json.result.data.forEach((sequenceResponse) => {
            const sequence = new Sequence();
            sequences.data.push(this._matchSequenceAdditionalData(sequence.matchAPIResponseV2(sequenceResponse), sequenceResponse));
          });
          sequences.hasMoreData = json.result.hasMoreData;
        }
        return sequences;
      })
      .catch(this._apiService.handleError);
  }

  getPhotos(sequenceId: number): Observable<IPhoto[]> {
    return null;
  }

  getUploadHistory(sequenceId: number): Observable<IUploadHistory> {
    return null;
  }

  private _matchSequenceAdditionalData(sequence, sequenceResponse) {
    sequence.attachment = undefined;
    if (sequenceResponse.attachment) {
      sequence.attachment = new SequenceAttachment();
      sequence.attachment.matchAPIResponseV2(sequenceResponse.attachment);
    }

    sequence.attachments = [];
    if (sequenceResponse.attachments) {
      sequenceResponse.attachments.forEach(responseItem => {
        const attachment = new SequenceAttachment();
        sequence.attachments.push(attachment.matchAPIResponseV2(responseItem));
      });
    }

    sequence.photo = undefined;
    if (sequenceResponse.photo) {
      sequence.photo = new Photo();
      sequence.photo.matchAPIResponseV2(sequenceResponse.photo)
    }

    sequence.photos = [];
    if (sequenceResponse.photos) {
      sequenceResponse.photos.forEach(responseItem => {
        const photo = new Photo();
        sequence.photos.push(photo.matchAPIResponseV2(responseItem));
      });
    }

    return sequence;
  }

}
