import { NgModule } from '@angular/core';
import { AuthComponent } from './auth.component';
import { AuthRoutingModule } from './auth-routing.module';
import { AuthProviderService } from './authProvider.service';
import { Angular2SocialLoginModule } from 'angular2-social-login';
import { environment } from 'environments/environment';
import { SharedModule } from 'app/shared/shared.module';

@NgModule({
  imports: [AuthRoutingModule, Angular2SocialLoginModule],
  declarations: [AuthComponent],
  exports: [AuthComponent],
  providers: [AuthProviderService]
})
export class AuthModule { }
Angular2SocialLoginModule.loadProvidersScripts(environment.oauth.authProviders.oauth2);

