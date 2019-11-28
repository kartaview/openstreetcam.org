import { InitParams } from '../initParams';
import { IAuthProvider } from '../authProvider.interface';
import { SessionData } from '../sessionData';

export abstract class AuthProviderOAuth1Abstract implements IAuthProvider {
  TOKEN_PARAM: string;
  SECRET_PARAM: string;
  REQUEST_SECRET_PARAM: string;
  VERSION = '1';
  protected _name: string;
  protected _apolloName: string;
  protected _config;
  protected _oauth;
  protected _sessionData: SessionData;

  constructor(initParams: InitParams, sessionData: SessionData) {
    this._config = {
      oauth_consumer_key: initParams.clientId,
      oauth_secret: initParams.secretKey,
      landing: initParams.redirectUri,
      auto: true
    }
    this._sessionData = sessionData;
    this._oauth = osmAuth(this._config);
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
      this._oauth.authenticate(() => {
        const token = this._sessionData.get(this.TOKEN_PARAM).replace(/\"/gi, '');
        const secret = this._sessionData.get(this.SECRET_PARAM).replace(/\"/gi, '');
        this._sessionData.unset(this.TOKEN_PARAM);
        this._sessionData.unset(this.SECRET_PARAM);
        this._sessionData.unset(this.REQUEST_SECRET_PARAM);
        resolve({ token: token, secret: secret });
      });
    });
  }

  logout() {
    return new Promise((resolve, reject) => {
      this._oauth.logout();
      resolve();
    });
  }

}
