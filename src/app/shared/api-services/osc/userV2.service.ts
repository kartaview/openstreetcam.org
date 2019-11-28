import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { ApiOSCService } from '../api-osc.service';
import { IUser, User, ILeaderboard, Leaderboard } from './models';
import { IUserService } from './userService.interface';
import { AuthProviderService } from '../../auth/authProvider.service';


@Injectable()
export class UserV2Service implements IUserService {
  private _getUserUrl = '/2.0/user/';

  constructor(private _apiService: ApiOSCService, private auth: AuthProviderService) { }

  get(username: string): Observable<IUser> {
    return this._apiService.get(`${this._getUserUrl}/${username}`)
      .map((response: Response) => null)
      .catch(this._apiService.handleError);
  }

  getUsers(): Observable<IUser[]> {
    return this._apiService.get(`${this._getUserUrl}`)
      .map((response: Response) => null)
      .catch(this._apiService.handleError);
  }

  delete(proceedDeleteData: boolean): Observable<boolean> {
    return this._apiService.delete(`${this._getUserUrl}/${(proceedDeleteData ? 1 : 0)}`)
      .map((response: Response) => true)
      .catch(this._apiService.handleError);
  }

  getLeaderboard(period: string): Observable<ILeaderboard[]> {
    return this._apiService.post('/gm-leaderboard', { dateRange: period })
      .map((response: Response) => null)
      .catch(this._apiService.handleError);
  }
}
