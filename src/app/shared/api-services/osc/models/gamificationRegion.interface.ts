export interface IGamificationRegion {
  countryCode: string;
  points: number;
  rank: number;

  matchAPIResponseV1(response: any): IGamificationRegion;
  matchAPIResponseV2(response: any): IGamificationRegion;

}
