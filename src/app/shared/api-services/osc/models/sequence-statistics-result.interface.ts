import { IResultMetadata } from '../../common/models/result-metadata.interface';
import { ISequenceStatistics } from './sequence-statistics.interface';

export interface ISequenceStatisticsResult {
  resultMetadata: IResultMetadata;
  statistics: ISequenceStatistics[];

  matchAPIResponseV1(response: any): ISequenceStatisticsResult;
  matchAPIResponseV2(response: any): ISequenceStatisticsResult;

}
