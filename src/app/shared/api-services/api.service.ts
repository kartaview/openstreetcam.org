import { Http, RequestOptions, Response, URLSearchParams, Headers } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { throwError } from 'rxjs';

@Injectable()
export class ApiService {
  protected _baseUrl;
  protected _headers;

  constructor(protected _httpClient: Http) {
  }

  get(url: string, body?: any): Observable<Response> {
    const params = new URLSearchParams();
    for (const key in body) {
      if (body.hasOwnProperty(key) && typeof body[key] !== 'undefined') {
        params.set(key, String(body[key]))
      }
    }
    return this._httpClient.get(`${this._baseUrl}${url}`, new RequestOptions({ headers: this._headers, search: params.toString() }));
  }

  post(url: string, body?: any): Observable<Response> {
    const params = new URLSearchParams();
    for (const key in body) {
      if (body.hasOwnProperty(key) && typeof body[key] !== 'undefined') {
        params.set(key, String(body[key]))
      }
    }
    return this._httpClient.post(`${this._baseUrl}${url}`, params.toString(), new RequestOptions({ headers: this._headers }));
  }

  delete(url: string, searchParams?: URLSearchParams): Observable<Response> {
    return this._httpClient.delete(`${this._baseUrl}${url}`, new RequestOptions({ headers: this._headers, search: searchParams }));
  }
  put(url: string, body?: any): Observable<Response> {
    const params = new URLSearchParams();
    for (const key in body) {
      if (body.hasOwnProperty(key) && typeof body[key] !== 'undefined') {
        params.set(key, String(body[key]))
      }
    }
    return this._httpClient.put(`${this._baseUrl}${url}`, params.toString(), new RequestOptions({ headers: this._headers }));
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
        errMsg += ' - ' + json.status.apiCode + ':' + json.status.apiMessage;
      }
    }
    console.error(errMsg); // log to console instead
    return throwError(errMsg);
  }

}
