import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { ApiOSCService } from '../api-osc.service';
import { IUser, User, ILeaderboard, Leaderboard } from './models';
import { IUserService } from './userService.interface';
import { AuthProviderService } from '../../auth/authProvider.service';


@Injectable()
export class UserVxService implements IUserService {
  private _getUserUrl = '/1.0/user';

  constructor(private _apiService: ApiOSCService, private auth: AuthProviderService) { }

  get(username: string): Observable<IUser> {
    const date = new Date();
    const dateObject = new Date();
    dateObject.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1));
    const dateString = dateObject.getFullYear() + '-' +
      (dateObject.getMonth() + 1 < 10 ? '0' + (dateObject.getMonth() + 1) : dateObject.getMonth() + 1) + '-' +
      (dateObject.getDate() < 10 ? '0' + dateObject.getDate() : dateObject.getDate());
    return this._apiService.post(`${this._getUserUrl}/details/`, { username: username, fromDate: dateString })
      .map((response: Response) => {
        const json = response.json();
        if (json.osv) {
          const user = new User();
          return user.matchAPIResponseV1(json.osv);
        }
        return null;
      })
      .catch(this._apiService.handleError);
  }

  getUsers(): Observable<IUser[]> {
    return this._apiService.post(`${this._getUserUrl}`, {})
      .map((response: Response) => {
        const users: User[] = [];
        const json = response.json();
        if (json.osv) {
          json.osv.forEach(responseItem => {
            const user = new User();
            users.push(user.matchAPIResponseV1(responseItem));
          });
        }
        return users;
      })
      .catch(this._apiService.handleError);
  }

  delete(proceedDeleteData: boolean): Observable<boolean> {
    return this._apiService.post(`${this._getUserUrl}/remove/`,
      {
        deleteData: (proceedDeleteData ? 1 : 0),
        username: this.auth.getUsername()
      })
      .map((response: Response) => {
        const json = response.json();
        return json.status.apiCode === '600';
      })
      .catch(this._apiService.handleError);
  }

  getLeaderboard(period: string): Observable<ILeaderboard[]> {
    return this._apiService.post('/gm-leaderboard', { dateRange: period })
      .map((response: Response) => {
        const users: ILeaderboard[] = [];
        const json = response.json();
        if (json.osv && json.osv.users) {
          json.osv.users.forEach(responseItem => {
            const user = new Leaderboard();
            users.push(user.matchAPIResponseV1(responseItem));
          });
        }
        return users;
      })
      .catch(this._apiService.handleError);
  }

}
