import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { SharedModule } from '../shared/shared.module';
import { DeleteAccountModalComponent } from './modals/delete-account.component';
import { SequenceNearbyTracksComponent } from './elements/nearby-tracks.component';
import { SequenceNearbyTracksV2Component } from './elements/nearby-tracks-v2.component';
import { HomeMapFiltersComponent } from './elements/map-filters.component';

@NgModule({
  imports: [HomeRoutingModule, SharedModule, NgbModule],
  declarations: [
    HomeComponent, SequenceNearbyTracksComponent, SequenceNearbyTracksV2Component, HomeMapFiltersComponent,
    DeleteAccountModalComponent
  ],
  exports: [HomeComponent, SequenceNearbyTracksComponent, SequenceNearbyTracksV2Component, HomeMapFiltersComponent],
  entryComponents: [DeleteAccountModalComponent],
  providers: []
})
export class HomeModule { }
