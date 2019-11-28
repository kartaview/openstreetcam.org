import { ISequence } from './sequence.interface';

export interface ISequenceNearby {
  from: number;
  lat: number;
  lng: number;
  to: number;
  way_id: number;
  sequences: ISequence[];

  matchAPIResponseV1(response: any): ISequenceNearby;
  matchAPIResponseV2(response: any): ISequenceNearby;

}
