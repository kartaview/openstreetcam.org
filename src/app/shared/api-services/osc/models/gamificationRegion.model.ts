import { IGamificationRegion } from './gamificationRegion.interface';
export class GamificationRegion implements IGamificationRegion {
  countryCode;
  points;
  rank;

  matchAPIResponseV1(response: any): IGamificationRegion {
    this.countryCode = response.country_code;
    this.points = response.points;
    this.rank = response.rank;
    return this;
  }

  matchAPIResponseV2(response: any): IGamificationRegion {
    return this;
  }

}
