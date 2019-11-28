import { IRectangle } from './rectangle.interface';

export class Rectangle implements IRectangle {
  x;
  y;
  width;
  height;

  clone(): IRectangle {
    const newRectangle = new Rectangle();
    newRectangle.x = this.x;
    newRectangle.y = this.y;
    newRectangle.width = this.width;
    newRectangle.height = this.height;
    return newRectangle;
  }

  matchAPIResponseV2(response: any): IRectangle {
    this.x = response.x;
    this.y = response.y;
    this.width = response.width;
    this.height = response.height;
    return this;
  }

}
