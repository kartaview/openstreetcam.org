export interface ILeaderboard {
  id: number;
  username: string;
  fullName: string;
  level: number;
  countryCode: string;
  totalDistance: number;
  totalUserPoints: number;
  globalUserPoints: number;

  matchAPIResponseV1(response: any): ILeaderboard;
  matchAPIResponseV2(response: any): ILeaderboard;
}
