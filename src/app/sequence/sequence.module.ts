import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PerfectScrollbarModule, PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';

import { SequenceComponent } from './sequence.component';
import { SignViewComponent } from './sign-view.component';
import { SequenceRoutingModule } from './sequence-routing.module';
import {
  SequenceImageGalleryComponent, SequenceInfoComponent, SequenceTrackBarComponent, SequenceTopBarComponent, SequenceGamificationComponent,
  DetectionsCarouselComponent, DetectionsFilterItemComponent, SequenceAddSignComponent, SequenceAddSignChildComponent,
  DetectionsFilterSignComponent, SequenceTabOSMEditComponent, SequenceTabDetectionsComponent, SequenceTabTrackDetailsComponent,
  DetectionInfoComponent
} from './profile';

import { SharedModule } from '../shared/shared.module';
import { NoJOSMModalComponent } from './modals/no-josm.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import {
  IdAlertModalContentComponent
} from '../shared/modals';

import { NewSignTypeModalComponent } from './modals';

@NgModule({
  imports: [
    CommonModule, SharedModule, SequenceRoutingModule, NgbModule,
    PerfectScrollbarModule,
  ],
  declarations: [
    SequenceComponent, SignViewComponent, SequenceImageGalleryComponent, SequenceInfoComponent, SequenceTrackBarComponent,
    SequenceTopBarComponent, SequenceGamificationComponent, SequenceAddSignComponent, SequenceAddSignChildComponent,
    DetectionsFilterItemComponent, SequenceTabOSMEditComponent, SequenceTabDetectionsComponent, SequenceTabTrackDetailsComponent,
    DetectionsFilterSignComponent,
    NoJOSMModalComponent, DetectionsCarouselComponent, IdAlertModalContentComponent, NewSignTypeModalComponent, DetectionInfoComponent
  ],
  exports: [
    SequenceComponent, SignViewComponent, SequenceImageGalleryComponent, SequenceInfoComponent, SequenceTrackBarComponent,
    SequenceTopBarComponent, SequenceGamificationComponent, SequenceAddSignComponent, SequenceAddSignChildComponent,
    DetectionsFilterItemComponent, SequenceTabOSMEditComponent, SequenceTabDetectionsComponent, SequenceTabTrackDetailsComponent,
    DetectionsFilterSignComponent
  ],
  entryComponents: [NoJOSMModalComponent, NewSignTypeModalComponent],
})
export class SequenceModule { }
