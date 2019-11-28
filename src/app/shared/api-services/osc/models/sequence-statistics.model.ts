import { ISequenceStatistics } from './sequence-statistics.interface';

export class SequenceStatistics implements ISequenceStatistics {
  address;
  openTasksCount;
  totalDetections;
  sequenceId;
  thumb;
  username;

  matchAPIResponseV1(response: any): ISequenceStatistics {
    this.address = response.address;
    this.openTasksCount = response.openTasksCount;
    this.sequenceId = response.sequenceId;
    this.thumb = response.thumb;
    this.username = response.username;
    this.totalDetections = response.totalDetections;
    return this;
  }

  matchAPIResponseV2(response: any): ISequenceStatistics {
    return this;
  }

}
