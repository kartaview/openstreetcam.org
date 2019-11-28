import { IApiOSCV2RequestOptions } from './apiOSCV2RequestOptions.interface';

export enum ESequenceAttachmentJoin {
  METADATA = 'metadata',
  SEQUENCE = 'sequence',
  USER = 'user'
}

export enum ESequenceAttachmentType {
  TAGGED_ROADS = 'TAGGED_ROADS',
  UNKNOWN = 'UNKNOWN'
}

export interface IApiOSCSequenceAttachmentRequestOptions extends IApiOSCV2RequestOptions {
  join?: ESequenceAttachmentJoin[];
  dataType: ESequenceAttachmentType;
  sequenceId: number;
}

