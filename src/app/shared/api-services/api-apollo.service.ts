import { Http, Headers, Response, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ApiService } from './api.service';

@Injectable()
export class ApiApolloService extends ApiService {
  constructor(protected _httpClient: Http) {
    super(_httpClient);
    if (environment.apollo.apiVersion === 2) {
      this._baseUrl = environment.apollo.apiV2HostName;
    } else {
      this._baseUrl = environment.apollo.apiV2HostName;
    }
    const headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    this._headers = headers;
  }

  post(url: string, body?: any): Observable<Response> {
    return this._httpClient.post(`${this._baseUrl}${url}`, JSON.stringify(body));
  }

  public handleError(error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    console.log('Handle error:');
    console.log(error);
    let errMsg = '';
    if (typeof error.json !== 'undefined') {
      const json = error.json();
      if (json.status && json.status.apiMessage) {
        errMsg = json.status.apiMessage;
      }
    }
    if (errMsg.length === 0) {
      errMsg = (error.message) ? error.message :
        error.status ? `${error.status} - ${error.statusText}` : 'Server error';
      // console.error(errMsg); // log to console instead
    }
    return throwError(errMsg);
  }


}
