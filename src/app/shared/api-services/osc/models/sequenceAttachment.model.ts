import { ISequenceAttachment, ISequenceAttachmentMetadata } from './sequenceAttachment.interface';
import { ESequenceAttachmentType } from '../requests/v2';
import { Sequence } from './sequence.model';
export class SequenceAttachment implements ISequenceAttachment {
  id;
  dataType;
  filemd5;
  filename;
  filepath;
  filesize;
  fileurl;
  processingError;
  processingResult;
  processingStatus;
  sequenceId;
  sequenceIndex;
  status;
  storage;
  dateAdded;
  sequence;

  matchAPIResponseV2(response: any): ISequenceAttachment {
    this.id = parseInt(response.id, 10);
    this.dataType = response.dataType === 'TAGGED_ROADS' ? ESequenceAttachmentType.TAGGED_ROADS : ESequenceAttachmentType.UNKNOWN;
    this.filemd5 = response.filemd5;
    this.filename = response.filename;
    this.filepath = response.filepath;
    this.filesize = response.filesize;
    this.fileurl = response.fileurl;
    this.processingError = response.processingError;
    this.processingResult = response.processingResult;
    this.processingStatus = response.processingStatus;
    this.sequenceId = (response.sequence && response.sequence.id ? parseInt(response.sequence.id, 10) : parseInt(response.sequenceId, 10));
    this.sequenceIndex = parseInt(response.sequenceIndex, 10);
    this.status = response.status;
    this.storage = response.storage;
    this.dateAdded = response.dateAdded;
    this.sequence = null;
    if (response.sequence) {
      this.sequence = new Sequence();
      this.sequence.matchAPIResponseV2(response.sequence);
    }
    return this;
  }
}


export class SequenceAttachmentMetadata implements ISequenceAttachmentMetadata {
  hasMoreData: boolean;
  data: ISequenceAttachment[];

  matchAPIResponseV2(response: any): ISequenceAttachmentMetadata {
    this.data = [];
    this.hasMoreData = false;
    if (response) {
      response.data.forEach((responseItem) => {
        const attachment = new SequenceAttachment();
        this.data.push(attachment.matchAPIResponseV2(responseItem));
      });
      this.hasMoreData = response.hasMoreData;
    }
    return this;
  }
}
