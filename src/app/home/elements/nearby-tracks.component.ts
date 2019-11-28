import { Component, Input, Output, EventEmitter, NgZone, ViewChild, ElementRef } from '@angular/core';
import * as $ from 'jquery';

import { ISequence } from '../../shared/api-services/osc/models';

/**
 * This class represents the lazy loaded SequenceNearbyTracksComponent.
 */
@Component({
  moduleId: module.id,
  selector: 'osc-home-nearby-tracks',
  templateUrl: 'nearby-tracks.component.html',
  styleUrls: ['nearby-tracks.component.css']
})
export class SequenceNearbyTracksComponent {
  @Input() sequences: ISequence[] = [];
  @Input() isLoading = true;
  @Input() errorFound = false;
  @Output() onClose = new EventEmitter();

  @ViewChild('trackItems') trackItems: ElementRef;


  public width: number;
  public height: number;
  public sliderControlsWidth = 78;
  public cardWidth = 212;
  /**
   * Creates an instance of the SequenceNearbyTracksComponent
   */
  constructor(ngZone: NgZone) {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    window.onresize = (e) => {
      ngZone.run(() => {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
      });
    };
  }
  moveSliderLeft() {
    const slider: any = $(this.trackItems.nativeElement);
    const contentWidth = slider.width();
    const cardsMaxCount = Math.floor(slider.parent().width() / this.cardWidth);
    let sliderLeft = parseInt(slider.data('left'), 10) || 0;
    if (sliderLeft + (cardsMaxCount * this.cardWidth) < contentWidth) {
      const difference = Math.floor((contentWidth - (sliderLeft + (cardsMaxCount * this.cardWidth))) / this.cardWidth);
      if (difference > cardsMaxCount) {
        sliderLeft += cardsMaxCount * this.cardWidth;
      } else {
        sliderLeft += difference * this.cardWidth;
      }
    }
    slider.data('left', sliderLeft);
    slider.css('margin-left', -sliderLeft);
  }
  moveSliderRight() {
    const slider: any = $(this.trackItems.nativeElement);
    const cardsMaxCount = Math.floor(slider.parent().width() / this.cardWidth);
    let sliderLeft = parseInt(slider.data('left'), 10) || 0;
    if (sliderLeft > 0) {
      const difference = Math.floor(sliderLeft / this.cardWidth);
      if (difference > cardsMaxCount) {
        sliderLeft -= cardsMaxCount * this.cardWidth;
      } else {
        sliderLeft -= difference * this.cardWidth;
      }
    }
    slider.data('left', sliderLeft);
    slider.css('margin-left', -sliderLeft);
  }
  closeModal() {
    this.onClose.emit();
  }
}
