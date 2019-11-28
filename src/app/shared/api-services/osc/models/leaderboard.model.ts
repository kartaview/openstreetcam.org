import { ILeaderboard } from './leaderboard.interface';
export class Leaderboard implements ILeaderboard {
  id;
  username;
  fullName;
  level;
  countryCode;
  totalDistance;
  totalUserPoints;
  globalUserPoints;

  matchAPIResponseV1(response: any): ILeaderboard {
    this.id = response.id;
    this.username = response.username;
    this.fullName = response.full_name;
    this.countryCode = response.country_code;
    this.level = response.level;
    this.globalUserPoints = response.global_user_points;
    this.totalDistance = response.total_distance;
    this.totalUserPoints = response.total_user_points;
    return this;
  }

  matchAPIResponseV2(response: any): ILeaderboard {
    return this;
  }
}
