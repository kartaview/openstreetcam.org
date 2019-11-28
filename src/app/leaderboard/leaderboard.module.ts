import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaderboardComponent } from './leaderboard.component';
import { LeaderboardRoutingModule } from './leaderboard-routing.module';

import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [CommonModule, SharedModule, LeaderboardRoutingModule],
  declarations: [LeaderboardComponent],
  exports: [LeaderboardComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class LeaderboardModule { }
