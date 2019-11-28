import { IPoint } from './point.interface';

export class Point implements IPoint {
  lat;
  lon;

  clone(): IPoint {
    const newPoint = new Point();
    newPoint.lat = this.lat;
    newPoint.lon = this.lon;
    return newPoint;
  }

  matchAPIResponseV2(response: any): IPoint {
    this.lat = response.lat;
    this.lon = response.lon;
    return this;
  }

}
