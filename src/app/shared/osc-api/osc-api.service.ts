import { Injectable } from '@angular/core';
import { Http, Response, RequestOptions, Headers, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthProviderService } from '../auth/authProvider.service'


// import 'rxjs/add/operator/do';  // for debugging
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

/**
 * This class provides the OSCApi service with methods to read names and add names.
 */

@Injectable()
export class OSCApiService {
  private currentToken = 'empty';
  private loggedIn = false;
  currentUserData = {

  };
  /**
   * Creates a new OSCApiService with the injected Http.
   * @param {Http} http - The injected Http.
   * @constructor
   */
  constructor(private http: Http, protected _auth: AuthProviderService) { }
  urlEncode(obj: Object): string {
    const urlSearchParams = new URLSearchParams();
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        urlSearchParams.append(key, obj[key]);
      }
    }
    return urlSearchParams.toString();
  }
  isLoggedIn() {
    return this.loggedIn;
  }
  requestMapTracks(bbTopLeft, bbBottomRight, zoom, myTracks, page, ipp) {
    const currentHeader = new Headers();
    currentHeader.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    const rawBody = {
      bbTopLeft: bbTopLeft,
      bbBottomRight: bbBottomRight,
      drawTracks: '',
      platform: 'web',
      page: page,
      ipp: ipp,
      filterUserNames: false,
      zoom: zoom,
      myTracks: myTracks
    };
    if (this._auth.isLoggedIn()) {
      rawBody['access_token'] = this._auth.getAccessToken();
    }
    const body = this.urlEncode(rawBody);

    return this.http.post(`${environment.apiV1HostName}/tracks`, body, new RequestOptions({ headers: currentHeader }))
      .map((res: Response) => res.json())
      .catch(this.handleError);
  }

  requestMapTracksV2(bbTopLeft, bbBottomRight, zoom, myTracks, page, ipp) {
    /*    if (this._auth.isLoggedIn()) {
          rawBody['access_token'] = this._auth.getAccessToken();
        }
        const body = this.urlEncode(rawBody);*/

    return this.http.get(
      `${environment.apiV2HostName}/sequence/map-matched-tracks?bbTopLeft=${bbTopLeft}&bbBottomRight=${bbBottomRight}&zoomLevel=${zoom}`)
      .map((res: Response) => res.json().result)
      .catch(this.handleError);
  }

  requestMapSearch(searchString: string) {
    const currentHeader = new Headers();
    currentHeader.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    const body = `addr=${searchString}`;
    return this.http.post(`${environment.apiV1HostName}/1.0/map/search`, body, new RequestOptions({ headers: currentHeader }))
      .map((res: Response) => res.json().places)
      .catch(this.handleError);
  }

  requestLocation() {
    if (environment.apiVersion === 1) {
      return this.http.get(`${environment.apiV1HostName}/1.0/map/location`)
        .map((res: Response) => res.json().osv)
        .catch(this.handleError);
    } else {
      const currentHeader = new Headers();
      if (this.isLoggedIn) {
        currentHeader.append('X-AUTH-TOKEN', this.currentToken);
      }
      return this.http.get(`${environment.apiV2HostName}/1.0/map/location`, new RequestOptions({ headers: currentHeader }))
        .map((res: Response) => res.json().osv)
        .catch(this.handleError);
    }

  }
  /**
   * Returns an Observable for the HTTP GET request for the JSON resource.
   * @return {string[]} The Observable for the HTTP request.
   */
  getUserName() {
    return 'INVALID';
  }
  getLeaderboard(period = null): Observable<any[]> {
    const currentHeader = new Headers();
    if (environment.apiVersion === 1) {
      currentHeader.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      let body = ``;
      if (period) {
        body += (body.length > 0 ? '&' : '') + `dateRange=${period}`;
      }
      return this.http.post(`${environment.apiV1HostName}/gm-leaderboard`, body, new RequestOptions({ headers: currentHeader }))
        .map((res: Response) => res.json().osv.users)
        .catch(this.handleError);
    } else {
      if (this.isLoggedIn) {
        currentHeader.append('X-AUTH-TOKEN', this.currentToken);
      }
      return this.http.get(`${environment.apiV2HostName}/1.0/leaderboard`, new RequestOptions({ headers: currentHeader }))
        .map((res: Response) => res.json().osv.users)
        .catch(this.handleError);
    }
  }

  getUserProfile(userName: string): Observable<any[]> {
    const currentHeader = new Headers();
    if (environment.apiVersion === 1) {
      currentHeader.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      const body = `username=${userName}`;
      return this.http.post(`${environment.apiV1HostName}/1.0/user/details/`, body, new RequestOptions({ headers: currentHeader }))
        .map((res: Response) => res.json().osv)
        .catch(this.handleError);
    } else {
      if (this.isLoggedIn) {
        currentHeader.append('X-AUTH-TOKEN', this.currentToken);
      }
      return this.http.get(`${environment.apiV2HostName}/1.0/user/${userName}`, new RequestOptions({ headers: currentHeader }))
        .map((res: Response) => res.json().osv.user)
        .catch(this.handleError);
    }
  }
  fixUserSequences(sequencesData) {
    const newSequencesData = [];
    sequencesData.forEach((sequenceData) => {
      sequenceData.meta_data_filename = environment.baseUrl + '/' + sequenceData.meta_data_filename;
      sequenceData.thumb_name = environment.baseUrl + '/' + sequenceData.thumb_name;
      newSequencesData.push(sequenceData);
    });
    return newSequencesData;
  }
  getUserSequences(userName: string, page: number): Observable<any> {
    const currentHeader = new Headers();
    if (environment.apiVersion === 1) {
      const requestCount = 40;
      currentHeader.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      const body = `username=${userName}&page=${page}&ipp=${requestCount}`;
      return this.http.post(`${environment.apiV1HostName}/my-list`, body, new RequestOptions({ headers: currentHeader }))
        .map((res: Response) => {
          const json = res.json();
          return {
            sequencesList: this.fixUserSequences(json.currentPageItems),
            sequencesStatus: json.tracksStatus,
            hasMoreData: (json.totalFilteredItems - (requestCount * page)) > 0
          };
        })
        .catch(this.handleError);
    } else {
      if (this.isLoggedIn) {
        currentHeader.append('X-AUTH-TOKEN', this.currentToken);
      }
      return this.http.get(`${environment.apiV2HostName}/1.0/user/${userName}`, new RequestOptions({ headers: currentHeader }))
        .map((res: Response) => res.json().osv.user)
        .catch(this.handleError);
    }
  }
  getSequence(id): Observable<any[]> {
    const currentHeader = new Headers();
    if (environment.apiVersion === 1) {
      currentHeader.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      const body = `id=${id}&platform=web`;
      return this.http.post(`${environment.apiV1HostName}/details`, body, new RequestOptions({ headers: currentHeader }))
        .map((res: Response) => res.json().osv.users)
        .catch(this.handleError);
    } else {
      if (this.isLoggedIn) {
        currentHeader.append('X-AUTH-TOKEN', this.currentToken);
      }
      return this.http.get(`${environment.apiV2HostName}/1.0/sequence/${id}`, new RequestOptions({ headers: currentHeader }))
        .map((res: Response) => res.json().osv.users)
        .catch(this.handleError);
    }
  }

  /********* MAP REWARDS */
  getCampaignTypes(): Observable<any[]> {
    if (environment.apiVersion === 1) {
      return this.http.get(`${environment.apiV1HostName}/1.0/map-rewards/campaign-types`)
        .map((res: Response) => res.json().osv.campaignTypes)
        .catch(this.handleError);
    } else {
      const currentHeader = new Headers();
      if (this.isLoggedIn) {
        currentHeader.append('X-AUTH-TOKEN', this.currentToken);
      }
      return this.http.get(`${environment.apiV2HostName}/1.0/map-rewards/campaign-types`, new RequestOptions({ headers: currentHeader }))
        .map((res: Response) => res.json().osv.campaignTypes)
        .catch(this.handleError);
    }
  }
  getCampaigns(): Observable<any[]> {
    if (environment.apiVersion === 1) {
      return this.http.get(`${environment.apiV1HostName}/1.0/map-rewards/campaigns`)
        .map((res: Response) => res.json().osv.campaigns)
        .catch(this.handleError);
    } else {
      const currentHeader = new Headers();
      if (this.isLoggedIn) {
        currentHeader.append('X-AUTH-TOKEN', this.currentToken);
      }
      return this.http.get(`${environment.apiV2HostName}/1.0/map-rewards/campaigns`, new RequestOptions({ headers: currentHeader }))
        .map((res: Response) => res.json().osv.campaigns)
        .catch(this.handleError);
    }
  }
  getCampaign(id): Observable<any[]> {
    if (environment.apiVersion === 1) {
      return this.http.get(`${environment.apiV1HostName}/1.0/map-rewards/campaigns/${id}`)
        .map((res: Response) => res.json().osv.campaign)
        .catch(this.handleError);
    } else {
      const currentHeader = new Headers();
      if (this.isLoggedIn) {
        currentHeader.append('X-AUTH-TOKEN', this.currentToken);
      }
      return this.http.get(`${environment.apiV2HostName}/1.0/map-rewards/campaigns/${id}`, new RequestOptions({ headers: currentHeader }))
        .map((res: Response) => res.json().osv.campaigns)
        .catch(this.handleError);
    }
  }
  getCampaignPoints(id, options = {}): Observable<any> {
    if (environment.apiVersion === 1) {
      return this.http.get(`${environment.apiV1HostName}/1.0/map-rewards/campaigns/${id}/points?${this.urlEncode(options)}`)
        .map((res: Response) => { return { 'points': res.json().osv.points, 'nextPage': res.json().osv.nextPage }; })
        .catch(this.handleError);
    } else {
      const currentHeader = new Headers();
      if (this.isLoggedIn) {
        currentHeader.append('X-AUTH-TOKEN', this.currentToken);
      }
      return this.http.get(`${environment.apiV2HostName}/1.0/map-rewards/campaigns/${id}/points`,
        new RequestOptions({ headers: currentHeader }))
        .map((res: Response) => res.json().osv.points)
        .catch(this.handleError);
    }
  }
  regenerateMapRewardsCampaign(id): Observable<any> {
    const currentHeader = new Headers();
    if (environment.apiVersion === 1) {
      currentHeader.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      return this.http.post(`${environment.apiV1HostName}/1.0/map-rewards/regenerate-campaign/${id}`, '',
        new RequestOptions({ headers: currentHeader })
      )
        .map((res: Response) => res.json().osv.campaign)
        .catch(this.handleError);
    } else {
      if (this.isLoggedIn) {
        currentHeader.append('X-AUTH-TOKEN', this.currentToken);
      }
      return this.http.post(`${environment.apiV2HostName}/1.0/map-rewards/regenerate-campaign`, '',
        new RequestOptions({ headers: currentHeader })
      )
        .map((res: Response) => res.json().osv.campaign)
        .catch(this.handleError);
    }
  }
  deleteMapRewardsCampaign(id): Observable<any> {
    const currentHeader = new Headers();
    if (environment.apiVersion === 1) {
      currentHeader.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      return this.http.post(`${environment.apiV1HostName}/1.0/map-rewards/delete-campaign/${id}`, '',
        new RequestOptions({ headers: currentHeader })
      )
        .map((res: Response) => res.json().osv)
        .catch(this.handleError);
    } else {
      if (this.isLoggedIn) {
        currentHeader.append('X-AUTH-TOKEN', this.currentToken);
      }
      return this.http.post(`${environment.apiV2HostName}/1.0/map-rewards/delete-campaign/${id}`, '',
        new RequestOptions({ headers: currentHeader })
      )
        .map((res: Response) => res.json().osv)
        .catch(this.handleError);
    }
  }
  randomizeMapRewardsCampaign(id): Observable<any> {
    const currentHeader = new Headers();
    if (environment.apiVersion === 1) {
      currentHeader.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      return this.http.post(`${environment.apiV1HostName}/1.0/map-rewards/randomize-campaign/${id}`, '',
        new RequestOptions({ headers: currentHeader })
      )
        .map((res: Response) => res.json().osv)
        .catch(this.handleError);
    } else {
      if (this.isLoggedIn) {
        currentHeader.append('X-AUTH-TOKEN', this.currentToken);
      }
      return this.http.post(`${environment.apiV2HostName}/1.0/map-rewards/randomize-campaign/${id}`, '',
        new RequestOptions({ headers: currentHeader })
      )
        .map((res: Response) => res.json().osv)
        .catch(this.handleError);
    }
  }
  setCampaign(id, data): Observable<any> {
    const currentHeader = new Headers();
    if (environment.apiVersion === 1) {
      currentHeader.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      return this.http.post(`${environment.apiV1HostName}/1.0/map-rewards/set-campaign/${id}`,
        this.urlEncode(data), new RequestOptions({ headers: currentHeader })
      )
        .map((res: Response) => res.json().osv.campaign)
        .catch(this.handleError);
    } else {
      if (this.isLoggedIn) {
        currentHeader.append('X-AUTH-TOKEN', this.currentToken);
      }
      return this.http.post(`${environment.apiV2HostName}/1.0/map-rewards/new-campaign`, data,
        new RequestOptions({ headers: currentHeader })
      )
        .map((res: Response) => res.json().osv.campaign)
        .catch(this.handleError);
    }
  }
  newCampaign(data): Observable<any> {
    const currentHeader = new Headers();
    if (environment.apiVersion === 1) {
      currentHeader.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
      return this.http.post(`${environment.apiV1HostName}/1.0/map-rewards/new-campaign`, this.urlEncode(data),
        new RequestOptions({ headers: currentHeader })
      )
        .map((res: Response) => res.json().osv.campaign)
        .catch(this.handleError);
    } else {
      if (this.isLoggedIn) {
        currentHeader.append('X-AUTH-TOKEN', this.currentToken);
      }
      return this.http.post(`${environment.apiV2HostName}/1.0/map-rewards/new-campaign`, data,
        new RequestOptions({ headers: currentHeader })
      )
        .map((res: Response) => res.json().osv.campaign)
        .catch(this.handleError);
    }
  }
  /********* END OF MAP REWARDS */




  /**
    * Handle HTTP error
    */
  private handleError(error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    const errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return throwError(errMsg);
  }
}

