import { Component, Input, OnInit } from '@angular/core';

import { ISequence, IUploadHistory } from '../../shared/api-services/osc/models';
import { IApolloDetection, IApolloContribution } from '../../shared/api-services/apollo/models';
import { PhotosIterator } from '../../shared/photos-iterator';

@Component({
  moduleId: module.id,
  selector: 'osc-detection-info',
  templateUrl: 'detection-info.component.html',
  styleUrls: ['detection-info.component.css']
})
export class DetectionInfoComponent {
  protected _contributions: Array<IApolloContribution>;
  @Input() isLoading = false;
  @Input() error = false;
  @Input() photosIterator: PhotosIterator;
  @Input() detection: IApolloDetection = null;
  @Input()
  set contributions(contributions: Array<IApolloContribution>) {
    this._contributions = contributions;
    this.updateContributors();
  }
  get contributions(): Array<IApolloContribution> {
    return this._contributions;
  };

  osmContribution: IApolloContribution;
  oscContribution: IApolloContribution;
  constructor() {
  }

  updateContributors() {
    this.osmContribution = null;
    this.oscContribution = null
    if (this._contributions) {
      for (const contribution of this._contributions) {
        for (const edit of contribution.edits) {
          if (edit.type === 'EDIT_STATUS_CHANGE') {
            if (!this.osmContribution) {
              this.osmContribution = contribution;
            }
          }
          if (edit.type === 'SIGN_CHANGE' || edit.type === 'VALIDATION_STATUS_CHANGE') {
            if (!this.oscContribution) {
              this.oscContribution = contribution;
            }
          }
        }
      }
    }
  }
}
