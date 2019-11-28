import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';


import { ApiOSCService } from '../api-osc.service';
import { IPhoto, Photo } from './models';
import { IApiOSCPhotoRequestOptions } from './requests/v2';
import { IPhotoService } from './photoService.interface';

@Injectable()
export class PhotoV2Service implements IPhotoService {
  private _getPhotoUrl = '/2.0/photo/';

  constructor(private _apiService: ApiOSCService) {
  }

  get(id: number): Observable<IPhoto> {
    return this._apiService.get(`${this._getPhotoUrl}/${id}`)
      .map((response: Response) => {
        const json = response.json();
        if (json.result) {
          const photo = new Photo();
          return photo.matchAPIResponseV2(json.result);
        }
        return null;
      })
      .catch(this._apiService.handleError);
  }

  getPhotos(options: IApiOSCPhotoRequestOptions): Observable<IPhoto[]> {
    return this._apiService.get(`${this._getPhotoUrl}`, options)
      .map((response: Response) => {
        const json = response.json();
        const photos = [];
        if (json.result && json.result.data) {
          json.result.data.forEach(responseItem => {
            const photo = new Photo();
            photos.push(photo.matchAPIResponseV2(responseItem));
          });
        }
        return photos;
      })
      .catch(this._apiService.handleError);
  }

  delete(id: number): Observable<boolean> {
    return this._apiService.delete(`${this._getPhotoUrl}/${id}`)
      .map((response: Response) => true)
      .catch(this._apiService.handleError);
  }
}
