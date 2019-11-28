import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { ApiOSCService } from '../api-osc.service';
import {
  ISequence, Sequence, SequenceMetadata, UserSequencesStatuses, ISequenceNearby,
  SequenceNearby, IPhoto, Photo, IUploadHistory, UploadHistory,
  ISequenceStatisticsResult,
  SequenceStatisticsResult
} from './models';
import { ISequenceService } from './sequenceService.interface';

import { PaginationOptions } from '../common/models';

import { IApiOSCSequenceRequestOptions } from './requests/v2';

@Injectable()
export class SequenceVxService implements ISequenceService {
  private _getSequenceUrl = '/details';

  protected _photosTemp: any = [];
  protected _uploadHistoryTemp: any = null;

  constructor(private _apiService: ApiOSCService) {
  }

  get(id: number): Observable<ISequence> {
    return this._apiService.post(this._getSequenceUrl, { id: id, platform: 'web' })
      .map((response: Response) => {
        const json = response.json();

        this._photosTemp = [];
        json.osv.photos.forEach(responseItem => {
          const photo = new Photo();
          this._photosTemp.push(photo.matchAPIResponseV1(responseItem));
        });

        this._uploadHistoryTemp = null;
        if (json.osv.upload_history) {
          this._uploadHistoryTemp = new UploadHistory();
          this._uploadHistoryTemp.matchAPIResponseV1(json.osv.upload_history);
        }
        const sequence = new Sequence();
        if (!json.osv.id) {
          json.osv.id = id;
        }
        return sequence.matchAPIResponseV1(json.osv)
      })
      .catch(this._apiService.handleError);
  }

  getSequences(options: IApiOSCSequenceRequestOptions): Observable<SequenceMetadata> {
    if (typeof options.lat !== 'undefined' && typeof options.lng !== 'undefined' && typeof options.radius !== 'undefined') {
      return throwError('sequences nearby list is not implemented yet!');
    } else if (typeof options.userId !== 'undefined' ||
      (typeof options.tLeft !== 'undefined' && typeof options.bRight !== 'undefined')
    ) {
      const requestOptions = { userId: options.userId };
      requestOptions['page'] = (typeof options.page !== 'undefined' ? options.page : 1);
      requestOptions['ipp'] = (typeof options.itemsPerPage !== 'undefined' ? options.itemsPerPage : 40);

      return this._apiService.post('/my-list', requestOptions)
        .map((response: Response) => {
          const json = response.json();
          const sequences = new SequenceMetadata();
          if (json && typeof json.currentPageItems !== 'undefined') {
            sequences.matchAPIResponseV1(json, requestOptions['page'], requestOptions['ipp']);
          }
          return sequences;
        })
        .catch(this._apiService.handleError);
    } else {
      return throwError('sequences list is not implemented yet!');
    }
  }

  getSequencesNearBy(options: IApiOSCSequenceRequestOptions): Observable<ISequenceNearby> {
    if (typeof options.lat !== 'undefined' && typeof options.lng !== 'undefined' && typeof options.radius !== 'undefined') {
      return this._apiService.post('/nearby-tracks', options)
        .map((response: Response) => {
          const json = response.json();
          if (typeof json.osv.sequences !== 'undefined') {
            const sequenceNearby = new SequenceNearby();
            return sequenceNearby.matchAPIResponseV1(json.osv.sequences);
          }
          return null;
        })
        .catch(this._apiService.handleError);
    } else {
      return throwError('Invalid call of nearby sequences!');
    }
  }

  getPhotos(sequenceId: number): Observable<IPhoto[]> {
    return new Observable<IPhoto[]>(observer => {
      observer.next(this._photosTemp);
      observer.complete();
    });
  }

  getUploadHistory(sequenceId: number): Observable<IUploadHistory> {
    return new Observable<IUploadHistory>(observer => {
      observer.next(this._uploadHistoryTemp);
      observer.complete();
    });
  }

  delete(sequenceId: number): Observable<boolean> {
    return this._apiService.post('/1.0/sequence/remove/', { sequenceId })
      .map((response: Response) => {
        const json = response.json();
        return json.status.apiCode === '600';
      })
      .catch(this._apiService.handleError);
  }

  getApolloStatistics(paginationOptions: PaginationOptions): Observable<ISequenceStatisticsResult> {
    return this._apiService.get(`/1.0/sequence/apolloSequenceStatistics`, paginationOptions)
      .map((response: Response) => {
        const json = response.json();
        if (json.osv) {
          const statistics = new SequenceStatisticsResult();
          statistics.matchAPIResponseV1(json.osv);
        }
        return null;
      });
  }

}
