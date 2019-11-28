import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { NgbPopover, NgbDateStruct, NgbDatepicker } from '@ng-bootstrap/ng-bootstrap';

import { AuthProviderService, authProviderService } from '../../shared/auth/authProvider.service';

import { environment } from '../../../environments/environment';

@Component({
  moduleId: module.id,
  selector: 'osc-home-map-filters',
  templateUrl: 'map-filters.component.html',
  styleUrls: ['map-filters.component.css']
})
export class HomeMapFiltersComponent {
  @ViewChild('startDate') public startDate: NgbDatepicker;
  @ViewChild('endDate') public endDate: NgbDatepicker;

  @Output() onFiltersUpdate = new EventEmitter();

  mapFilters = {
    loggedUserEnabled: false,
    loggedUser: false,
    startDateEnabled: false,
    startDateApplied: false,
    startDate: '',
    startDateStruct: {
      year: 2018,
      month: 1,
      day: 1
    },

    endDateApplied: false,
    endDateEnabled: false,
    endDate: '',
    endDateStruct: {
      year: 2018,
      month: 1,
      day: 1
    },

    sequenceTypeEnabled: false,
    sequenceType: '',
    platformEnabled: false,
    platform: '',
    fieldOfViewEnabled: false,
    fieldOfView: ''
  };

  updateButtonDisabled = true;

  constructor(protected auth: AuthProviderService) {
    this.mapFilters.loggedUserEnabled = (auth.isLoggedIn() ? environment.features.homeMapFilters.loggedUser : false);
    this.mapFilters.startDateEnabled = environment.features.homeMapFilters.startDate;
    this.mapFilters.endDateEnabled = environment.features.homeMapFilters.endDate;
    this.mapFilters.sequenceTypeEnabled = environment.features.homeMapFilters.sequenceType;
    this.mapFilters.platformEnabled = environment.features.homeMapFilters.platform;
    this.mapFilters.fieldOfViewEnabled = environment.features.homeMapFilters.fieldOfView;
    this.resetFilters();
  }

  resetFilters() {
    this.mapFilters.loggedUser = false;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 1);
    this.mapFilters.startDate = this.toMysqlFormat(startDate);
    this.mapFilters.startDateApplied = false;
    this.mapFilters.startDateStruct = {
      year: startDate.getFullYear(),
      month: startDate.getMonth() + 1,
      day: startDate.getDate()
    };

    const endDate = new Date();
    this.mapFilters.endDate = this.toMysqlFormat(endDate);
    this.mapFilters.endDateApplied = false;
    this.mapFilters.endDateStruct = {
      year: endDate.getFullYear(),
      month: endDate.getMonth() + 1,
      day: endDate.getDate()
    };

    this.mapFilters.sequenceType = '';

    this.mapFilters.fieldOfView = '';
  }

  switchMyTracks(value) {
    this.mapFilters.loggedUser = value;
    this.updateButtonDisabled = false;
  }

  enableStartDate(value) {
    /* if (value) {
      this.mapFilters.startDateApplied = true;
    } else {
      this.mapFilters.startDateApplied = false;
    }*/
    this.updateButtonDisabled = false;
  }

  enableEndDate(value) {
    /* if (value) {
      this.mapFilters.endDateApplied = true;
    } else {
      this.mapFilters.endDateApplied = false;
    }*/
    this.updateButtonDisabled = false;
  }

  switchSequenceType(event) {
    this.updateButtonDisabled = false;
  }

  switchPlatform(event) {
    this.updateButtonDisabled = false;
  }

  switchFieldOfView(event) {
    this.updateButtonDisabled = false;
  }

  switchStartDate(event) {
    this.mapFilters.startDate = `${event.year}-${this.twoDigits(event.month)}-${this.twoDigits(event.day)}`;
    this.updateButtonDisabled = false;
  }

  switchEndDate(event) {
    this.mapFilters.endDate = `${event.year}-${this.twoDigits(event.month)}-${this.twoDigits(event.day)}`;
    this.updateButtonDisabled = false;
  }

  updateFilters() {
    if (this.updateButtonDisabled) {
      return;
    }
    this.updateButtonDisabled = true;
    let computedFilters = '';
    const result = {
      computedFilters: '',
      userIds: undefined,
      startDate: undefined,
      endDate: undefined,
      sequenceType: undefined,
      platform: undefined,
      fieldOfView: undefined
    };

    if (this.mapFilters.loggedUserEnabled && this.mapFilters.loggedUser && this.auth.isLoggedIn()) {
      computedFilters += (computedFilters.length > 0 ? '&' : '');
      computedFilters += 'userId=' + this.auth.getUserId();
      result.userIds = [this.auth.getUserId()];
    }

    if (this.mapFilters.sequenceTypeEnabled && this.mapFilters.sequenceType.length > 0) {
      computedFilters += (computedFilters.length > 0 ? '&' : '');
      computedFilters += 'sequenceType=' + this.mapFilters.sequenceType;
      result.sequenceType = this.mapFilters.sequenceType;
    }

    if (this.mapFilters.platformEnabled && this.mapFilters.platform.length > 0) {
      computedFilters += (computedFilters.length > 0 ? '&' : '');
      computedFilters += 'platform=' + this.mapFilters.platform;
      result.platform = this.mapFilters.platform;
    }

    if (this.mapFilters.fieldOfViewEnabled && this.mapFilters.fieldOfView.length > 0) {
      computedFilters += (computedFilters.length > 0 ? '&' : '');
      computedFilters += 'fieldOfView=' + this.mapFilters.fieldOfView;
      result.fieldOfView = this.mapFilters.fieldOfView;
    }

    if (this.mapFilters.startDateEnabled && this.mapFilters.startDateApplied && this.mapFilters.startDate.length > 0) {
      computedFilters += (computedFilters.length > 0 ? '&' : '');
      computedFilters += 'startDate=' + this.mapFilters.startDate;
      result.startDate = this.mapFilters.startDate;
    }

    if (this.mapFilters.endDateEnabled && this.mapFilters.endDateApplied && this.mapFilters.endDate.length > 0) {
      computedFilters += (computedFilters.length > 0 ? '&' : '');
      computedFilters += 'endDate=' + this.mapFilters.endDate;
      result.endDate = this.mapFilters.endDate;
    }

    result.computedFilters = computedFilters;
    console.log(result);
    this.onFiltersUpdate.emit(result);
  }

  twoDigits(value: number) {
    if (0 <= value && value < 10) {
      return '0' + value.toString();
    }
    if (-10 < value && value < 0) {
      return '-0' + (-1 * value).toString();
    }
    return value.toString();
  }

  /**
  * …and then create the method to output the date string as desired.
  * Some people hate using prototypes this way, but if you are going
  * to apply this to more than one Date object, having it as a prototype
  * makes sense.
  **/
  toMysqlFormat(date): string {
    return date.getUTCFullYear() + '-' + this.twoDigits(1 + date.getUTCMonth()) + '-' + this.twoDigits(date.getUTCDate());
    // + ' ' + this.twoDigits(date.getUTCHours()) + ':' + this.twoDigits(date.getUTCMinutes()) + ':' + this.twoDigits(date.getUTCSeconds());
  }
}
