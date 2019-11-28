import { Observable } from 'rxjs/Observable';
import { IUser, ILeaderboard } from './models';

export interface IUserService {
  get(username: string): Observable<IUser>;
  getUsers(): Observable<IUser[]>;
  delete(proceedDeleteData: boolean): Observable<boolean>;
  getLeaderboard(period: string): Observable<ILeaderboard[]>;
}
