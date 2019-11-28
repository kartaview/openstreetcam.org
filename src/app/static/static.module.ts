import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TermsComponent } from './terms.component';
import { PrivacyPolicyComponent } from './privacy-policy.component';
import { StaticRoutingModule } from './static-routing.module';

import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [CommonModule, SharedModule, StaticRoutingModule],
  declarations: [TermsComponent, PrivacyPolicyComponent],
  exports: [TermsComponent, PrivacyPolicyComponent],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ],
})
export class StaticModule { }
