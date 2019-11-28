import { ISequence } from './sequence.interface';


export interface ISequenceAttachment {
  id: number;
  dataType: string;
  dateAdded: string;
  filemd5: string;
  filename: string;
  filepath: string;
  filesize: number;
  fileurl: string;
  processingError: string;
  processingResult: string;
  processingStatus: string;
  sequenceId: number;
  sequenceIndex: number;
  status: string;
  storage: string;
  sequence: ISequence;

  matchAPIResponseV2(response: any): ISequenceAttachment;
}


export interface ISequenceAttachmentMetadata {
  hasMoreData: boolean;
  data: ISequenceAttachment[];

  matchAPIResponseV2(response: any[]): ISequenceAttachmentMetadata;
}

