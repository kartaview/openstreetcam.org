import { Component, OnInit } from '@angular/core';
import { ISequenceStatisticsResult, SequenceStatisticsResult, ISequenceStatistics } from '../shared/api-services/osc/models';
import { SequenceVxService } from '../shared/api-services/osc/sequenceVx.service';
import { PaginationOptions, IResultMetadata, Alert, IAlert } from '../shared/api-services/common/models';
import { Subject } from 'rxjs/Rx';

/**
 * This class represents the lazy loaded LeaderboardComponent.
 */
@Component({
  moduleId: module.id,
  selector: 'osc-processed-tracks',
  templateUrl: 'processed-tracks.component.html',
  styleUrls: ['processed-tracks.component.css']
})
export class ProcessedTracksComponent implements OnInit {

  isLoading = false;
  errorFound = false;
  resultMetadata: IResultMetadata;
  statisticsList: ISequenceStatistics[] = [];
  paginationOptions: PaginationOptions;
  alerts: Array<IAlert> = [];

  constructor(public sequenceService: SequenceVxService) { }

  ngOnInit() {
    this.paginationOptions = new PaginationOptions();
    this.paginationOptions.page = 1;
    this.paginationOptions.itemsPerPage = 40;
    this.getTracks();
  }

  getTracks() {
    this.errorFound = false;
    this._showLoading();
    this.sequenceService.getApolloStatistics(this.paginationOptions).subscribe(
      apolloSequenceStatistics => {
        this.resultMetadata = apolloSequenceStatistics.resultMetadata;
        this.statisticsList = this.statisticsList.concat(apolloSequenceStatistics.statistics);
        if (!apolloSequenceStatistics.statistics.length) {
          this.showAlert('warning', 'No tracks found!');
        }
        this._hideLoading();
      },
      error => {
        this._hideLoading();
        this.showAlert('danger', 'Ups! Server error has occured!');
      }
    );
  }
  _showLoading() {
    this.isLoading = true;
  }
  _hideLoading() {
    this.isLoading = false;
  }

  onScrollDown() {
    if (!this.isLoading) {
      if (this.resultMetadata.hasMore()) {
        this.paginationOptions.page++;
        this.getTracks();
      } else {
        this.showAlert('warning', 'There\'s no more tracks to be loaded.');
      }
    }
  }

  showAlert(type, message) {
    const alert = new Alert();
    alert.type = type;
    alert.message = message;
    this.alerts = [alert];
  }
}
