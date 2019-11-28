import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';


import { ApiOSCService } from '../api-osc.service';
import { IPhoto, Photo } from './models';
import { IApiOSCPhotoRequestOptions } from './requests/v2';
import { IPhotoService } from './photoService.interface';

@Injectable()
export class PhotoVxService implements IPhotoService {
  private _getPhotoUrl = '/1.0/photo';

  constructor(private _apiService: ApiOSCService) {
  }

  get(id: number): Observable<IPhoto> {
    return this._apiService.post(`${this._getPhotoUrl}/details/`, { id: id })
      .map((response: Response) => {
        const photo = new Photo();
        const json = response.json();
        if (json.osv) {
          return photo.matchAPIResponseV1(json.osv);
        }
        return null;
      })
      .catch(this._apiService.handleError);
  }

  getPhotos(options: IApiOSCPhotoRequestOptions): Observable<IPhoto[]> {
    return this._apiService.get(`/2.0/photo/`, options)
      .map((response: Response) => {
        const json = response.json();
        if (json.result) {
          const photos = [];
          if (json.result && json.result.data) {
            json.result.data.forEach(responseItem => {
              if (responseItem) {
                const photo = new Photo();
                photos.push(photo.matchAPIResponseV2(responseItem));
              }
            });
            return photos;
          } else {
            return [];
          }
        }
      })
      .catch(this._apiService.handleError);
  }

  getAllBySequenceIndexes(photoIndexes) {
    return this._apiService.post(`${this._getPhotoUrl}/list/`, {
      'photoIndexes': JSON.stringify(photoIndexes)
    })
      .map((response: Response) => {
        const json = response.json();
        const photos = [];
        if (json.osv && json.osv.photos) {
          json.osv.photos.forEach(photoResponse => {
            const photo = new Photo();
            photos.push(photo.matchAPIResponseV1(photoResponse));
          });
        }
        return photos;
      })
      .catch(this._apiService.handleError);
  }

  delete(id: number): Observable<boolean> {
    return this._apiService.post(`${this._getPhotoUrl}/remove/`, { photoId: id })
      .map((response: Response) => {
        const json = response.json();
        return json.status.apiCode === '600'
      })
      .catch(this._apiService.handleError);
  }
  rotate(sequenceId: number, photoId: number, photoIndex: number, angle: number, rotateAll: boolean): Observable<boolean> {
    return this._apiService.post(`${this._getPhotoUrl}/rotate/`, {
      sequenceId: sequenceId,
      'photoIndexes[]': photoIndex,
      photoId: photoId,
      rotate: angle,
      rotateAll: (rotateAll ? 1 : 0)
    })
      .map((response: Response) => {
        const json = response.json();
        return (json.message && json.message === 'Success' ? true : false);
      })
      .catch(this._apiService.handleError);
  }
}
