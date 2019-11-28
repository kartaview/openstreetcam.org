import { IApiOSCV2RequestOptions } from './apiOSCV2RequestOptions.interface';

export enum EVideoJoin {
  USER = 'user',
  SEQUENCE = 'sequence'
}


export interface IApiOSCVideoRequestOptions extends IApiOSCV2RequestOptions {
  join?: EVideoJoin[];
  sequenceId?: number;
}
