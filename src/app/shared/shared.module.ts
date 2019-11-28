import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { NavbarComponent } from './navbar/navbar.component';
import { NavbarService } from './navbar/navbar.service';

import { NotFoundComponent } from './not-found/not-found.component';

import { AppErrorComponent } from './elements/error.component';
import { MapComponent } from './elements/map.component';
import { SearchBoxComponent } from './elements/searchbox.component';
import { TimerComponent } from './elements/timer.component';
import { AppLoadingComponent } from './elements/loading.component';
import { NavbarAccountBlockComponent } from './elements/navbar-account-block.component';

import { OSCApiService } from './osc-api/osc-api.service';
import { ApiOSCService } from './api-services/api-osc.service';
import { ApiApolloService } from './api-services/api-apollo.service';


import { FloatNumberDraw, IntegerNumberDraw, RoadSignUrlPipe, ACLPermissionPipe, SearchSignPipe } from './pipes';

import {
  GetAppModalComponent, ConfirmModalComponent, BaseModalComponent, OsmEditingModalContentComponent,
  OsmAlertModalContentComponent, AuthModalComponent
} from './modals';
import { AuthProviderService } from './auth/authProvider.service';
import { AuthModule } from './auth/auth.module';
import { ApolloApiModule } from './api-services/apollo/apollo.module';
import { CommonApiModule } from './api-services/common/common.module';
import { OSCApiModule } from './api-services/osc/osc.module';

import { MouseWheelDirective } from './mouse-wheel.directive';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
/**
 * Do not specify providers for modules that might be imported by a lazy loaded module.
 */

@NgModule({
  imports: [CommonModule, RouterModule, FormsModule, NgbModule,
    ApolloApiModule.forRoot(), CommonApiModule.forRoot(), OSCApiModule.forRoot()],
  declarations: [
    NavbarComponent, NotFoundComponent, AppErrorComponent, AppLoadingComponent, MapComponent, SearchBoxComponent, TimerComponent,
    FloatNumberDraw, IntegerNumberDraw, RoadSignUrlPipe, ACLPermissionPipe, SearchSignPipe,
    GetAppModalComponent, BaseModalComponent, AuthModalComponent, NavbarAccountBlockComponent,
    MouseWheelDirective, OsmEditingModalContentComponent, OsmAlertModalContentComponent, ConfirmModalComponent
  ],
  exports: [
    NavbarComponent, AppErrorComponent, AppLoadingComponent, MapComponent, SearchBoxComponent, TimerComponent, NavbarAccountBlockComponent,
    FloatNumberDraw, IntegerNumberDraw, RoadSignUrlPipe, ACLPermissionPipe, SearchSignPipe,
    CommonModule, FormsModule, RouterModule, AuthModule,
    MouseWheelDirective
  ],
  entryComponents: [
    GetAppModalComponent, BaseModalComponent, AuthModalComponent,
    OsmEditingModalContentComponent, OsmAlertModalContentComponent, ConfirmModalComponent
  ]
})
export class SharedModule {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: SharedModule,
      providers: [
        OSCApiService, ApiOSCService,
        ApiApolloService, NavbarService, AuthProviderService
      ]
    };
  }
}
