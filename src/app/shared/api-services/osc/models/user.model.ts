import { IUser } from './user.interface';
import { Gamification } from './gamification.model';
export class User implements IUser {
  id;
  type;
  username;
  fullName;
  driverType;
  weeklyRank;
  overallRank;
  totalDistance;
  totalWaylensDistance;
  obdDistance;
  totalPhotos;
  totalTracks;
  gamification;

  matchAPIResponseV1(response: any): IUser {
    if (response.gamification) {
      this.gamification = new Gamification();
      this.gamification.matchAPIResponseV1(response.gamification);
    }
    this.id = parseInt(response.id, 10);
    this.type = response.type;
    this.username = response.username;
    this.fullName = response.full_name;
    this.driverType = response.driver_type;
    this.weeklyRank = response.weeklyRank;
    this.overallRank = response.overallRank;
    this.totalDistance = response.totalDistance;
    this.totalWaylensDistance = response.totalWaylensDistance;
    this.obdDistance = response.obdDistance;
    this.totalPhotos = response.totalPhotos;
    this.totalTracks = response.totalTracks;
    return this;
  }

  matchAPIResponseV2(response: any): IUser {
    return this;
  }

}
