import { IUIGLImageCache, UIGLImageCache } from '../../shared/renderer/detection-base';

export class PhotosCache {
  photos: IUIGLImageCache[] = [];
  public currentPhotoIndex = 0;

  public addPhoto(photoId: number, glPhoto, projection, fieldOfView, isUnwrapped) {
    this.photos[photoId] = new UIGLImageCache(photoId, glPhoto, projection, fieldOfView, isUnwrapped);
    this.photos[photoId].loading = true;
  }

  public getPhoto(photoId: number) {
    return this.photos[photoId];
  }

  public removePhoto(photoId: number) {
    this.photos[photoId] = undefined;
  }

  public clear() {
    this.photos = [];
  }
}
