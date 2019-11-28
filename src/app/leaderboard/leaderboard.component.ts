import { Component, OnInit } from '@angular/core';
import { UserVxService } from '../shared/api-services/osc/userVx.service';
import { ILeaderboard, Leaderboard } from '../shared/api-services/osc/models';
import { NavbarService } from '../shared/navbar/navbar.service';

/**
 * This class represents the lazy loaded LeaderboardComponent.
 */
@Component({
  moduleId: module.id,
  selector: 'osc-leaderboard',
  templateUrl: 'leaderboard.component.html',
  styleUrls: ['leaderboard.component.css']
})
export class LeaderboardComponent implements OnInit {

  isLoading = false;
  errorFound = false;
  leaderboardUsers: ILeaderboard[] = [];
  leaderboardPeriod = 'all-time';

  /**
   * Creates an instance of the LeaderboardComponent with the injected
   * UserVxService.
   *
   * @param {UserVxService} userService - The injected UserVxService.
   */
  constructor(public userService: UserVxService, public navbarService: NavbarService) { }

  /**
   * Get the names OnInit
   */
  ngOnInit() {
    this.navbarService.setTheme('white');
    this.getLeaderboardData();
  }
  /**
   * Handle the Leaderboard observable
   */
  getLeaderboardData() {
    this.errorFound = false;
    this._showLoading()
    this.userService.getLeaderboard(this.leaderboardPeriod).subscribe(
      leaderboardUsers => {
        this.leaderboardUsers = leaderboardUsers;
        this._hideLoading();
      },
      error => {
        this._hideLoading();
        this.errorFound = true;
      }
    );
  }
  _showLoading() {
    this.isLoading = true;
  }
  _hideLoading() {
    this.isLoading = false;
  }
  switchToDaily(event) {
    this.leaderboardPeriod = 'day';
    this.getLeaderboardData();
  }
  switchToWeekly(event) {
    this.leaderboardPeriod = 'week';
    this.getLeaderboardData();
  }
  switchToMonthly(event) {
    this.leaderboardPeriod = 'month';
    this.getLeaderboardData();
  }
  switchToAllTime(event) {
    this.leaderboardPeriod = 'all-time';
    this.getLeaderboardData();
  }
}
