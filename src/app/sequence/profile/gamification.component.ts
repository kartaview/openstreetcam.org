import { Component, Input } from '@angular/core';
import { ISequence, IUploadHistory } from '../../shared/api-services/osc/models';

/**
 * This class represents the lazy loaded SequenceGamificationComponent.
 */
@Component({
  moduleId: module.id,
  selector: 'osc-sequence-gamification',
  templateUrl: 'gamification.component.html',
  styleUrls: ['tabs-base.css', 'gamification.component.css']
})
export class SequenceGamificationComponent {

  @Input() sequenceData: ISequence = null;
  @Input() uploadHistory: IUploadHistory = null;
  /**
   * Creates an instance of the SequenceGamificationComponent
   */
  constructor() {
  }

}
