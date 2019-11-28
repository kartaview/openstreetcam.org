import { IApiOSCV2RequestOptions, EApiOSCV2Platform, EApiOSCV2UserType } from './apiOSCV2RequestOptions.interface';

export enum EUserJoin {
  METRICS = 'metrics'
}

export interface IApiOSCUserRequestOptions extends IApiOSCV2RequestOptions {
  join?: EUserJoin[];
  platform?: EApiOSCV2Platform;
  userType?: EApiOSCV2UserType;
  region?: number[];
}
