import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProcessedTracksComponent } from './processed-tracks.component';
import { ProcessedTracksRoutingModule } from './processed-tracks-routing.module';
import { SharedModule } from '../shared/shared.module';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@NgModule({
  imports: [CommonModule, SharedModule, ProcessedTracksRoutingModule, InfiniteScrollModule],
  declarations: [ProcessedTracksComponent],
  exports: [ProcessedTracksComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class ProcessedTracksModule { }
