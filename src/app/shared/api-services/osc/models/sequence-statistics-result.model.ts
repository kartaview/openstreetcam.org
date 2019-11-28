import { SequenceStatistics } from './sequence-statistics.model';
import { ResultMetadata } from '../../common/models/result-metadata.model';
import { ISequenceStatisticsResult } from './sequence-statistics-result.interface';

export class SequenceStatisticsResult implements ISequenceStatisticsResult {
  resultMetadata;
  statistics = [];

  matchAPIResponseV1(response: any): ISequenceStatisticsResult {

    const apolloSequenceStatistics = new SequenceStatisticsResult();
    this.resultMetadata = new ResultMetadata();
    this.resultMetadata.matchAPIResponseV1(response);
    response.statistics.forEach(itemResponse => {
      const sequenceStatistic = new SequenceStatistics();

      this.statistics.push(sequenceStatistic.matchAPIResponseV1(itemResponse));
    });

    return this;
  }

  matchAPIResponseV2(response: any): ISequenceStatisticsResult {
    return this;
  }

}
