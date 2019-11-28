export interface IResultMetadata {
  page: number;
  itemsPerPage: number;
  totalElements: number;
  hasMore(): boolean;

  matchAPIResponseV1(response: any): IResultMetadata;
  matchAPIResponseV2(response: any): IResultMetadata;

}
