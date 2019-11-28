import {
  Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild
} from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';

import { PerfectScrollbarConfigInterface, PerfectScrollbarComponent, PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';


import { IApolloDetection } from '../../shared/api-services/apollo/models';
import { PhotosIterator } from '../../shared/photos-iterator';

@Component({
  selector: 'osc-detections-carousel',
  templateUrl: './detections-carousel.component.html',
  styleUrls: ['./detections-carousel.component.css']
})
export class DetectionsCarouselComponent implements OnInit, OnDestroy {
  public perfectScrollbarOptions: PerfectScrollbarConfigInterface = {
    suppressScrollY: true,
    useBothWheelAxes: true
  };

  @ViewChild(PerfectScrollbarComponent) componentScroll: PerfectScrollbarComponent;
  @ViewChild(PerfectScrollbarDirective) directiveScroll: PerfectScrollbarDirective;

  private scrollToDetectionTimeout = null;
  protected currentDetections = [];

  private detectionSubscription: ISubscription = null;
  private detectionsSubscription: ISubscription = null;

  @Input() photosIterator: PhotosIterator;
  @Input() detectionsCountEstimation = false;
  @Output() onScrollXEnd = new EventEmitter();

  onScrollXEndTimeout = null;

  constructor() {
  }

  ngOnInit() {
    this.detectionsSubscription = this.photosIterator.filteredDetectionsStream.subscribe(detections => {
      this.currentDetections = detections;
      console.log('filtered detections changed');
      setTimeout(() => {
        this.componentScroll.directiveRef.update();
        this.scrollToDetection();
      }, 1);
    });
    this.detectionSubscription = this.photosIterator.currentDetection.subscribe(detection => {
      console.log('detection changed');
      if (detection) {
        setTimeout(() => {
          this.componentScroll.directiveRef.update();
          this.scrollToDetection();
        }, 1);
      }
    });
  }

  ngOnDestroy() {
    this.detectionSubscription.unsubscribe();
    this.detectionsSubscription.unsubscribe();
  }


  carouselItemVisible(jqueryElement): any {
    if (jqueryElement && jqueryElement.length > 0) {
      const componentWidthDiff = 10;
      if (!$('#carousel-detections-scrollbar > div')[0]) {
        return {
          visible: true
        };
      }

      const scrollLeft = $('#carousel-detections-scrollbar > div')[0].scrollLeft;
      const scrollWidth = $('#carousel-detections-scrollbar').width();
      const elementLeft = jqueryElement.parent()[0].offsetLeft + jqueryElement[0].offsetLeft;
      const elementWidth = jqueryElement.outerWidth();
      console.log(elementLeft + ' ' + (elementLeft + elementWidth + componentWidthDiff));
      console.log(scrollLeft + ' ' + (scrollLeft + scrollWidth));
      if (elementLeft >= scrollLeft && elementLeft + elementWidth + componentWidthDiff <= scrollLeft + scrollWidth) {
        return {
          visible: true
        }
      } else {
        if (elementLeft < scrollLeft) {
          return {
            visible: false,
            scrollToX: Math.round(elementLeft - componentWidthDiff)
          }
        } else if (elementLeft + elementWidth + componentWidthDiff > scrollLeft + scrollWidth) {
          return {
            visible: false,
            scrollToX: Math.round((elementLeft - scrollWidth) + elementWidth + componentWidthDiff)
          }
        }
      }
      throw new Error('something went wrong on carouselItemVisible!');
    } else {
      console.log('not found!');
      return {
        visible: true
      }
    }
  }

  scrollToDetection() {
    if (this.photosIterator.currentStats.detectionIndex !== null && this.photosIterator.currentStats.detectionsCount > 0 &&
      this.photosIterator.filteredDetectionsCache[this.photosIterator.currentStats.detectionIndex]
    ) {
      clearTimeout(this.scrollToDetectionTimeout);
      this.scrollToDetectionTimeout = setTimeout(() => {
        const foundItem = this.carouselItemVisible($(`#carousel-detection-${this.photosIterator.currentStats.detectionId}`));
        console.log(`#carousel-detection-${this.photosIterator.currentStats.detectionId}`);
        console.log(foundItem);
        if (!foundItem.visible) {
          this.componentScroll.directiveRef.scrollToX(foundItem.scrollToX);
        }
      }, 1);
    }
  }

  scrollToXEnd() {
    clearTimeout(this.onScrollXEndTimeout);
    this.onScrollXEndTimeout = setTimeout(() => {
      this.onScrollXEnd.emit();
    });
  }
}
