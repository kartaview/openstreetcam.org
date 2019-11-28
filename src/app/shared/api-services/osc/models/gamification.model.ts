import { IGamification } from './gamification.interface';
import { GamificationRegion } from './gamificationRegion.model';
export class Gamification implements IGamification {
  level;
  levelName;
  levelProgress;
  levelProgressPercent;
  levelTarget;
  rank;
  rankWeekly;
  region;
  totalUserPoints;
  totalUserWaylensPoints;
  userId;

  matchAPIResponseV1(response: any): IGamification {
    this.level = response.level;
    this.levelName = response.level_name;
    this.levelProgress = response.level_progress;
    this.levelProgressPercent = response.level_progress_percent;
    this.levelTarget = response.level_target;
    this.rank = response.rank;
    this.rankWeekly = response.rank_weekly;
    if (response.region) {
      this.region = new GamificationRegion();
      this.region.matchAPIResponseV1(response.region);
    }
    this.totalUserPoints = parseInt(response.total_user_points, 10);
    this.totalUserWaylensPoints = parseInt(response.total_user_waylens_points, 10);
    this.userId = response.userId;
    return this;
  }

  matchAPIResponseV2(response: any): IGamification {

    return this;
  }

}
