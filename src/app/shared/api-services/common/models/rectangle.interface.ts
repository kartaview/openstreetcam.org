export interface IRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  clone(): IRectangle;

  matchAPIResponseV2(response: any): IRectangle;

}
