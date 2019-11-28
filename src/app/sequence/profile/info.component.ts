import { Component, Input, OnInit } from '@angular/core';
import { PhotosIterator } from '../../shared/photos-iterator';
import { ISequence, IUploadHistory, IPhoto } from '../../shared/api-services/osc/models';
import { environment } from 'environments/environment';

/**
 * This class represents the lazy loaded SequenceInfoComponent.
 */
@Component({
  moduleId: module.id,
  selector: 'osc-sequence-info',
  templateUrl: 'info.component.html',
  styleUrls: ['tabs-base.css', 'info.component.css']
})
export class SequenceInfoComponent implements OnInit {

  @Input() sequenceData = null;
  @Input() uploadHistory: IUploadHistory = null;
  @Input() photosIterator: PhotosIterator;

  currentPhoto: IPhoto = null;
  segmentationToolEnabled = false;

  /**
   * Creates an instance of the SequenceInfoComponent
   */
  constructor() {
    this.segmentationToolEnabled = environment.features.segmentationToolEnabled;
  }

  ngOnInit() {
    this.photosIterator.currentPhoto.subscribe(photo => {
      this.currentPhoto = photo;
    });
  }

  openSegmentationTool(photoId) {
    window.open(`${environment.features.segmentationToolHostName}${photoId}`, '_blank');
  }

}
