import { Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef } from '@angular/core';
import { PhotosIterator } from '../../shared/photos-iterator';
import { IPhoto } from '../../shared/api-services/osc/models';
import { environment } from 'environments/environment';

/**
 * This class represents the lazy loaded SequenceTrackBarComponent.
 */
@Component({
  moduleId: module.id,
  selector: 'osc-sequence-image-trackbar',
  templateUrl: 'trackbar.component.html',
  styleUrls: ['trackbar.component.css']
})
export class SequenceTrackBarComponent implements OnInit {

  @Output() imageGalleryEvent = new EventEmitter();
  @Input() showFullSizePhotos = false;
  @Input() showFullSizeWrapped360 = false;
  @Input() panAndZoomToDetectionEnabled = false

  @Input() photosIterator: PhotosIterator;

  @ViewChild('dragCursorElement') dragCursorElement: ElementRef;
  @ViewChild('progressBarLine') progressBarLineElement: ElementRef;


  dragCursor = false;
  dragCursorX = 0;
  dragCursorXDiff = 0;
  dragCursorWidth = 0;
  dragCursorPercent = 0;

  @Input() sequenceData;
  currentPhotoValue: IPhoto;

  @Input() rotationStarted = false;

  mobileDropDownVisible = false;
  enabled360Button = false;

  /**
   * Creates an instance of the SequenceImageScrollerComponent
   */
  constructor() {
    this.enabled360Button = environment.features.showPanorama360Button;
  }

  ngOnInit() {
    this.photosIterator.currentPhoto.subscribe(photoData => {
      if (photoData) {
        this.currentPhotoValue = photoData;
      }
    });
  }

  trackbarClick(event, element: HTMLDivElement) {
    if (this.photosIterator.currentStats.photosCount === 0) {
      return;
    }
    if (window.innerWidth <= 959) {
      let progress = event.pageX / (element.offsetWidth / 100);
      if (progress < 0) {
        progress = 0;
      } else if (progress > 100) {
        progress = 100;
      }
      this.photosIterator.switchToPhotoPercent(progress);
    } else {
      let progress = (event.pageX - element.getBoundingClientRect().left) / (element.offsetWidth / 100);
      if (progress < 0) {
        progress = 0;
      } else if (progress > 100) {
        progress = 100;
      }
      this.photosIterator.switchToPhotoPercent(progress);
    }
  }
  /*  scrollDragEnd(event, element: HTMLDivElement) {
      event.stopPropagation();
      let progress = (event.pageX - element.getBoundingClientRect().left) / (element.offsetWidth / 100);
      if (progress < 0) {
        progress = 0;
      } else if (progress > 100) {
        progress = 100;
      }
    this.photosIterator.switchToPhotoPercent(progress);
  }*/

  callImageGalleryEvent(event) {
    this.imageGalleryEvent.emit(event);
  }

  fixDragPercent() {
    this.dragCursorPercent = (this.dragCursorX - this.dragCursorXDiff) / (this.dragCursorWidth / 100);
    if (this.dragCursorPercent > 100) {
      this.dragCursorPercent = 100;
    } else if (this.dragCursorPercent < 0) {
      this.dragCursorPercent = 0;
    }
  }

  protected _mouseDown(x, y) {
    this.dragCursor = true;
    this.dragCursorX = $(this.dragCursorElement.nativeElement).offset().left - $(this.progressBarLineElement.nativeElement).offset().left;
    this.dragCursorXDiff = 0;
    this.dragCursorWidth = $(this.progressBarLineElement.nativeElement).width();
    this.fixDragPercent();

  }

  mouseDown(event) {
    if (this.photosIterator.currentStats.photosCount === 0) {
      return;
    }
    if (!this.dragCursor && event.which === 1) {
      event.preventDefault();
      event.stopPropagation();
      this._mouseDown(event.pageX, event.pageY);
    }
  }

  touchDown(event) {
    if (this.photosIterator.currentStats.photosCount === 0) {
      return;
    }
    if (!this.dragCursor && event.touches.length === 1) {
      event.preventDefault();
      event.stopPropagation();
      this._mouseDown(event.touches[0].pageX, event.touches[0].pageY);
    }
  }

  protected _mouseMove(x, y) {
    this.dragCursorX = x - $(this.progressBarLineElement.nativeElement).offset().left;
    this.fixDragPercent();
  }

  mouseMove(event) {
    if (this.dragCursor) {
      event.preventDefault();
      event.stopPropagation();
      this._mouseMove(event.pageX, event.pageY);
    }
  }
  touchMove(event) {
    if (this.dragCursor) {
      event.preventDefault();
      event.stopPropagation();
      this._mouseMove(event.touches[0].pageX, event.touches[0].pageY);
    }
  }

  protected _mouseUp() {
    this.photosIterator.switchToPhotoPercent(this.dragCursorPercent);
    this.dragCursor = false

  }

  mouseUp(event) {
    if (this.dragCursor) {
      event.preventDefault();
      event.stopPropagation();
      this._mouseUp();
    }
  }

  touchUp(event) {
    if (this.dragCursor) {
      event.preventDefault();
      event.stopPropagation();
      this._mouseUp();
    }
  }

  openDropUpMenu() {
    this.mobileDropDownVisible = true;
  }

  closeDropUpMenu() {
    this.mobileDropDownVisible = false;
  }

  nextPhoto() {
    if (this.photosIterator.currentStats.photosCount === 0) {
      return;
    }
    this.photosIterator.switchToNextPhoto();
  }

  prevPhoto() {
    if (this.photosIterator.currentStats.photosCount === 0) {
      return;
    }
    this.photosIterator.switchToPrevPhoto();
  }
}
