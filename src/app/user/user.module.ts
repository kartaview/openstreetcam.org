import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { UserComponent } from './user.component';
import { UserGamificationTopBarComponent } from './profile/gamification-topbar.component';
import { UserDriverTopBarComponent } from './profile/driver-topbar.component';
import { UserTopBarComponent } from './profile/topbar-common.component';
import { UserSequencesListComponent } from './profile/sequences-list.component';
import { UserRoutingModule } from './user-routing.module';

import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [CommonModule, InfiniteScrollModule, SharedModule, UserRoutingModule],
  declarations: [
    UserComponent, UserGamificationTopBarComponent, UserDriverTopBarComponent, UserSequencesListComponent,
    UserTopBarComponent
  ],
  exports: [
    UserComponent, UserGamificationTopBarComponent, UserDriverTopBarComponent, UserSequencesListComponent, UserTopBarComponent
  ]
})
export class UserModule { }
