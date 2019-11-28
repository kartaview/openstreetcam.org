import { Observable } from 'rxjs/Observable';
import { IPhoto } from './models';
import { IApiOSCPhotoRequestOptions } from './requests/v2';


export interface IPhotoService {
  get(id: number): Observable<IPhoto>;
  getPhotos(options: IApiOSCPhotoRequestOptions): Observable<IPhoto[]>;
  delete(id: number): Observable<boolean>;
}
