import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { UserVxService } from '../shared/api-services/osc/userVx.service';
import { SequenceVxService } from '../shared/api-services/osc/sequenceVx.service';
import { OSCApiService } from '../shared/osc-api/osc-api.service';
import { NavbarService } from '../shared/navbar/navbar.service';

import { AuthProviderService } from '../shared/auth/authProvider.service';

/**
 * This class represents the lazy loaded UserComponent.
 */
@Component({
  moduleId: module.id,
  selector: 'osc-user',
  templateUrl: 'user.component.html',
  styleUrls: ['user.component.css']
})
export class UserComponent implements OnInit {

  isLoading = false;
  errorFound = false;
  userData: any = {};
  userSequences = [];
  userSequencesPaginationLoading = false;
  userSequencesPaginationError = false;
  userSequencesHasMorePages = false;
  userSequencesStatus: any = {};
  userSequencesPage = 1;
  loadingMessage = 'Loading profile data...';
  errorMessage = 'Profile cannot be loaded...';

  private sub: any;      // -> Subscriber
  private currentUsername: string;
  private currentUserId: number;
  /**
   * Creates an instance of the UserComponent with the injected
   * UserVxService.
   *
   * @param {UserVxService} userService - The injected UserVxService.
   */
  constructor(public userService: UserVxService, public sequenceService: SequenceVxService, public route: ActivatedRoute,
    public navbarService: NavbarService, public auth: AuthProviderService) {
  }
  ngOnInit() {
    // get URL parameters
    this.navbarService.setTheme('blue');
    this.sub = this.route
      .params
      .subscribe(params => {
        this.currentUsername = params['username'];
        this.getUserData();
      });
  }
  getUserData() {
    this.errorFound = false;
    this.loadingMessage = 'Loading profile data...';
    this._showLoading();
    this.userService.get(this.currentUsername).subscribe(
      userData => {
        this.userData = userData;
        this.currentUserId = userData.id;
        this.getUserSequences();
      },
      error => {
        this._hideLoading();
        this.errorFound = true;
        this.errorMessage = 'Profile cannot be loaded...';
      }
    );
  }
  getUserSequences() {
    this.errorFound = false;
    this.loadingMessage = 'Loading profile sequences...';
    this._showLoading()
    this.sequenceService.getSequences({ userId: this.currentUserId, page: 1 }).subscribe(
      userSequencesData => {
        this.userSequencesPage = 1;
        this.userSequencesHasMorePages = userSequencesData.hasMoreData;
        this.userSequences = userSequencesData.data;
        this.userSequencesStatus = userSequencesData.sequencesStatus;
        this._hideLoading();
      },
      error => {
        this._hideLoading();
        this.errorFound = true;
        this.errorMessage = 'Profile sequences cannot be loaded...';
      }
    );
  }
  onScroll() {
    this.userSequencesPaginationError = false;
    if (!this.userSequencesPaginationLoading && this.userSequencesHasMorePages) {
      this.userSequencesPaginationLoading = true;
      this.sequenceService.getSequences({ userId: this.currentUserId, page: this.userSequencesPage + 1 }).subscribe(
        userSequencesData => {
          this.userSequencesPage++;
          this.userSequences = this.userSequences.concat(userSequencesData.data);
          this.userSequencesHasMorePages = userSequencesData.hasMoreData;
          this.userSequencesPaginationLoading = false;
          this.userSequencesPaginationError = false;
        },
        error => {
          this.userSequencesPaginationLoading = false;
          this.userSequencesPaginationError = true;
        }
      );
    }
  }
  _showLoading() {
    this.isLoading = true;
  }
  _hideLoading() {
    this.isLoading = false;
  }

}
