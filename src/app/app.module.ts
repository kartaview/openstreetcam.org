import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { ModalModule } from 'ngx-modialog';
import { BootstrapModalModule } from 'ngx-modialog/plugins/bootstrap';
import { NgxWebstorageModule } from 'ngx-webstorage';
import { ClickOutsideModule } from 'ng-click-outside';

// import { Angular2TokenService, A2tUiModule } from 'angular2-token';
import { Angular2SocialLoginModule } from 'angular2-social-login';

import { environment } from '../environments/environment';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { HomeModule } from './home/home.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { SequenceModule } from './sequence/sequence.module';
import { UserModule } from './user/user.module';

import { SharedModule } from './shared/shared.module';
import { StaticModule } from './static/static.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ProcessedTracksModule } from './processed-tracks/processed-tracks.module';

@NgModule({
  imports: [
    BrowserModule,
    ModalModule.forRoot(),
    BootstrapModalModule,
    // A2tUiModule,
    FormsModule,
    HttpModule,
    NgxWebstorageModule.forRoot(),
    ClickOutsideModule,

    HomeModule,
    LeaderboardModule,
    SequenceModule,
    UserModule,
    StaticModule,
    ProcessedTracksModule,

    AppRoutingModule,
    SharedModule.forRoot(),
    NgbModule.forRoot()
  ],
  declarations: [
    AppComponent
  ],
  // providers: [Angular2TokenService],
  bootstrap: [AppComponent],
})
export class AppModule { }
