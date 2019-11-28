import { IResultMetadata } from './result-metadata.interface';

export class ResultMetadata implements IResultMetadata {
  page = 1;
  itemsPerPage = 100;
  totalElements = 0;

  hasMore(): boolean {
    if (this.page < Math.ceil(this.totalElements / this.itemsPerPage)) {
      return true;
    }
    return false;
  }

  matchAPIResponseV1(response: any): IResultMetadata {
    this.itemsPerPage = response.resultMetadata.itemsPerPage;
    this.page = response.resultMetadata.page;
    this.totalElements = response.resultMetadata.totalElements;
    return this;
  }

  matchAPIResponseV2(response: any): IResultMetadata {
    return this;
  }

}
