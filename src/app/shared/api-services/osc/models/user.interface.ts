import { IGamification } from './gamification.interface';

export interface IUser {
  id: number;
  type: string;
  username: string;
  fullName: string;
  driverType: string;
  weeklyRank: number;
  overallRank: number;
  totalDistance: number;
  totalWaylensDistance: number;
  obdDistance: number;
  totalPhotos: number;
  totalTracks: number;
  gamification: IGamification;

  matchAPIResponseV1(response: any): IUser;
  matchAPIResponseV2(response: any): IUser;

}
