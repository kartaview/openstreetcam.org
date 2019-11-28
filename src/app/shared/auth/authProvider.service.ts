import { Injectable } from '@angular/core';
import { IAuthProvider } from './authProvider.interface';
import { environment } from 'environments/environment';
import { InitParams } from './initParams';
import { SessionData } from './sessionData';
import { FacebookProvider, GoogleProvider, OpenstreetmapProvider } from './';
import { Http, RequestOptions, Headers, URLSearchParams } from '@angular/http';
import { IUser, User, Sequence, Photo } from '../api-services/osc/models';
import { AuthService } from 'angular2-social-login';

export let authProviderService = null;

@Injectable()
export class AuthProviderService {
  protected _authEndpoint: string;
  protected _providerName: string;
  protected _sessionData: SessionData;
  public loggedIn = false; // using method fires too many times.
  protected _provider: IAuthProvider;

  private SUPER_ADMIN_ROLE = 'ROLE_SUPER_ADMIN';

  constructor(protected _httpClient: Http, private _oauth1: AuthService) {
    authProviderService = this;
    this._sessionData = new SessionData();
    this._authEndpoint = environment.oauth.authEndPoint;
    this.loadProvider();
    if (this.isLoggedIn()) {
      this.loggedIn = true;
    }
  }

  loadProvider(provider?: string) {
    provider = provider ? provider : this._sessionData.get('loginProvider');
    switch (provider) {
      case 'openstreetmap':
        const initParams = environment.oauth.authProviders.oauth1.openstreetmap as InitParams;
        this._provider = new OpenstreetmapProvider(initParams, this._sessionData);
        break;
      case 'facebook':
        this._provider = new FacebookProvider(this._sessionData, this._oauth1);
        break;
      case 'google':
        this._provider = new GoogleProvider(this._sessionData, this._oauth1);
        break;
      default:
        break;
    }
  }

  can(permission: string, resource, parentUserId?: number): boolean {
    switch (permission) {
      case 'delete':
        return this._canDelete(resource, parentUserId);
      case 'rotate':
        return this._canRotate(resource, parentUserId);
      default:
        console.log('Rights validation: Wrong Permission');
        break;
    }
    return false;
  }

  protected _canDelete(resource, parentUserId?: number): boolean {
    if ((resource instanceof Sequence) && this.isLoggedIn()
      && (this.getUser().id === resource.userId || this.getUserRole() === this.SUPER_ADMIN_ROLE)) {
      return true;
    }
    if ((resource instanceof User) && this.isLoggedIn() && this.getUser().id === resource.id) {
      return true;
    }
    if ((resource instanceof Photo) && this.isLoggedIn()
      && (this.getUser().id === parentUserId || this.getUserRole() === this.SUPER_ADMIN_ROLE)) {
      return true;
    }
    return false;
  }

  protected _canRotate(resource, parentUserId?: number): boolean {
    if ((resource instanceof Sequence) && this.isLoggedIn()
      && (this.getUser().id === resource.userId || this.getUserRole() === this.SUPER_ADMIN_ROLE)) {
      return true;
    }
    if ((resource instanceof Photo) && this.isLoggedIn()
      && (this.getUser().id === parentUserId || this.getUserRole() === this.SUPER_ADMIN_ROLE)) {
      return true;
    }
    return false;
  }

  getProvider() {
    return this._provider;
  }

  getSessionData() {
    return this._sessionData;
  }

  getUser(): IUser {
    const user = new User();
    user.id = Number(this._sessionData.get('userId'));
    user.username = this._sessionData.get('username');
    user.fullName = this._sessionData.get('fullName');
    user.type = this._sessionData.get('userType');
    user.driverType = this._sessionData.get('driverType');
    return user;
  }

  getUserId(): number {
    return parseInt(this._sessionData.get('userId'), 10);
  }

  getUsername(): string {
    return this._sessionData.get('username');
  }

  getFullname(): string {
    return this._sessionData.get('fullName');
  }

  getUserType(): string {
    return this._sessionData.get('userType');
  }

  getDriverType(): string {
    return this._sessionData.get('driverType');
  }

  getAccessToken() {
    return this._sessionData.get('accessToken');
  };

  getUserRole() {
    return this._sessionData.get('userRole');
  }

  getExternalUserId() {
    return this._sessionData.get('externalUserId');
  }

  isLoggedIn(): boolean {
    if (this.getAccessToken()) {
      return true;
    }
    return false;
  }

  logout() {
    return new Promise((resolve, reject) => {
      if (this._provider) {
        this._provider.logout();
      }
      this._sessionData.clear();
      this.loggedIn = false;
      resolve(true);
    });
  }

  serverAuth(oauthToken, secretToken?) {
    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    const params = new URLSearchParams();
    params.append('request_token', oauthToken);
    params.append('secret_token', secretToken);
    const authEndPoint = this._authEndpoint.replace(/:provider/gi, this._providerName);
    return this._httpClient.post(authEndPoint, params.toString(), new RequestOptions({ headers: headers }))
      .map(data => this.matchResponse(data.json().osv));
  }

  matchResponse(data: any) {
    this._sessionData.set('accessToken', data.access_token);
    this._sessionData.set('userId', data.id);
    this._sessionData.set('fullName', data.full_name);
    this._sessionData.set('username', data.username);
    this._sessionData.set('type', data.type);
    this._sessionData.set('driverType', data.driver_type);
    this._sessionData.set('loginProvider', this._providerName);
    this._sessionData.set('userRole', data.role);
    this._sessionData.set('externalUserId', data.externalUserId);
  }

  login(provider: string) {
    return new Promise((resolve, reject) => {
      console.log('logging ' + provider);
      this._providerName = provider;
      this.loadProvider(provider);
      if (this._provider) {
        this._provider.login().then(loginData => {
          if (loginData['token']) {
            this.serverAuth(loginData['token'], loginData['secret']).subscribe(serverAuthData => {
              console.log('server auth');
              this.loggedIn = true;
              resolve(loginData);
            },
              error => {
                console.log(error);
                this.loggedIn = false;
                reject();
              });
          } else {
            this.loggedIn = false;
            reject();
          }
        }, error => {
          console.log(error);
          this.loggedIn = false;
          reject();
        });
      } else {
        this.loggedIn = false;
        reject();
      }
    });
  }
}
