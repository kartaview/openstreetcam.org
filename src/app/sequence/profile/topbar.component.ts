import { Component, Input } from '@angular/core';
import { Location } from '@angular/common';

import { Sequence } from '../../shared/api-services/osc/models';
import { PhotosIterator } from '../../shared/photos-iterator';

/**
 * This class represents the lazy loaded SequenceTopBarComponent.
 */
@Component({
  moduleId: module.id,
  selector: 'osc-sequence-topbar',
  templateUrl: 'topbar.component.html',
  styleUrls: ['topbar.component.css']
})
export class SequenceTopBarComponent {

  @Input() photosIterator: PhotosIterator;
  @Input() sequenceData: Sequence = null;

  /**
   * Creates an instance of the SequenceTopBarComponent
   */
  constructor(private location: Location) {
  }
  goBack() {
    this.location.back();
  }
}
