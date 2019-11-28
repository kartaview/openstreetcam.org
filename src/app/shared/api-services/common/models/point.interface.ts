export interface IPoint {
  lat: number;
  lon: number;
  clone(): IPoint;

  matchAPIResponseV2(response: any): IPoint;

}
