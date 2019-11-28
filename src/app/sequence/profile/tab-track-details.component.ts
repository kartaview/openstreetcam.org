import { Component, Input } from '@angular/core';
import { Location } from '@angular/common';

import { PhotosIterator } from '../../shared/photos-iterator';
import { ISequence, IUploadHistory } from '../../shared/api-services/osc/models';

@Component({
  moduleId: module.id,
  selector: 'osc-sequence-tab-track-details',
  templateUrl: 'tab-track-details.component.html',
  styleUrls: ['tabs-base.css']
})
export class SequenceTabTrackDetailsComponent {

  @Input() sequenceData: ISequence = null;
  @Input() uploadHistory: IUploadHistory = null;
  @Input() photosIterator: PhotosIterator;

  constructor() {
  }

}
