import { IApiOSCV2RequestOptions } from './apiOSCV2RequestOptions.interface';

export enum ESequenceRawDataJoin {
  METADATA = 'metadata',
  SEQUENCE = 'sequence',
  USER = 'user'
}

export enum ESequenceRawDataType {
  VDB = 'VDB',
  ZIP = 'ZIP',
  MP4 = 'MP4'
}

export interface IApiOSCSequenceRawDataRequestOptions extends IApiOSCV2RequestOptions {
  join?: ESequenceRawDataJoin[];
  dataType: ESequenceRawDataType;
  sequenceId: number;
}
