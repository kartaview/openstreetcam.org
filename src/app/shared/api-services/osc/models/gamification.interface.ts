import { IGamificationRegion } from './gamificationRegion.interface';
export interface IGamification {
  level: number;
  levelName: string;
  levelProgress: number;
  levelProgressPercent: number;
  levelTarget: number;
  rank: number;
  rankWeekly: number;
  region: IGamificationRegion;
  totalUserPoints: number;
  totalUserWaylensPoints: number;
  userId: number;

  matchAPIResponseV1(response: any): IGamification;
  matchAPIResponseV2(response: any): IGamification;
}
