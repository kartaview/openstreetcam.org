import { IApiOSCV2RequestOptions, EApiOSCV2Platform, EApiOSCV2UserType } from './apiOSCV2RequestOptions.interface';

export enum ESequenceJoin {
  USER = 'user',
  ATTACHMENT = 'attachment',
  ATTACHMENTS = 'attachments',
  PHOTO = 'photo',
  PHOTOS = 'photos',
}

export enum ESequenceType {
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO',
  VDB = 'VDB'
}

export enum ESequenceStatus {
  ACTIVE = 'active',
  PUBLIC = 'public',
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  FAILED = 'failed',
  DELETED = 'deleted'
}

export interface IApiOSCSequenceRequestOptions extends IApiOSCV2RequestOptions {
  join?: ESequenceJoin[];
  startDate?: string;
  endDate?: string;
  sequenceStatus?: ESequenceStatus;
  platform?: EApiOSCV2Platform;
  userType?: EApiOSCV2UserType;
  countryCode?: string;
  sequenceType?: ESequenceType;
  region?: number[];
  userId?: number;
  radius?: number;
  lat?: number;
  lng?: number;
  username?: string;

  tLeft?: number[];
  bRight?: number[];

  withAttachments?: boolean;
}
