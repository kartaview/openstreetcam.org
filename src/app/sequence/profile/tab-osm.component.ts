import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Location } from '@angular/common';

import { PhotosIterator } from '../../shared/photos-iterator';
import { IApolloDetection, IApolloContribution } from '../../shared/api-services/apollo/models';
import { ApolloDetectionVxService } from '../../shared/api-services/apollo'

@Component({
  moduleId: module.id,
  selector: 'osc-sequence-tab-osm-edit',
  templateUrl: 'tab-osm.component.html',
  styleUrls: ['tabs-base.css']
})
export class SequenceTabOSMEditComponent implements OnInit {

  @Input() photosIterator: PhotosIterator;
  @Output() imageGalleryEvent = new EventEmitter();
  protected _contributors: IApolloContribution[] = null;
  @Input()
  set contributors(list: IApolloContribution[]) {
    this._contributors = list;
    this.currentDetectionContribution = null;
    if (this._contributors) {
      this._contributors.some(contribution => {
        contribution.edits.some(edit => {
          if (edit.type === 'EDIT_STATUS_CHANGE') {
            this.currentDetectionContribution = contribution;
            return true;
          }
        });
        if (this.currentDetectionContribution) {
          return true;
        }
      });
    }
  }
  get contributors(): IApolloContribution[] {
    return this._contributors;
  }

  public osmComparisonReviewedVisible = true;

  public currentDetection: IApolloDetection = null;
  public currentDetectionContribution: IApolloContribution = null;
  private _currentDetectionContributions: IApolloContribution[] = null; // top forwarded from parent
  public currentDetectionLabels = null;

  constructor(public apolloDetectionsService: ApolloDetectionVxService) {
  }

  ngOnInit() {
    this.photosIterator.currentDetection.subscribe(detection => {
      this.currentDetectionLabels = null;
      if (this.currentDetection !== detection) {
        this.currentDetection = detection;
        if (detection) {
          this.currentDetectionLabels = {
            osmComparison: this.currentDetection.getOsmComparisonLabel(),
            editStatus: this.currentDetection.getEditStatusLabel(),
          };
        }
      }
    });
  }

  callImageGalleryEvent(event) {
    this.imageGalleryEvent.emit(event);
  }

  closeOSMCompare() {
    this.photosIterator.clearCurrentDetection();
  }

}
