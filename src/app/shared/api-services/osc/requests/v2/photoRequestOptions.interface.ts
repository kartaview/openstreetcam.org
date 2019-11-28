import { IApiOSCV2RequestOptions } from './apiOSCV2RequestOptions.interface';

export enum EPhotoJoin {
  RAWDATA = 'rawdata',
  VIDEO = 'video',
  SEQUENCE = 'sequence',
  USER = 'user'
}

export enum EPhotoSearchSequenceType {
  PHOTO = 'photo',
  VIDEO = 'video',
  VDB = 'vdb'
}

export enum EPhotoSearchPlatform {
  IOS = 'ios',
  ANDROID = 'android',
  WAYLENS = 'waylens',
  GOPRO = 'gopro',
  OTHER = 'other'
}

export enum EPhotoSearchFieldOfView {
  PLANE = 'plane',
  SPHERE180 = '180',
  SPHERE360 = '360',
  DUAL_FISHEYE = 'dual_fisheye'
}

export enum EPhotoProjection {
  PLANE = 'PLANE',
  CYLINDER = 'CYLINDER',
  SPHERE = 'SPHERE',
  FISHEYE = 'FISHEYE',
  CUBE = 'CUBE'
}


export interface IApiOSCPhotoRequestOptions extends IApiOSCV2RequestOptions {
  join?: EPhotoJoin[];
  sequenceId?: number;
  sequenceIndex?: number;
  searchSequenceType?: EPhotoSearchSequenceType;
  searchPlatform?: EPhotoSearchPlatform;
  searchFieldOfView?: EPhotoSearchFieldOfView;
  userId?: number[];
  videoIndex?: number;
  projection?: EPhotoProjection;
  fieldOfView?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  zoomLevel?: number;
}
