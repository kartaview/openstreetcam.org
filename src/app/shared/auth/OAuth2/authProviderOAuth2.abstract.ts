
import { Injectable } from '@angular/core';
import { InitParams } from '../initParams';
import { IAuthProvider } from '../authProvider.interface';
import { SessionData } from '../sessionData';
import { AuthService } from 'angular2-social-login';

@Injectable()
export abstract class AuthProviderOAuth2Abstract implements IAuthProvider {
  VERSION = '1';
  protected _name: string;
  protected _type: string;
  protected _apolloName: string;

  constructor(public sessionData: SessionData, public oauth: AuthService) {
  }

  getName() {
    return this._name;
  }

  getApolloName() {
    return this._apolloName;
  }

  getVersion() {
    return this.VERSION;
  }

  login() {
    return new Promise((resolve, reject) => {
      this.oauth.login(this._name).subscribe(result => {
        resolve(result);
      },
        error => {
          console.log(error);
          reject(error);
        });
    });
  }

  logout() {
    return new Promise((resolve, reject) => {
      this.oauth.logout().subscribe(result => {
        resolve(result);
      });
    });
  }

}
