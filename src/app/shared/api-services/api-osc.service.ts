import { Http, Headers, Response, RequestOptions, URLSearchParams } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { throwError } from 'rxjs';
import { Modal } from 'ngx-modialog/plugins/bootstrap';
import { overlayConfigFactory } from 'ngx-modialog';

import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';
import { AuthProviderService, authProviderService } from '../auth/authProvider.service'

import { AuthModalComponent, AuthModalContext } from '../modals/auth-modal.component';


@Injectable()
export class ApiOSCService extends ApiService {
  constructor(protected _httpClient: Http, protected _auth: AuthProviderService, protected modal: Modal) {
    super(_httpClient);
    if (environment.apiVersion === 1) {
      this._baseUrl = environment.apiV1HostName;
    } else {
      this._baseUrl = environment.apiV2HostName;
    }
    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    this._headers = headers;
  }

  get(url: string, body?: any): Observable<Response> {
    const params = new URLSearchParams();
    if (this._auth.isLoggedIn()) {
      params.set('access_token', this._auth.getAccessToken());
    }
    for (const key in body) {
      if (body.hasOwnProperty(key) && typeof body[key] !== 'undefined') {
        params.set(key, String(body[key]))
      }
    }
    return this._httpClient.get(`${this._baseUrl}${url}`, new RequestOptions({ headers: this._headers, search: params.toString() }));
  }

  post(url: string, body?: any): Observable<Response> {
    const params = new URLSearchParams();
    if (this._auth.isLoggedIn()) {
      params.set('access_token', this._auth.getAccessToken());
    }
    for (const key in body) {
      if (body.hasOwnProperty(key) && typeof body[key] !== 'undefined') {
        params.set(key, String(body[key]))
      }
    }
    return this._httpClient.post(`${this._baseUrl}${url}`, params.toString(), new RequestOptions({ headers: this._headers }));
  }

  public handleError(error: any) {
    console.log(error);
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    if (typeof error.json !== 'undefined') {
      const json = error.json();
      if (json.status && json.status.apiMessage) {
        if (json.status.apiCode === '401' && json.status.apiMessage === ' You have to be authenticated in order to access this method') {
          if (authProviderService.isLoggedIn()) {
            authProviderService.logout().then(result => {
              location.reload();
            });
          }
          if (!authProviderService.isLoggedIn() && this.modal) {
            const dialog = this.modal.open(AuthModalComponent, overlayConfigFactory({ size: 'sm', showDescription: true },
              AuthModalContext));
            dialog.result
              .then((r) => {
              }, (modalError) => {
                console.log('Dialog ended with failure: ', modalError);
              });
          }

        }
        errMsg += ' - ' + json.status.apiCode + ':' + json.status.apiMessage;
      }
    }
    console.error(errMsg); // log to console instead
    return throwError(errMsg);
  }

}
