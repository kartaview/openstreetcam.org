export interface ISequenceStatistics {
  address: string;
  openTasksCount: number;
  totalDetections: number;
  sequenceId: number;
  thumb: string;
  username: string;

  matchAPIResponseV1(response: any): ISequenceStatistics;
  matchAPIResponseV2(response: any): ISequenceStatistics;

}
